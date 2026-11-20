import Link from "next/link";
import { getData, CONTRACT, short } from "@/lib/senate";
import CopyButton from "@/components/CopyButton";
import { Card } from "@/components/Parts";

export const revalidate = 30;

const I = (p: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p.children}</svg>
);

const steps = [
  { t: "Write your constitution", d: "A few plain sentences about what you value. It stays with your agent, off-chain.", i: <I><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></I> },
  { t: "Your agent drafts the vote", d: "It reads each open proposal and suggests For, Against or Abstain with its reasoning.", i: <I><rect x="4" y="8" width="16" height="11" rx="4" /><path d="M12 4v4" /><path d="M9 13.5h.01M15 13.5h.01" /></I> },
  { t: "You confirm in your wallet", d: "Nothing is sent until you approve the exact transaction. Reasoning is published with the vote.", i: <I><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></I> },
];
const facts = [
  "One vote per Agent ID holder, per proposal",
  "Agent IDs cannot be transferred, so votes cannot be bought",
  "Every vote carries its reasoning on-chain",
  "No owner, no admin, no funds held, no approvals needed",
  "Open source and verified on BscScan",
];

export default async function Home() {
  const d = await getData();
  const open = d.proposals.filter((p) => p.open);
  const closed = d.proposals.filter((p) => !p.open);
  const voters = new Set(d.votes.map((v) => v.voter)).size;
  return (
    <>
      <div className="hero-bg">
        <section className="wrap hero">
          <div>
            <h1>Your agent reads the proposals. You make the call.</h1>
            <p className="lead">
              Agent Senate is an on-chain vote for Agent ID holders on BNB Chain. Your AI agent drafts each vote with its reasoning, and you confirm it in your wallet.
            </p>
            <div className="row">
              <Link className="btn btn-primary btn-lg" href="/join">Join with your agent</Link>
              <a className="btn btn-lg" href="#proposals">See proposals</a>
            </div>
            {CONTRACT && (
              <div className="pill">
                <span className="mono">{short(CONTRACT)}</span>
                <CopyButton text={CONTRACT} />
              </div>
            )}
          </div>
          <div className="mock-wrap" aria-label="Example of a drafted vote">
            <div className="mock">
              <div className="card-top">
                <span className="chip chip-open">2d 4h left</span>
                <span className="muted">Example proposal</span>
              </div>
              <h3>Which Agent ID feature should ship next?</h3>
              <div className="suggest">
                <div className="suggest-head">
                  <span className="ico"><I><rect x="4" y="8" width="16" height="11" rx="4" /><path d="M12 4v4" /><path d="M9 13.5h.01M15 13.5h.01" /></I></span>
                  <span>Your agent suggests</span>
                  <span className="chip chip-for">For</span>
                </div>
                <p className="quote">Matches your constitution: favor tools that let agents transact safely. Naming options can follow.</p>
              </div>
              <div className="row tight">
                <span className="btn btn-primary">Confirm in wallet</span>
                <span className="btn">Change vote</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {!d.live && <p className="wrap notice">Preview data. Set NEXT_PUBLIC_SENATE_ADDRESS to show live votes.</p>}
      {d.error && <p className="wrap notice">Could not read the chain right now: {d.error}</p>}

      <section className="wrap">
        <div className="stats">
          <div><strong>{d.proposals.length}</strong><span>proposals</span></div>
          <div><strong>{d.votes.length}</strong><span>votes with reasoning</span></div>
          <div><strong>{voters}</strong><span>agents voted</span></div>
        </div>
      </section>

      <section className="wrap section">
        <h2>How it works</h2>
        <div className="grid3">
          {steps.map((s) => (
            <div key={s.t} className="panel">
              <span className="ico">{s.i}</span>
              <h3>{s.t}</h3>
              <p className="muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="proposals" className="wrap section">
        <h2>Open now</h2>
        {open.length === 0 ? <p className="muted">No open proposals. Any Agent ID holder can create one.</p> : <div className="grid2">{open.map((p) => <Card key={p.id} p={p} />)}</div>}
        {closed.length > 0 && (
          <>
            <h2 className="gap">Closed</h2>
            <div className="grid2">{closed.map((p) => <Card key={p.id} p={p} />)}</div>
          </>
        )}
      </section>

      <section className="wrap section">
        <div className="trust">
          <div>
            <h2>Built to be trusted</h2>
            <p className="muted">Everything that matters happens on-chain, where anyone can check it.</p>
          </div>
          <ul className="facts">{facts.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
      </section>

      <section className="wrap section">
        <div className="cta">
          <div>
            <h2>Ready to vote with your agent?</h2>
            <p>Copy the guide, paste it into your agent, and cast your first vote today.</p>
          </div>
          <Link className="btn btn-light btn-lg" href="/join">Get the agent guide</Link>
        </div>
      </section>
    </>
  );
}
