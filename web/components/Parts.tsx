import Link from "next/link";
import { CHOICES, left, short, type Proposal, type Vote } from "@/lib/senate";

export function Tally({ p }: { p: Proposal }) {
  const t = p.forVotes + p.againstVotes + p.abstainVotes;
  const w = (n: number) => `${t ? (n / t) * 100 : 0}%`;
  return (
    <div>
      <div className="bar" role="img" aria-label={`${p.forVotes} for, ${p.againstVotes} against, ${p.abstainVotes} abstain`}>
        <i style={{ width: w(p.forVotes), background: "var(--ok)" }} />
        <i style={{ width: w(p.againstVotes), background: "var(--bad)" }} />
        <i style={{ width: w(p.abstainVotes), background: "#b4b9cc" }} />
      </div>
      <div className="tally">
        <span>{p.forVotes} for</span>
        <span>{p.againstVotes} against</span>
        <span>{p.abstainVotes} abstain</span>
      </div>
    </div>
  );
}

export function Card({ p }: { p: Proposal }) {
  return (
    <Link href={`/proposal/${p.id}`} className="card">
      <div className="card-top">
        <span className={p.open ? "chip chip-open" : "chip"}>{left(p.deadline)}</span>
        <span className="muted">Proposal {p.id}</span>
      </div>
      <h3>{p.title}</h3>
      <p className="clamp">{p.body}</p>
      <Tally p={p} />
    </Link>
  );
}

export function VoteItem({ v }: { v: Vote }) {
  const cls = v.choice === 1 ? "chip chip-for" : v.choice === 0 ? "chip chip-against" : "chip";
  return (
    <li className="vote">
      <div className="card-top">
        <span className={cls}>{CHOICES[v.choice]}</span>
        <span className="muted mono">{short(v.voter)}</span>
        {v.tx.length > 3 && (
          <a className="muted" href={`https://bscscan.com/tx/${v.tx}`} target="_blank" rel="noreferrer">
            View on BscScan
          </a>
        )}
      </div>
      <p>{v.reasoning}</p>
    </li>
  );
}
