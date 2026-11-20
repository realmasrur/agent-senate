// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentSenate} from "../src/AgentSenate.sol";

/// @dev Stand-in for the real Agent ID: only exposes balanceOf.
contract MockAgentID {
    mapping(address => uint256) public balanceOf;

    function mint(address to) external {
        balanceOf[to] = 1;
    }
}

contract AgentSenateTest is Test {
    AgentSenate senate;
    MockAgentID agentId;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address carol = address(0xCA201); // holder
    address outsider = address(0xBAD); // no Agent ID

    function setUp() public {
        agentId = new MockAgentID();
        senate = new AgentSenate(address(agentId));
        agentId.mint(alice);
        agentId.mint(bob);
        agentId.mint(carol);
        vm.warp(1_700_000_000);
    }

    function _propose(address who) internal returns (uint256) {
        vm.prank(who);
        return senate.propose("Ship feature X?", "Should Agent ID ship feature X next?", 3 days);
    }

    // ---------- constructor ----------

    function test_constructor_rejectsZeroAndNonContract() public {
        vm.expectRevert(AgentSenate.InvalidAgentIdAddress.selector);
        new AgentSenate(address(0));
        vm.expectRevert(AgentSenate.InvalidAgentIdAddress.selector);
        new AgentSenate(address(0x1234)); // no code
    }

    // ---------- gating ----------

    function test_propose_onlyHolders() public {
        vm.prank(outsider);
        vm.expectRevert(AgentSenate.NotAgentIdHolder.selector);
        senate.propose("t", "b", 1 days);
    }

    function test_vote_onlyHolders() public {
        uint256 id = _propose(alice);
        vm.prank(outsider);
        vm.expectRevert(AgentSenate.NotAgentIdHolder.selector);
        senate.vote(id, AgentSenate.Choice.For, "because");
    }

    // ---------- propose ----------

    function test_propose_createsProposalAndEmits() public {
        vm.expectEmit(true, true, false, true);
        emit AgentSenate.ProposalCreated(1, alice, "Ship feature X?", "Body text", uint64(block.timestamp + 3 days));
        vm.prank(alice);
        uint256 id = senate.propose("Ship feature X?", "Body text", 3 days);

        assertEq(id, 1);
        assertEq(senate.proposalCount(), 1);
        AgentSenate.Proposal memory p = senate.getProposal(1);
        assertEq(p.proposer, alice);
        assertEq(p.deadline, uint64(block.timestamp + 3 days));
        assertTrue(senate.isOpen(1));
    }

    function test_propose_cooldownOnePerDay() public {
        _propose(alice);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(AgentSenate.CooldownActive.selector, uint64(block.timestamp + 1 days))
        );
        senate.propose("again", "again", 1 days);

        // another holder is unaffected
        _propose(bob);

        // after a day alice can propose again
        vm.warp(block.timestamp + 1 days);
        _propose(alice);
        assertEq(senate.proposalCount(), 3);
    }

    function test_propose_validatesInput() public {
        vm.startPrank(alice);

        vm.expectRevert(AgentSenate.EmptyText.selector);
        senate.propose("", "b", 1 days);

        vm.expectRevert(AgentSenate.EmptyText.selector);
        senate.propose("t", "", 1 days);

        vm.expectRevert(AgentSenate.BadDuration.selector);
        senate.propose("t", "b", 1 days - 1);

        vm.expectRevert(AgentSenate.BadDuration.selector);
        senate.propose("t", "b", 14 days + 1);

        vm.expectRevert(AgentSenate.TextTooLong.selector);
        senate.propose(_repeat("a", 121), "b", 1 days);

        vm.expectRevert(AgentSenate.TextTooLong.selector);
        senate.propose("t", _repeat("a", 1001), 1 days);

        vm.stopPrank();
    }

    // ---------- vote ----------

    function test_vote_countsAndEmitsReasoning() public {
        uint256 id = _propose(alice);

        vm.expectEmit(true, true, false, true);
        emit AgentSenate.Voted(id, alice, AgentSenate.Choice.For, "Matches my constitution");
        vm.prank(alice);
        senate.vote(id, AgentSenate.Choice.For, "Matches my constitution");

        vm.prank(bob);
        senate.vote(id, AgentSenate.Choice.Against, "Too risky");

        vm.prank(carol);
        senate.vote(id, AgentSenate.Choice.Abstain, "Not enough info");

        (uint32 f, uint32 a, uint32 ab) = senate.tally(id);
        assertEq(f, 1);
        assertEq(a, 1);
        assertEq(ab, 1);
        assertTrue(senate.hasVoted(id, alice));
    }

    function test_vote_onlyOncePerProposal() public {
        uint256 id = _propose(alice);
        vm.startPrank(alice);
        senate.vote(id, AgentSenate.Choice.For, "yes");
        vm.expectRevert(AgentSenate.AlreadyVoted.selector);
        senate.vote(id, AgentSenate.Choice.Against, "changed my mind");
        vm.stopPrank();
    }

    function test_vote_requiresReasoningWithinLimit() public {
        uint256 id = _propose(alice);
        vm.startPrank(alice);
        vm.expectRevert(AgentSenate.EmptyText.selector);
        senate.vote(id, AgentSenate.Choice.For, "");
        vm.expectRevert(AgentSenate.TextTooLong.selector);
        senate.vote(id, AgentSenate.Choice.For, _repeat("a", 501));
        senate.vote(id, AgentSenate.Choice.For, _repeat("a", 500)); // boundary ok
        vm.stopPrank();
    }

    function test_vote_closedAfterDeadline() public {
        uint256 id = _propose(alice);
        vm.warp(block.timestamp + 3 days);
        assertFalse(senate.isOpen(id));
        vm.prank(bob);
        vm.expectRevert(AgentSenate.VotingClosed.selector);
        senate.vote(id, AgentSenate.Choice.For, "late");
    }

    function test_vote_unknownProposal() public {
        vm.prank(alice);
        vm.expectRevert(AgentSenate.ProposalNotFound.selector);
        senate.vote(42, AgentSenate.Choice.For, "x");
        vm.expectRevert(AgentSenate.ProposalNotFound.selector);
        senate.getProposal(42);
        vm.expectRevert(AgentSenate.ProposalNotFound.selector);
        senate.tally(42);
    }

    // ---------- views ----------

    function test_openProposalIds_newestFirstAndSkipsClosed() public {
        _propose(alice); // id 1, 3 days
        vm.prank(bob);
        senate.propose("short", "short body", 1 days); // id 2, 1 day
        _propose(carol); // id 3, 3 days

        vm.warp(block.timestamp + 1 days + 1); // id 2 closes

        uint256[] memory ids = senate.openProposalIds(10);
        assertEq(ids.length, 2);
        assertEq(ids[0], 3);
        assertEq(ids[1], 1);

        uint256[] memory limited = senate.openProposalIds(1);
        assertEq(limited.length, 1);
        assertEq(limited[0], 3);
    }

    function test_canVote() public view {
        assertTrue(senate.canVote(alice));
        assertFalse(senate.canVote(outsider));
    }

    // ---------- no funds ----------

    function test_rejectsEther() public {
        (bool ok,) = address(senate).call{value: 1 ether}("");
        assertFalse(ok);
    }

    // ---------- helpers ----------

    function _repeat(string memory s, uint256 n) internal pure returns (string memory) {
        bytes memory unit = bytes(s);
        bytes memory out = new bytes(unit.length * n);
        for (uint256 i; i < n; i++) {
            for (uint256 j; j < unit.length; j++) {
                out[i * unit.length + j] = unit[j];
            }
        }
        return string(out);
    }
}
