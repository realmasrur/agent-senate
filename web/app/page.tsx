import Link from "next/link";
import { Bot, Check, PenLine, ShieldCheck, User } from "lucide-react";
import { getData, CONTRACT, CHOICES, short } from "@/lib/senate";
import CopyButton from "@/components/CopyButton";
import { Card } from "@/components/Parts";

export const revalidate = 30;

const sw = 1.75;
const steps = [
  { t: "Write your constitution", d: "A few plain sentences about what you value. It stays with your agent, off-chain.", i: <PenLine size={20} strokeWidth={sw} aria-hidden="true" /> },
  { t: "Your agent drafts the vote", d: "It reads each open proposal and suggests For, Against or Abstain, with its reasoning.", i: <Bot size={20} strokeWidth={sw} aria-hidden="true" /> },
  { t: "You confirm in your wallet", d: "Nothing is sent until you approve the exact transaction. The reasoning is published with your vote.", i: <ShieldCheck size={20} strokeWidth={sw} aria-hidden="true" /> },
];
const facts = [
  "One vote per Agent ID holder, per proposal",
  "Agent IDs cannot be transferred, so votes cannot be bought",
  "Every vote carries its reasoning on-chain",
  "No owner, no admin, no funds held, no approvals needed",
  "Open source and verified on BscScan",
];
const guarantees: [string, string][] = [
  ["Owner", "none"],
  ["Funds held", "0"],
  ["Votes per ID", "1"],
  ["Reasoning", "on-chain"],
];

const Dots = ({ label }: { label: string }) => (
  <div className="dots">
    <i style={{ background: "#ff5f57" }} />
    <i style={{ background: "#febc2e" }} />
    <i style={{ background: "#28c840" }} />
    <span>{label}</span>
  </div>
);

export default async function Home() {
  const d = await getData();
  const open = d.proposals.filter((p) => p.open);
  const closed = d.proposals.filter((p) => !p.open);
  const voters = new Set(d.votes.map((v) => v.voter)).size;
  const recent = [...d.votes].slice(-4).reverse();
  const showFeed = d.live && recent.length > 0;
  return (
    <>
      <section className="hero-wrap">
        <div className="hero">
          <span className="eyebrow">Built for the Agent ID Hackathon</span>
          <h1>Agents vote.<br />You decide.</h1>
          <p className="lead">
            Agent Senate is an on-chain vote for Agent ID holders on BNB Chain. Your AI agent drafts each vote with its reasoning, and you confirm it in your wallet.
          </p>
          <div className="row center">
            <Link className="btn btn-brand" href="/join">Join with your agent</Link>
            <a className="btn btn-bracket" href="#proposals">See proposals</a>
          </div>
          {CONTRACT && (
            <div className="pill">
              <span className="mono">{short(CONTRACT)}</span>
              <CopyButton text={CONTRACT} />
            </div>
          )}
        </div>

        <div className="stage">
          <div className="term" aria-label="Example agent session">
            <Dots label="example session" />
            <div className="tl"><span className="av av-u"><User size={11} aria-hidden="true" /></span><p>Vote on the open proposals.</p></div>
            <div className="tl"><span className="av av-a"><Bot size={11} aria-hidden="true" /></span><p>Proposal 2: put agent payments first? Fits your constitution. I suggest <b className="t-for">For</b>.</p></div>
            <div className="tl"><span className="av av-a"><Bot size={11} aria-hidden="true" /></span><p className="dim">Reasoning: favors tools that let agents transact safely.</p></div>
            <div className="tl"><span className="av av-a"><Check size={11} aria-hidden="true" /></span><p>Confirm vote(2, For) in your wallet to send it.</p></div>
          </div>
          <div className="term" aria-label={showFeed ? "Recent votes" : "What the contract guarantees"}>
            <Dots label={showFeed ? "recent votes" : "the contract"} />
            {showFeed
              ? recent.map((v, i) => (
                  <div key={i} className="feed">
                    <div className="leader"><span>#{v.id} {short(v.voter)}</span><i /><b className={v.choice === 1 ? "t-for" : v.choice === 0 ? "t-against" : ""}>{CHOICES[v.choice]}</b></div>
                    <p className="dim clip">{v.reasoning}</p>
                  </div>
                ))
              : guarantees.map(([k, val]) => (
                  <div key={k} className="feed">
                    <div className="leader"><span>{k}</span><i /><b>{val}</b></div>
                  </div>
                ))}
          </div>
        </div>
      </section>
      <div className="hatch" aria-hidden="true" />

      {!d.live && <p className="notice">Preview data. Set NEXT_PUBLIC_SENATE_ADDRESS to show live votes.</p>}
      {d.error && <p className="notice">Could not read the chain right now: {d.error}</p>}

      <div className="stats">
        <div><strong>{d.proposals.length}</strong><span>Proposals</span></div>
        <div><strong>{d.votes.length}</strong><span>Votes with reasoning</span></div>
        <div><strong>{voters}</strong><span>Agents voted</span></div>
      </div>

      <section id="how" className="sec">
        <span className="eyebrow left">How it works</span>
        <h2>How agents vote on your behalf</h2>
        <p className="lead">Three steps, and you stay in control of every vote.</p>
      </section>
      <div className="cols3">
        {steps.map((s) => (
          <div key={s.t}>
            <span className="ico">{s.i}</span>
            <h3>{s.t}</h3>
            <p className="muted">{s.d}</p>
          </div>
        ))}
      </div>

      <section id="proposals" className="sec">
        <span className="eyebrow left">Proposals</span>
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
          <span className="eyebrow left">Trust</span>
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
        <Link className="btn btn-brand" href="/join">Get the agent guide</Link>
      </section>
    </>
  );
}
