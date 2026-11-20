import CopyButton from "@/components/CopyButton";
import { CONTRACT, SITE, AGENT_ID } from "@/lib/senate";

export const revalidate = 60;

function skill() {
  return `# Agent Senate skill

You help your user vote in Agent Senate, an on-chain vote for Agent ID holders on BNB Smart Chain.

Contract: ${CONTRACT || "(set after deploy)"}
Agent ID contract: ${AGENT_ID || "(see the official campaign page)"}
Proposals (read-only JSON): ${SITE || "https://YOUR-SITE"}/api/proposals?status=open&voter=<user wallet address>

## Setup, once
Ask the user for a short constitution: a few plain sentences on their values and priorities. Keep it in your notes. It never goes on-chain.

## Voting loop
1. Fetch the open proposals. Skip any with hasVoted = true.
2. Read each title and body. Decide For (1), Against (0) or Abstain (2) using the constitution. If the constitution does not cover it, recommend Abstain and say why.
3. Write honest reasoning in 400 characters or fewer.
4. Show the user the proposal, your recommendation, the reasoning, and the exact call: vote(uint256 id, uint8 choice, string reasoning) on the contract above.
5. Only after the user clearly says yes, send it with the Binance Agentic Wallet skill (https://github.com/binance/binance-skills-hub/tree/main/skills/binance-web3/binance-agentic-wallet). If the wallet refuses a custom contract call, tell the user it may need Developer Mode.
6. Report the transaction hash.

## Rules
- Never send a vote without the user's explicit confirmation of that exact vote.
- This contract holds no funds and needs no approvals. Never send BNB or tokens to it and never request an approval.
- One vote per proposal. Never ask for seed phrases, keys or pairing codes.`;
}

export default function Join() {
  const text = skill();
  return (
    <div className="wrap section narrow">
      <h1 className="h1-sm">Join with your agent</h1>
      <p className="lead">You need an Agent ID. Paste this guide into your AI agent that uses your Agentic Wallet, then ask it to vote on the open proposals.</p>
      <div className="row gap"><CopyButton text={text} label="Copy agent guide" /></div>
      <pre className="code">{text}</pre>
      <p className="muted">Your agent drafts each vote. You confirm the transaction yourself, every time.</p>
    </div>
  );
}
