import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc } from "viem/chains";
import { getData, RPC } from "@/lib/senate";
import { THRESHOLD_MICRO, TREASURY, USDC, client, earnedMap, erc20Abi, readPaid, usdcDecimals } from "@/lib/rewards";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const MAX_PER_RUN = 10;

// Called by Vercel Cron (see vercel.json). Pays every wallet whose unpaid rewards reached 1 USDC.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = process.env.REWARD_PAYER_PRIVATE_KEY;
  if (!key || !TREASURY) return NextResponse.json({ error: "Rewards payer is not configured." }, { status: 503 });
  const account = privateKeyToAccount(key as `0x${string}`);
  if (account.address.toLowerCase() !== TREASURY.toLowerCase()) return NextResponse.json({ error: "Payer key does not match NEXT_PUBLIC_REWARD_TREASURY." }, { status: 500 });

  const d = await getData();
  if (!d.live || d.error) return NextResponse.json({ error: "Activity data unavailable." }, { status: 502 });

  const wallet = createWalletClient({ account, chain: bsc, transport: http(RPC) });
  const mul = 10n ** BigInt((await usdcDecimals()) - 6);
  const paid = await readPaid();
  let balance = (await client.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] })) as bigint;
  const sent: { to: string; usdc: number; tx: string }[] = [];
  let skippedForBalance = 0;

  for (const [addr, e] of earnedMap(d)) {
    if (sent.length >= MAX_PER_RUN) break;
    const pending = e.micro - (paid.get(addr) ?? 0n);
    if (pending < THRESHOLD_MICRO) continue;
    const amount = pending * mul;
    if (balance < amount) { skippedForBalance++; continue; }
    const hash = await wallet.writeContract({ address: USDC, abi: erc20Abi, functionName: "transfer", args: [addr as `0x${string}`, amount] });
    const rcpt = await client.waitForTransactionReceipt({ hash });
    if (rcpt.status !== "success") continue;
    balance -= amount;
    sent.push({ to: addr, usdc: Number(pending) / 1e6, tx: hash });
  }
  return NextResponse.json({ paid: sent.length, sent, skippedForBalance });
}
