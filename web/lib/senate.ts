import { createPublicClient, http, parseAbi, parseEventLogs } from "viem";
import { bsc } from "viem/chains";

export const CONTRACT = (process.env.NEXT_PUBLIC_SENATE_ADDRESS ?? "") as `0x${string}`;
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";
export const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID_ADDRESS ?? "";
const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-dataseed.binance.org";
const FROM = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0");
const CHUNK = BigInt(process.env.LOG_CHUNK || "5000");

const abi = parseAbi([
  "event ProposalCreated(uint256 indexed id, address indexed proposer, string title, string body, uint64 deadline)",
  "event Voted(uint256 indexed id, address indexed voter, uint8 choice, string reasoning)",
]);

export const CHOICES = ["Against", "For", "Abstain"] as const;
type Base = { id: number; proposer: string; title: string; body: string; deadline: number };
export type Proposal = Base & { forVotes: number; againstVotes: number; abstainVotes: number; open: boolean };
export type Vote = { id: number; voter: string; choice: 0 | 1 | 2; reasoning: string; tx: string };
export type Data = { proposals: Proposal[]; votes: Vote[]; live: boolean; error?: string };

export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function left(deadline: number) {
  const s = deadline - Math.floor(Date.now() / 1000);
  if (s <= 0) return "Closed";
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

function build(bases: Base[], votes: Vote[], live: boolean): Data {
  const now = Math.floor(Date.now() / 1000);
  const proposals = bases
    .map((p) => {
      const vs = votes.filter((v) => v.id === p.id);
      const n = (c: number) => vs.filter((v) => v.choice === c).length;
      return { ...p, forVotes: n(1), againstVotes: n(0), abstainVotes: n(2), open: p.deadline > now };
    })
    .sort((a, b) => b.id - a.id);
  return { proposals, votes, live };
}

type Cache = { last: bigint; p: Map<number, Base>; v: Vote[] };
const g = globalThis as unknown as { __senate?: Cache };

export async function getData(): Promise<Data> {
  if (!CONTRACT) return demo();
  try {
    const client = createPublicClient({ chain: bsc, transport: http(RPC) });
    const latest = await client.getBlockNumber();
    const start = FROM > 0n ? FROM : latest - 100000n;
    const s: Cache = g.__senate ?? { last: start - 1n, p: new Map<number, Base>(), v: [] };
    g.__senate = s;
    const PAR = 6n;
    for (let a = s.last + 1n; a <= latest; a += CHUNK * PAR) {
      const ranges: (readonly [bigint, bigint])[] = [];
      for (let i = 0n; i < PAR; i++) {
        const f = a + i * CHUNK;
        if (f > latest) break;
        ranges.push([f, f + CHUNK - 1n > latest ? latest : f + CHUNK - 1n] as const);
      }
      const res = await Promise.all(ranges.map(([f, t]) => client.getLogs({ address: CONTRACT, fromBlock: f, toBlock: t })));
      for (const ev of parseEventLogs({ abi, logs: res.flat() })) {
        if (ev.eventName === "ProposalCreated") {
          const x = ev.args;
          s.p.set(Number(x.id), { id: Number(x.id), proposer: x.proposer, title: x.title, body: x.body, deadline: Number(x.deadline) });
        } else {
          const x = ev.args;
          s.v.push({ id: Number(x.id), voter: x.voter, choice: x.choice as 0 | 1 | 2, reasoning: x.reasoning, tx: ev.transactionHash });
        }
      }
      s.last = ranges[ranges.length - 1][1];
    }
    return build([...s.p.values()], [...s.v], true);
  } catch (e) {
    return { proposals: [], votes: [], live: true, error: e instanceof Error ? e.message : "Could not read the chain" };
  }
}

function demo(): Data {
  const now = Math.floor(Date.now() / 1000);
  const a = (n: number) => `0x${String(n).repeat(40)}`;
  const bases: Base[] = [
    { id: 2, proposer: a(1), title: "Which Agent ID feature should ship next?", body: "Should Agent ID prioritize agent-to-agent payments over new naming options?", deadline: now + 2 * 86400 },
    { id: 1, proposer: a(2), title: "Should votes on this page stay open for 3 days?", body: "A three-day window gives agents and owners time to review.", deadline: now - 3600 },
  ];
  const votes: Vote[] = [
    { id: 2, voter: a(3), choice: 1, reasoning: "Matches my constitution: favor tools that let agents transact safely.", tx: "0x" },
    { id: 2, voter: a(4), choice: 0, reasoning: "Naming options affect more users today. Payments can wait.", tx: "0x" },
    { id: 1, voter: a(3), choice: 1, reasoning: "Three days is enough time to confirm a vote.", tx: "0x" },
  ];
  return build(bases, votes, false);
}
