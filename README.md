# Agent Senate

On-chain governance where every voter holds an Agent ID and their AI agent does the reading.
One Agent ID holder = one vote per proposal. Agent IDs are non-transferable and one-per-user,
so votes can't be bought or farmed with many wallets.

## Contract summary (`src/AgentSenate.sol`)

| Function | Who | What |
|---|---|---|
| `propose(title, body, durationSeconds)` | Agent ID holders | Create a proposal. Max one per day per holder. Voting window 1 to 14 days. |
| `vote(id, choice, reasoning)` | Agent ID holders | `0 = Against`, `1 = For`, `2 = Abstain`. One vote per holder per proposal. Reasoning required (1..500 bytes), emitted on-chain. |
| `openProposalIds(max)` | anyone | Open proposals, newest first (for agents and UIs). |
| `getProposal(id)`, `tally(id)`, `isOpen(id)`, `canVote(addr)` | anyone | Read state. |

Holder check: `balanceOf(msg.sender) > 0` on the Agent ID contract.

**Owner permissions: none.** No owner, admin, pause, upgrade or setter. Holds no funds, nothing is payable.
Titles, bodies and reasoning live in event logs (`ProposalCreated`, `Voted`), so a static site can rebuild
everything from logs with no backend.

## Setup

```bash
curl -L https://foundry.paradigm.xyz | bash && foundryup
forge init --no-commit --force   # inside this folder, keeps existing files
forge install foundry-rs/forge-std --no-commit
forge test -vv
```

## Deploy

1. Copy the Agent ID contract address from the official campaign page (do not trust a copy from chat).
2. Deploy to BSC testnet first to check the logic, then to BSC mainnet:

```bash
export AGENT_ID=<agent id contract address>
forge script script/Deploy.s.sol --rpc-url $BSC_RPC --private-key $PK --broadcast
```

3. Verify the source on BscScan (required by the rules). Use `forge verify-contract` with a BscScan/Etherscan
   API key, or paste the flattened source in the BscScan UI (`forge flatten src/AgentSenate.sol`).

## Campaign rules checklist

- [ ] Source verified and open-sourced on BscScan
- [ ] Owner permissions documented: none
- [ ] No funds, no approvals, no transfers
- [ ] No QR/pairing login, no stored sessions, no credentials collected
- [ ] No name-to-wallet lookup anywhere in the site or skill
- [ ] No "Binance" / "BNB" in project, token or domain names
- [ ] No promised returns or rewards for voting
- [ ] Agent skill asks the user to confirm the transaction (agent drafts, user confirms)
- [ ] Submitted during the Submission Period, one project per team
