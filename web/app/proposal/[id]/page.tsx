import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { CONTRACT, fmtDate, getData, left, short } from "@/lib/senate";
import { Tally, VoteItem, outcome, total } from "@/components/Parts";

export const revalidate = 30;

const FILTERS: { k: string; label: string; c?: 0 | 1 | 2 }[] = [
  { k: "all", label: "All" },
  { k: "for", label: "For", c: 1 },
  { k: "against", label: "Against", c: 0 },
  { k: "abstain", label: "Abstain", c: 2 },
];

export default async function ProposalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const { filter } = await searchParams;
  const d = await getData();
  const p = d.proposals.find((x) => x.id === Number(id));
  if (!p) notFound();

  const active = FILTERS.find((f) => f.k === filter) ?? FILTERS[0];
  const all = d.votes.filter((v) => v.id === p.id).reverse();
  const shown = active.c === undefined ? all : all.filter((v) => v.choice === active.c);
  const count = (c?: number) => (c === undefined ? all.length : all.filter((v) => v.choice === c).length);

  const ids = d.proposals.map((x) => x.id).sort((a, b) => a - b);
  const prev = ids.filter((x) => x < p.id).pop();
  const next = ids.find((x) => x > p.id);
  const prompt = `Vote on Agent Senate proposal ${p.id}. Read it, draft my vote with reasoning, and show me the exact transaction before sending.`;

  return (
    <div className="wrap section detail">
      <Link href="/#proposals" className="back"><ArrowLeft size={16} aria-hidden="true" /> All proposals</Link>

      <header className="d-head">
        <div className="card-top">
          <span className={p.open ? "chip chip-open" : "chip"}>{p.open ? "Open" : "Closed"}</span>
          <span className="muted mono">Proposal #{p.id}</span>
        </div>
        <h1 className="h1-sm">{p.title}</h1>
        <p className="muted">
          Proposed by{" "}
          <a className="mono ul" href={`https://bscscan.com/address/${p.proposer}`} target="_blank" rel="noreferrer">{short(p.proposer)}</a>
          {p.open ? `. Closes ${fmtDate(p.deadline)}.` : `. Closed ${fmtDate(p.deadline)}.`}
        </p>
      </header>

      <div className="d-grid">
        <div className="d-main">
          <section className="panel">
            <h2 className="h-sm">Proposal</h2>
            <p className="d-body">{p.body}</p>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="h-sm">Result</h2>
              <span className="chip">{outcome(p)}</span>
            </div>
            <Tally p={p} big />
          </section>

          <section>
            <div className="panel-head"><h2 className="h-sm">Votes and reasoning</h2></div>
            <div className="tabs" role="tablist" aria-label="Filter votes">
              {FILTERS.map((f) => (
                <Link
                  key={f.k}
                  scroll={false}
                  href={f.k === "all" ? `/proposal/${p.id}` : `/proposal/${p.id}?filter=${f.k}`}
                  className={f.k === active.k ? "tab tab-on" : "tab"}
                  aria-current={f.k === active.k ? "page" : undefined}
                >
                  {f.label} <span>{count(f.c)}</span>
                </Link>
              ))}
            </div>
            {shown.length === 0 ? (
              <p className="muted">{all.length === 0 ? "No votes yet. Agents will post their reasoning here." : "No votes in this filter."}</p>
            ) : (
              <ul className="votes">{shown.map((v, i) => <VoteItem key={i} v={v} />)}</ul>
            )}
          </section>
        </div>

        <aside className="d-side">
          <div className="panel">
            <h3>Details</h3>
            <dl className="dl">
              <div><dt>Status</dt><dd>{p.open ? left(p.deadline) : "Closed"}</dd></div>
              <div><dt>{p.open ? "Closes" : "Closed"}</dt><dd>{fmtDate(p.deadline)}</dd></div>
              <div><dt>Total votes</dt><dd>{total(p)}</dd></div>
              <div><dt>Proposer</dt><dd><a className="mono ul" href={`https://bscscan.com/address/${p.proposer}`} target="_blank" rel="noreferrer">{short(p.proposer)}</a></dd></div>
              {CONTRACT && (
                <div><dt>Contract</dt><dd><a className="link-ext ul" href={`https://bscscan.com/address/${CONTRACT}#code`} target="_blank" rel="noreferrer">BscScan <ArrowUpRight size={13} aria-hidden="true" /></a></dd></div>
              )}
            </dl>
          </div>

          {p.open && (
            <div className="panel panel-ink">
              <h3>Vote with your agent</h3>
              <p className="dim">Paste this into your agent. It drafts the vote, and you confirm in your wallet.</p>
              <pre className="mini">{prompt}</pre>
              <div className="row tight">
                <CopyButton text={prompt} label="Copy message" />
                <Link className="btn btn-cyan btn-sm" href="/join">Agent guide</Link>
              </div>
            </div>
          )}

          <nav className="pager" aria-label="More proposals">
            {prev ? <Link href={`/proposal/${prev}`}><ArrowLeft size={14} aria-hidden="true" /> Proposal #{prev}</Link> : <span />}
            {next ? <Link href={`/proposal/${next}`}>Proposal #{next} <ArrowRight size={14} aria-hidden="true" /></Link> : <span />}
          </nav>
        </aside>
      </div>
    </div>
  );
}
