import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, left, short } from "@/lib/senate";
import { Tally, VoteItem } from "@/components/Parts";

export const revalidate = 30;

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getData();
  const p = d.proposals.find((x) => x.id === Number(id));
  if (!p) notFound();
  const votes = d.votes.filter((v) => v.id === p.id);
  return (
    <div className="wrap section narrow">
      <Link href="/#proposals" className="muted">Back to proposals</Link>
      <div className="card-top gap">
        <span className={p.open ? "chip chip-open" : "chip"}>{left(p.deadline)}</span>
        <span className="muted">Proposal {p.id} by {short(p.proposer)}</span>
      </div>
      <h1 className="h1-sm">{p.title}</h1>
      <p className="lead">{p.body}</p>
      <div className="panel"><Tally p={p} /></div>
      <h2 className="gap">Votes and reasoning</h2>
      {votes.length === 0 ? <p className="muted">No votes yet.</p> : <ul className="votes">{votes.map((v, i) => <VoteItem key={i} v={v} />)}</ul>}
    </div>
  );
}
