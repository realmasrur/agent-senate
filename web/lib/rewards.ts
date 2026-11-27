import { createPublicClient, http, parseAbi, parseAbiItem } from "viem";
import { bsc } from "viem/chains";
import { CHUNK, FROM, RPC, type Data } from "./senate";

// All amounts are integers in micro-USDC (1 USDC = 1_000_000) to avoid float errors.
export const VOTE_MICRO = 10_000n; // $0.01 per vote
export const PROPOSAL_MICRO = 30_000n; // $0.03 per proposal
export const THRESHOLD_MICRO = 1_000_000n; // auto-pay at $1.00
export const USDC = (process.env.REWARD_USDC_ADDRESS || "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d") as `0x${string}`;
export const TREASURY = (process.env.NEXT_PUBLIC_REWARD_TREASURY || "") as `0x${string}`;

export const client = createPublicClient({ chain: bsc, transport: http(RPC) });
const erc20 = parseAbi(["function decimals() view returns (uint8)", "function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"]);
export const erc20Abi = erc20;
const TRANSFER = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

let dec: number | null = null;
export async function usdcDecimals() {
  if (dec == null) dec = Number(await client.readContract({ address: USDC, abi: erc20, functionName: "decimals" }));
  return dec;
}

export type Earned = { votes: number; proposals: number; micro: bigint };

export function earnedMap(d: Data) {
  const m = new Map<string, Earned>();
  const get = (a: string) => {
    const k = a.toLowerCase();
    if (!m.has(k)) m.set(k, { votes: 0, proposals: 0, micro: 0n });
    return m.get(k)!;
  };
  for (const v of d.votes) { const e = get(v.voter); e.votes++; e.micro += VOTE_MICRO; }
  for (const p of d.proposals) { const e = get(p.proposer); e.proposals++; e.micro += PROPOSAL_MICRO; }
  return m;
}

// "Paid so far" is read from the chain: USDC transfers from the treasury to each wallet. No database needed.
type PaidCache = { last: bigint; m: Map<string, bigint> };
const g = globalThis as unknown as { __paid?: PaidCache };

export async function readPaid(): Promise<Map<string, bigint>> {
  if (!TREASURY) return new Map();
  const div = 10n ** BigInt((await usdcDecimals()) - 6);
  const latest = await client.getBlockNumber();
  const start = FROM > 0n ? FROM : latest - 100000n;
  const s: PaidCache = g.__paid ?? { last: start - 1n, m: new Map() };
  g.__paid = s;
  const PAR = 6n;
  for (let a = s.last + 1n; a <= latest; a += CHUNK * PAR) {
    const ranges: (readonly [bigint, bigint])[] = [];
    for (let i = 0n; i < PAR; i++) {
      const f = a + i * CHUNK;
      if (f > latest) break;
      ranges.push([f, f + CHUNK - 1n > latest ? latest : f + CHUNK - 1n] as const);
    }
    const res = await Promise.all(ranges.map(([f, t]) => client.getLogs({ address: USDC, event: TRANSFER, args: { from: TREASURY }, fromBlock: f, toBlock: t })));
    for (const l of res.flat()) {
      const to = (l.args.to as string).toLowerCase();
      s.m.set(to, (s.m.get(to) ?? 0n) + (l.args.value as bigint) / div);
    }
    s.last = ranges[ranges.length - 1][1];
  }
  return s.m;
}
