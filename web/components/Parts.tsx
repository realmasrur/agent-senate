import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CHOICES, left, short, type Proposal, type Vote } from "@/lib/senate";

export const total = (p: Proposal) => p.forVotes + p.againstVotes + p.abstainVotes;

export function outcome(p: Proposal) {
  if (total(p) === 0) return p.open ? "No votes yet" : "No votes";
  const rows: [string, number][] = [["For", p.forVotes], ["Against", p.againstVotes], ["Abstain", p.abstainVotes]];
  const max = Math.max(...rows.map((r) => r[1]));
  const top = rows.filter((r) => r[1] === max);
  if (top.length > 1) return "Tied";
  return `${p.open ? "Leading" : "Final"}: ${top[0][0]}`;
}

export function Tally({ p, big = false }: { p: Proposal; big?: boolean }) {
  const t = total(p);
  const parts = [
    { k: "For", n: p.forVotes, c: "var(--ok)" },
    { k: "Against", n: p.againstVotes, c: "var(--bad)" },
    { k: "Abstain", n: p.abstainVotes, c: "#8a8a8a" },
  ];
  return (
    <div>
      <div className={big ? "bar bar-big" : "bar"} role="img" aria-label={`${p.forVotes} for, ${p.againstVotes} against, ${p.abstainVotes} abstain`}>
        {parts.map((x) => (
          <i key={x.k} style={{ width: `${t ? (x.n / t) * 100 : 0}%`, background: x.c }} />
        ))}
      </div>
      {big ? (
        <div className="result-grid">
          {parts.map((x) => (
            <div key={x.k}>
              <span className="legend-k"><i className="sw" style={{ background: x.c }} />{x.k}</span>
              <strong>{x.n}</strong>
              <span className="muted mono">{t ? Math.round((x.n / t) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="legend">
          {parts.map((x) => (
            <span key={x.k}><i className="sw" style={{ background: x.c }} />{x.n} {x.k.toLowerCase()}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Card({ p }: { p: Proposal }) {
  const t = total(p);
  const when = p.open
    ? left(p.deadline)
    : `Ended ${new Date(p.deadline * 1000).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" })}`;
  return (
    <Link href={`/proposal/${p.id}`} className="card pcard">
      <div className="card-top">
        <span className={p.open ? "chip chip-open" : "chip"}>{p.open ? "Open" : "Closed"}</span>
        <span className="muted mono">#{p.id}</span>
        <span className="muted mono push">{when}</span>
      </div>
      <h3>{p.title}</h3>
      <p className="clamp">{p.body}</p>
      <Tally p={p} />
      <div className="card-foot">
        <span className="muted mono">{t} {t === 1 ? "vote" : "votes"}, {outcome(p)}</span>
        <span className="more">View details <ArrowRight size={14} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

export function VoteItem({ v }: { v: Vote }) {
  const tone = v.choice === 1 ? "vote vote-for" : v.choice === 0 ? "vote vote-against" : "vote";
  const chip = v.choice === 1 ? "chip chip-for" : v.choice === 0 ? "chip chip-against" : "chip";
  return (
    <li className={tone}>
      <div className="vote-top">
        <span className={chip}>{CHOICES[v.choice]}</span>
        <a className="muted mono" href={`https://bscscan.com/address/${v.voter}`} target="_blank" rel="noreferrer">{short(v.voter)}</a>
        {v.tx.length > 3 && (
          <a className="muted mono push link-ext" href={`https://bscscan.com/tx/${v.tx}`} target="_blank" rel="noreferrer">
            View tx <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        )}
      </div>
      <p className="vote-text">{v.reasoning}</p>
    </li>
  );
}
