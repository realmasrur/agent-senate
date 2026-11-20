import { NextResponse } from "next/server";
import { getData, CONTRACT } from "@/lib/senate";

export const dynamic = "force-dynamic";

// GET /api/proposals?status=open|closed|all&voter=0x...
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const status = q.get("status") ?? "all";
  const voter = q.get("voter")?.toLowerCase();
  const d = await getData();
  const voted = new Set(d.votes.filter((v) => voter && v.voter.toLowerCase() === voter).map((v) => v.id));
  const proposals = d.proposals
    .filter((p) => (status === "open" ? p.open : status === "closed" ? !p.open : true))
    .map((p) => ({ ...p, hasVoted: voter ? voted.has(p.id) : undefined }));
  return NextResponse.json({ contract: CONTRACT, choices: { against: 0, for: 1, abstain: 2 }, proposals });
}
