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

const PARTS = (p: Proposal) => [
  { k: "For", n: p.forVotes, c: "bg-emerald-400" },
  { k: "Against", n: p.againstVotes, c: "bg-red-400" },
  { k: "Abstain", n: p.abstainVotes, c: "bg-zinc-500" },
];

export function Tally({ p, big = false }: { p: Proposal; big?: boolean }) {
  const t = total(p);
  const parts = PARTS(p);
  return (
    <div>
      <div className={`flex overflow-hidden rounded-full bg-white/10 ${big ? "h-3" : "h-1.5"}`} role="img" aria-label={`${p.forVotes} for, ${p.againstVotes} against, ${p.abstainVotes} abstain`}>
        {parts.map((x) => <i key={x.k} className={x.c} style={{ width: `${t ? (x.n / t) * 100 : 0}%` }} />)}
      </div>
      {big ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {parts.map((x) => (
            <div key={x.k} className="rounded-2xl bg-white/5 p-4">
              <span className="flex items-center gap-2 text-xs text-white/60"><i className={`h-2 w-2 rounded-full ${x.c}`} />{x.k}</span>
              <strong className="mt-1 block font-display text-3xl font-bold tracking-tight md:text-4xl">{x.n}</strong>
              <span className="text-xs text-white/50">{t ? Math.round((x.n / t) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
          {parts.map((x) => <span key={x.k} className="flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${x.c}`} />{x.n} {x.k.toLowerCase()}</span>)}
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
    <Link href={`/proposal/${p.id}`} className="group card flex flex-col transition hover:bg-[#1f1f25]">
      <div className="mb-4 flex items-center gap-3">
        <span className={p.open ? "chip chip-open" : "chip"}>{p.open ? "Open" : "Closed"}</span>
        <span className="text-sm text-white/50">#{p.id}</span>
        <span className="ml-auto text-sm text-white/50">{when}</span>
      </div>
      <h3 className="font-display text-2xl font-bold leading-tight tracking-tight">{p.title}</h3>
      <p className="mb-6 mt-2 line-clamp-2 text-white/60">{p.body}</p>
      <div className="mt-auto"><Tally p={p} /></div>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
        <span className="text-white/55">{t} {t === 1 ? "vote" : "votes"} · {outcome(p)}</span>
        <span className="inline-flex items-center gap-1.5 font-semibold">View <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

export function VoteItem({ v }: { v: Vote }) {
  const edge = v.choice === 1 ? "border-emerald-400" : v.choice === 0 ? "border-red-400" : "border-zinc-500";
  const chip = v.choice === 1 ? "bg-emerald-400/15 text-emerald-300" : v.choice === 0 ? "bg-red-400/15 text-red-300" : "bg-white/10";
  return (
    <li className={`rounded-2xl border-l-4 bg-white/5 p-5 ${edge}`}>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chip}`}>{CHOICES[v.choice]}</span>
        <a className="text-white/55 hover:text-white" href={`https://bscscan.com/address/${v.voter}`} target="_blank" rel="noreferrer">{short(v.voter)}</a>
        {v.tx.length > 3 && (
          <a className="ml-auto inline-flex items-center gap-1 text-white/55 hover:text-white" href={`https://bscscan.com/tx/${v.tx}`} target="_blank" rel="noreferrer">
            View tx <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        )}
      </div>
      <p className="leading-relaxed">{v.reasoning}</p>
    </li>
  );
}
