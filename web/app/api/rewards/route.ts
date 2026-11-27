import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { getData } from "@/lib/senate";
import { THRESHOLD_MICRO, TREASURY, earnedMap, readPaid } from "@/lib/rewards";

export const dynamic = "force-dynamic";
const usd = (m: bigint) => Number(m) / 1e6;

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("address")?.trim() ?? "";
  if (!isAddress(address)) return NextResponse.json({ error: "Enter a valid wallet address starting with 0x." }, { status: 400 });
  const d = await getData();
  if (d.error) return NextResponse.json({ error: "Could not read Agent Senate activity right now. Try again shortly." }, { status: 502 });
  let paid = 0n;
  try {
    paid = (await readPaid()).get(address.toLowerCase()) ?? 0n;
  } catch {
    return NextResponse.json({ error: "Could not read payout history right now. Try again shortly." }, { status: 502 });
  }
  const e = earnedMap(d).get(address.toLowerCase()) ?? { votes: 0, proposals: 0, micro: 0n };
  const pending = e.micro > paid ? e.micro - paid : 0n;
  return NextResponse.json({
    address, votes: e.votes, proposals: e.proposals,
    earned: usd(e.micro), paid: usd(paid), pending: usd(pending),
    threshold: usd(THRESHOLD_MICRO), toNext: usd(pending >= THRESHOLD_MICRO ? 0n : THRESHOLD_MICRO - pending),
    payoutsLive: Boolean(TREASURY), preview: !d.live,
  });
}
