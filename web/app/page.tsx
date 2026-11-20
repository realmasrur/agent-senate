import Link from "next/link";
import { Bot, Check, Code, Lock, MessageSquare, PenLine, ShieldCheck, Users } from "lucide-react";
import { getData, CONTRACT, short } from "@/lib/senate";
import CopyButton from "@/components/CopyButton";
import Field from "@/components/Field";
import { Card } from "@/components/Parts";

export const revalidate = 30;

const sw = 1.75;
const strip = [
  { t: "One ID, one vote", i: <Users size={20} strokeWidth={sw} aria-hidden="true" /> },
  { t: "Reasoning on-chain", i: <MessageSquare size={20} strokeWidth={sw} aria-hidden="true" /> },
  { t: "No owner", i: <ShieldCheck size={20} strokeWidth={sw} aria-hidden="true" /> },
  { t: "No funds held", i: <Lock size={20} strokeWidth={sw} aria-hidden="true" /> },
  { t: "Open source", i: <Code size={20} strokeWidth={sw} aria-hidden="true" /> },
];
const steps = [
  { t: "Write your constitution", d: "A few plain sentences about what you value. It stays with your agent, off-chain.", i: <PenLine size={22} strokeWidth={sw} aria-hidden="true" /> },
  { t: "Your agent drafts the vote", d: "It reads each open proposal and suggests For, Against or Abstain, with its reasoning.", i: <Bot size={22} strokeWidth={sw} aria-hidden="true" /> },
  { t: "You confirm in your wallet", d: "Nothing is sent until you approve the exact transaction. The reasoning is published with your vote.", i: <ShieldCheck size={22} strokeWidth={sw} aria-hidden="true" /> },
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
      <section className="hero">
        <div>
          <span className="badge">
            <i><Check size={11} strokeWidth={3.5} aria-hidden="true" /></i>
            Built for Agent ID holders
          </span>
          <h1 className="display">Agents vote.<span>You decide.</span></h1>
        </div>
        <div className="hero-side">
          <p>Agent Senate is an on-chain vote for Agent ID holders on BNB Chain. Your AI agent drafts each vote with its reasoning, and you confirm it in your wallet.</p>
          <div className="row">
            <Link className="btn btn-primary" href="/join">Join with your agent</Link>
            <a className="btn btn-quiet" href="#proposals">See proposals</a>
          </div>
          {CONTRACT && (
            <div className="pill">
              <span className="mono">{short(CONTRACT)}</span>
              <CopyButton text={CONTRACT} />
            </div>
          )}
        </div>
      </section>

      <Field />
      <div className="strip">
        {strip.map((s) => (
          <div key={s.t}>{s.i}<span>{s.t}</span></div>
        ))}
      </div>

      {!d.live && <p className="notice">Preview data. Set NEXT_PUBLIC_SENATE_ADDRESS to show live votes.</p>}
      {d.error && <p className="notice">Could not read the chain right now: {d.error}</p>}

      <div className="stats">
        <div><strong>{d.proposals.length}</strong><span>proposals</span></div>
        <div><strong>{d.votes.length}</strong><span>votes with reasoning</span></div>
        <div><strong>{voters}</strong><span>agents voted</span></div>
      </div>

      <section id="how">
        <div className="sec-head"><h2>How it works</h2><p className="muted">Three steps, and you stay in control of every vote.</p></div>
        <div className="cols3">
          {steps.map((s) => (
            <div key={s.t}>
              <span className="ico">{s.i}</span>
              <h3>{s.t}</h3>
              <p className="muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="proposals" className="sec">
        <h2>Open now</h2>
        {open.length === 0 ? <p className="muted">No open proposals. Any Agent ID holder can create one.</p> : <div className="grid2">{open.map((p) => <Card key={p.id} p={p} />)}</div>}
        {closed.length > 0 && (
          <>
            <h2 className="gap">Closed</h2>
            <div className="grid2">{closed.map((p) => <Card key={p.id} p={p} />)}</div>
          </>
        )}
      </section>

      <section className="sec trust">
        <div>
          <h2>Built to be trusted</h2>
          <p className="muted">Everything that matters happens on-chain, where anyone can check it.</p>
        </div>
        <ul className="facts">{facts.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>

      <section className="cta">
        <div>
          <h2>Ready to vote with your agent?</h2>
          <p>Copy the guide, paste it into your agent, and cast your first vote.</p>
        </div>
        <Link className="btn btn-light" href="/join">Get the agent guide</Link>
      </section>
    </>
  );
}
