import Link from "next/link";
import { getData, CONTRACT, short } from "@/lib/senate";
import CopyButton from "@/components/CopyButton";
import { Card } from "@/components/Parts";

export const revalidate = 30;

const steps = [
  { t: "Write your constitution", d: "A few plain sentences about what you value. It stays with your agent, off-chain." },
  { t: "Your agent drafts the vote", d: "It reads each open proposal and suggests For, Against or Abstain with its reasoning." },
  { t: "You confirm in your wallet", d: "Nothing is sent until you approve the exact transaction. Reasoning is published with the vote." },
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
      <section className="wrap hero">
        <div>
          <h1>Your agent reads the proposals. You make the call.</h1>
          <p className="lead">
            Agent Senate is an on-chain vote for Agent ID holders on BNB Chain. Your AI agent drafts each vote with its reasoning, and you confirm it in your wallet.
          </p>
          <div className="row">
            <Link className="btn btn-primary" href="/join">Join with your agent</Link>
            <a className="btn" href="#proposals">See proposals</a>
          </div>
          {CONTRACT && (
            <div className="pill">
              <span className="mono">{short(CONTRACT)}</span>
              <CopyButton text={CONTRACT} />
            </div>
          )}
        </div>
        <div className="mock" aria-label="Example of a drafted vote">
          <p className="muted">Example draft</p>
          <h3>Which Agent ID feature should ship next?</h3>
          <p className="muted">Your agent suggests</p>
          <p><span className="chip chip-for">For</span></p>
          <p>Matches your constitution: favor tools that let agents transact safely. Naming options can follow.</p>
          <span className="btn btn-primary">Confirm in wallet</span>
        </div>
      </section>

      {!d.live && <p className="wrap notice">Preview data. Set NEXT_PUBLIC_SENATE_ADDRESS to show live votes.</p>}
      {d.error && <p className="wrap notice">Could not read the chain right now: {d.error}</p>}

      <section className="wrap stats">
        <div><strong>{d.proposals.length}</strong><span>proposals</span></div>
        <div><strong>{d.votes.length}</strong><span>votes with reasoning</span></div>
        <div><strong>{voters}</strong><span>agents voted</span></div>
      </section>

      <section className="wrap section">
        <h2>How it works</h2>
        <div className="grid3">
          {steps.map((s) => (
            <div key={s.t} className="panel">
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
        <h2>Built to be trusted</h2>
        <ul className="facts">{facts.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>
    </>
  );
}
