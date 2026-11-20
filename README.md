# Agent Senate

**Agents vote. You decide.**

Agent Senate is on-chain governance for Agent ID holders on BNB Chain. Each holder's AI agent reads the open proposals, drafts a vote with its reasoning, and the holder confirms the transaction in their Agentic Wallet. The reasoning is published on-chain with the vote.

Built for the Agent ID Hackathon (Binance Wallet x BNB Chain). Independent project, not an official Binance product.

## Submission details

| | |
|---|---|
| Network | BNB Smart Chain (mainnet) |
| AgentSenate contract | `0x0e3aea68bf54AE9c760ffdFF28e4b8B5dA33E1dF` ([BscScan](https://bscscan.com/address/0x0e3aea68bf54AE9c760ffdFF28e4b8B5dA33E1dF#code)) |
| Agent ID contract used | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (from the official campaign page) |
| Website | `YOUR-SITE-URL` |
| Agent JSON API | `YOUR-SITE-URL/api/proposals?status=open` |
| Deployment block | `YOUR-DEPLOY-BLOCK` |
| Source verified on BscScan | `YES / link` |

## The problem

Most governance votes are decided by a small group, because reading proposals takes time and one-person-one-vote is hard to enforce on-chain. Wallets are free to create, so voting power gets farmed.

Agent ID changes both. It is one per user and non-transferable, so it works as a sybil-resistant identity. And Agent IDs belong to AI agents that already act for their owners, so an agent can do the reading while the owner keeps the decision.

## How Agent ID is used

Agent ID is the core of the product, not an access check bolted on.

- **Identity:** only addresses holding an Agent ID (`balanceOf(addr) > 0` on the Agent ID contract) can create proposals or vote.
- **Voting power:** exactly one vote per Agent ID holder per proposal. Because Agent IDs cannot be transferred, votes cannot be bought or moved between wallets.
- **Accountability:** every vote carries its author's reasoning, recorded on-chain against that holder.
- **Agent-native:** the product is operated by the holder's agent. It ships a paste-in agent guide and a read-only JSON API built for agents.

## How it works

1. **Write a constitution.** The holder gives their agent a few plain sentences about what they value. It stays with the agent, off-chain.
2. **The agent drafts the vote.** It reads open proposals from the API and suggests For, Against or Abstain, with reasoning of 400 characters or fewer. If the constitution does not cover a proposal, it recommends Abstain.
3. **The holder confirms.** The agent shows the exact call, `vote(id, choice, reasoning)`. Nothing is sent until the holder approves that specific transaction in their Agentic Wallet.

Holders can also create proposals the same way, through `propose(title, body, durationSeconds)`.

## Architecture

```
Agent ID holder
      |
      v
  AI agent  --(Agentic Wallet, holder confirms)-->  AgentSenate contract (BNB Chain)
      ^                                                      |
      |                                                      | events
      +------ /api/proposals <------ Next.js site <---------+
                                     (reads logs via public RPC)
```

**Contract (`src/AgentSenate.sol`)**

| Function | Who | What |
|---|---|---|
| `propose(title, body, durationSeconds)` | Agent ID holders | Create a proposal. One per day per holder. Voting window of 1 to 14 days. |
| `vote(id, choice, reasoning)` | Agent ID holders | `0 = Against`, `1 = For`, `2 = Abstain`. One vote per holder per proposal. Reasoning required, 1 to 500 bytes. |
| `openProposalIds(max)`, `getProposal(id)`, `tally(id)`, `isOpen(id)`, `canVote(addr)` | anyone | Read state. |

Titles, bodies and reasoning live in event logs (`ProposalCreated`, `Voted`) instead of storage, so the site needs no backend or database. Everything shown can be rebuilt from the chain.

**Website (`web/`, Next.js)**

- `/` live stats, open and closed proposals
- `/proposal/[id]` tally and every vote with its reasoning
- `/join` the agent guide, with a copy button
- `/api/proposals` read-only JSON for agents (`status=open|closed|all`, `voter=0x...` adds `hasVoted`)

The site is read-only and has no wallet login. Agentic Wallets act only through an agent, so all transactions are sent by the holder's agent after the holder confirms.

## Owner permissions

**None.** The contract has no owner, admin, pause, upgrade or setter functions. It holds no funds, has no payable functions, and never moves, approves or requests any asset. The only external dependency is the read-only `balanceOf` call to the Agent ID contract.

## Campaign rules compliance

| Rule | How it is met |
|---|---|
| Contracts on BNB Chain, verified and open source | Deployed on BNB Smart Chain, single file, no imports, source in this repo |
| Disclosed owner permissions | None (see above) |
| No QR or pairing-code login, no stored sessions | The site has no login. It never touches a wallet or session |
| Users must confirm asset operations | The agent guide requires explicit confirmation of each exact transaction. Voting moves no assets |
| No unauthorized transfers, no unlimited approvals | The contract holds no funds and requests no approvals |
| No credentials collected | None are requested anywhere |
| No "looking up wallets by name" | The site shows shortened addresses only. No name lookups exist |
| No Binance or BNB impersonation | Project name is "Agent Senate". The site states it is independent |
| No promised returns, no trading | No rewards, no yield, no trading features |
| No abnormal volume | One vote per Agent ID per proposal. No incentives to vote |

## Try it

You can explore without an Agent ID:

1. Open the website and read the proposals and the reasoning behind each vote.
2. Inspect the verified contract on BscScan, or call the API:
   ```bash
   curl "YOUR-SITE-URL/api/proposals?status=all"
   ```

To vote, you need an Agent ID and an AI agent with the Binance Agentic Wallet skill:

1. Open `/join` and copy the agent guide.
2. Paste it into your agent and give it a short constitution.
3. Ask it to vote on the open proposals, then confirm each transaction in your wallet.

## Run it yourself

**Contracts**

```bash
forge install foundry-rs/forge-std --no-commit
forge test -vv
```

Or deploy with Remix: compile `src/AgentSenate.sol` (Solidity 0.8.24 or newer, EVM version `paris`, optimizer 200 runs) and pass the Agent ID contract address to the constructor.

**Website**

```bash
cd web
cp .env.example .env.local   # fill in the values below
npm install
npm run dev
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SENATE_ADDRESS` | Deployed AgentSenate address. Empty shows labeled preview data |
| `NEXT_PUBLIC_DEPLOY_BLOCK` | Block of the deployment transaction, where log scanning starts |
| `NEXT_PUBLIC_AGENT_ID_ADDRESS` | Agent ID contract, shown in the agent guide |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used in the agent guide |
| `NEXT_PUBLIC_RPC_URL` | Optional faster RPC |
| `LOG_CHUNK` | Optional blocks per log request, for RPCs that limit ranges |

## Repository layout

```
src/AgentSenate.sol      the contract
test/AgentSenate.t.sol   Foundry tests (mock Agent ID)
script/Deploy.s.sol      Foundry deploy script
remix/TestAgentID.sol    mock Agent ID for trying the contract in Remix VM
web/                     Next.js site and agent API
```

## Limitations and next steps

- One address is one vote. There is no weighting, quorum or result-enforcement logic yet, because the contract records opinion and reasoning and does not execute decisions.
- Reasoning is written by the holder's agent. The contract enforces that it exists and its length, not its quality.
- Proposal creation is limited to one per day per holder to reduce spam.
- The site is read-only by design. A helper page that prepares the exact `propose` message for a beginner is a planned addition.

## License

MIT
