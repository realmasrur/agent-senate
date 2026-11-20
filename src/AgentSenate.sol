// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal view of the Agent ID contract (ERC-721, non-transferable).
interface IAgentID {
    function balanceOf(address owner) external view returns (uint256);
}

/// @title Agent Senate
/// @notice On-chain governance where every voter holds an Agent ID. One holder
///         address = one vote per proposal. Because Agent IDs are non-transferable
///         and one-per-user, votes cannot be bought or farmed with many wallets.
///
/// @dev OWNER PERMISSIONS: NONE.
///      - No owner, admin, pause, upgrade or parameter-setting functions.
///      - Holds no funds: nothing is payable and there is no withdraw path.
///      - Never moves, approves or requests any user asset.
///      The only trusted external dependency is the Agent ID contract, used for
///      the read-only `balanceOf` holder check.
///
///      Text (titles, bodies, reasoning) is emitted in events rather than stored,
///      so no backend is needed: a website can rebuild everything from logs.
contract AgentSenate {
    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/

    enum Choice {
        Against, // 0
        For, // 1
        Abstain // 2
    }

    struct Proposal {
        address proposer;
        uint64 createdAt;
        uint64 deadline;
        uint32 forVotes;
        uint32 againstVotes;
        uint32 abstainVotes;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint64 public constant MIN_DURATION = 1 days;
    uint64 public constant MAX_DURATION = 14 days;
    uint256 public constant PROPOSAL_COOLDOWN = 1 days;

    uint256 public constant MAX_TITLE_BYTES = 120;
    uint256 public constant MAX_BODY_BYTES = 1000;
    uint256 public constant MAX_REASONING_BYTES = 500;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    IAgentID public immutable agentId;

    /// @notice Number of proposals created. Proposal ids start at 1.
    uint256 public proposalCount;

    mapping(uint256 => Proposal) private _proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint64) public lastProposalAt;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event ProposalCreated(
        uint256 indexed id, address indexed proposer, string title, string body, uint64 deadline
    );

    event Voted(uint256 indexed id, address indexed voter, Choice choice, string reasoning);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotAgentIdHolder();
    error InvalidAgentIdAddress();
    error CooldownActive(uint64 nextAllowedAt);
    error BadDuration();
    error EmptyText();
    error TextTooLong();
    error ProposalNotFound();
    error VotingClosed();
    error AlreadyVoted();

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address agentId_) {
        if (agentId_ == address(0) || agentId_.code.length == 0) revert InvalidAgentIdAddress();
        agentId = IAgentID(agentId_);
    }

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyAgentIdHolder() {
        if (agentId.balanceOf(msg.sender) == 0) revert NotAgentIdHolder();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              WRITE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a proposal. Agent ID holders only, one per day each.
    /// @param title Short headline (1..120 bytes).
    /// @param body Full proposal text (1..1000 bytes).
    /// @param durationSeconds Voting window, between 1 and 14 days.
    function propose(string calldata title, string calldata body, uint64 durationSeconds)
        external
        onlyAgentIdHolder
        returns (uint256 id)
    {
        uint256 titleLen = bytes(title).length;
        uint256 bodyLen = bytes(body).length;
        if (titleLen == 0 || bodyLen == 0) revert EmptyText();
        if (titleLen > MAX_TITLE_BYTES || bodyLen > MAX_BODY_BYTES) revert TextTooLong();
        if (durationSeconds < MIN_DURATION || durationSeconds > MAX_DURATION) revert BadDuration();

        uint64 last = lastProposalAt[msg.sender];
        if (last != 0 && block.timestamp < uint256(last) + PROPOSAL_COOLDOWN) {
            revert CooldownActive(uint64(uint256(last) + PROPOSAL_COOLDOWN));
        }

        uint64 nowTs = uint64(block.timestamp);
        uint64 deadline = nowTs + durationSeconds;

        id = ++proposalCount;
        _proposals[id] = Proposal({
            proposer: msg.sender,
            createdAt: nowTs,
            deadline: deadline,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0
        });
        lastProposalAt[msg.sender] = nowTs;

        emit ProposalCreated(id, msg.sender, title, body, deadline);
    }

    /// @notice Cast one vote per proposal. Reasoning is required (1..500 bytes)
    ///         and is emitted on-chain so anyone can audit why a vote was cast.
    function vote(uint256 id, Choice choice, string calldata reasoning)
        external
        onlyAgentIdHolder
    {
        Proposal storage p = _proposals[id];
        if (p.proposer == address(0)) revert ProposalNotFound();
        if (block.timestamp >= p.deadline) revert VotingClosed();
        if (hasVoted[id][msg.sender]) revert AlreadyVoted();

        uint256 reasonLen = bytes(reasoning).length;
        if (reasonLen == 0) revert EmptyText();
        if (reasonLen > MAX_REASONING_BYTES) revert TextTooLong();

        hasVoted[id][msg.sender] = true;

        if (choice == Choice.For) {
            p.forVotes += 1;
        } else if (choice == Choice.Against) {
            p.againstVotes += 1;
        } else {
            p.abstainVotes += 1;
        }

        emit Voted(id, msg.sender, choice, reasoning);
    }

    /*//////////////////////////////////////////////////////////////
                               VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getProposal(uint256 id) external view returns (Proposal memory) {
        Proposal memory p = _proposals[id];
        if (p.proposer == address(0)) revert ProposalNotFound();
        return p;
    }

    function tally(uint256 id)
        external
        view
        returns (uint32 forVotes, uint32 againstVotes, uint32 abstainVotes)
    {
        Proposal storage p = _proposals[id];
        if (p.proposer == address(0)) revert ProposalNotFound();
        return (p.forVotes, p.againstVotes, p.abstainVotes);
    }

    function isOpen(uint256 id) external view returns (bool) {
        Proposal storage p = _proposals[id];
        return p.proposer != address(0) && block.timestamp < p.deadline;
    }

    /// @notice Convenience for agents and UIs: ids of proposals still open.
    ///         Scans backwards and stops at `max` results.
    function openProposalIds(uint256 max) external view returns (uint256[] memory ids) {
        uint256[] memory tmp = new uint256[](max);
        uint256 n;
        for (uint256 i = proposalCount; i > 0 && n < max; i--) {
            if (block.timestamp < _proposals[i].deadline) {
                tmp[n++] = i;
            }
        }
        ids = new uint256[](n);
        for (uint256 j; j < n; j++) {
            ids[j] = tmp[j];
        }
    }

    /// @notice Whether an address could vote right now (holds an Agent ID).
    function canVote(address account) external view returns (bool) {
        return agentId.balanceOf(account) > 0;
    }
}
