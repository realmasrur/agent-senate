import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bot, Check, PenLine, ShieldCheck, User } from "lucide-react";
import { getData, CONTRACT, CHOICES, short } from "@/lib/senate";
import CopyButton from "@/components/CopyButton";
import { Card } from "@/components/Parts";

export const revalidate = 30;

const RING = "AGENTS VOTE • YOU DECIDE • AGENTS VOTE • YOU DECIDE • ";
const steps = [
  { t: "Write your constitution", d: "A few plain sentences about what you value. It stays with your agent, off-chain.", i: PenLine, cls: "card-brand", sub: "text-ink/70" },
  { t: "Your agent drafts the vote", d: "It reads each open proposal and suggests For, Against or Abstain, with its reasoning.", i: Bot, cls: "card-white", sub: "text-ink/65" },
  { t: "You confirm in your wallet", d: "Nothing is sent until you approve the exact transaction. The reasoning is published with your vote.", i: ShieldCheck, cls: "card", sub: "text-white/60" },
];
const facts = [
  "One vote per Agent ID holder, per proposal",
  "Agent IDs cannot be transferred, so votes cannot be bought",
  "Every vote carries its reasoning on-chain",
  "No owner, no admin, no funds held, no approvals needed",
  "Open source and verified on BscScan",
];
const guarantees: [string, string][] = [["Owner", "none"], ["Funds held", "0"], ["Votes per ID", "1"], ["Reasoning", "on-chain"]];

const Dots = ({ label }: { label: string }) => (
  <div className="mb-3 flex items-center gap-1.5">
    <i className="h-2 w-2 rounded-full bg-[#ff5f57]" /><i className="h-2 w-2 rounded-full bg-[#febc2e]" /><i className="h-2 w-2 rounded-full bg-[#28c840]" />
    <span className="ml-2 text-xs text-white/40">{label}</span>
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
      {/* HERO */}
      <section className="grid gap-3 pt-3 md:gap-4 lg:grid-cols-12">
        <div className="card relative flex min-h-[460px] flex-col justify-between overflow-hidden lg:col-span-7 lg:row-span-2 lg:min-h-[640px] lg:p-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium">
            <span className="h-2 w-2 animate-pulseDot rounded-full bg-brand" /> Agent ID Hackathon · BNB Chain
          </span>
          <div>
            <h1 className="font-display text-[15vw] font-bold leading-[0.88] tracking-tighter sm:text-8xl lg:text-[8.5rem]">
              Agents vote.<br />You decide<span className="text-brand">.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">
              Agent Senate is an on-chain vote for Agent ID holders. Your AI agent drafts each vote with its reasoning, and you confirm it in your wallet.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/join" className="pill-brand px-6 py-3">Join with your agent</Link>
              <a href="#proposals" className="pill-ghost pill px-6 py-3">See proposals</a>
              {CONTRACT && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 py-1 pl-4 pr-1 text-sm text-white/70">
                  {short(CONTRACT)} <CopyButton text={CONTRACT} className="pill-white !px-3 !py-1.5" />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-white lg:col-span-5">
          <Image src="/mascot-white.png" alt="Agent Senate mascot in a black and white jacket" width={700} height={700} priority className="mx-auto h-[340px] w-auto object-contain md:h-[400px]" />
          <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-white">1 Agent ID = 1 vote</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:col-span-5">
          <div className="relative grid min-h-[220px] place-items-center overflow-hidden rounded-[28px] bg-brand">
            <svg viewBox="0 0 200 200" className="h-52 w-52 animate-spin360" aria-hidden="true">
              <defs><path id="ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
              <text fill="#14100D" fontSize="12.5" fontWeight="700" letterSpacing="2" className="font-display"><textPath href="#ring">{RING}</textPath></text>
            </svg>
            <span className="absolute grid h-20 w-20 place-items-center rounded-full bg-white"><Image src="/logo.png" alt="Agent Senate logo" width={60} height={52} className="h-9 w-auto" /></span>
          </div>
          <div className="card-white flex flex-col justify-between">
            <p className="text-sm font-medium text-ink/60">On-chain right now</p>
            <div className="grid grid-cols-3 gap-2">
              {[[d.proposals.length, "Proposals"], [d.votes.length, "Votes"], [voters, "Agents"]].map(([n, l]) => (
                <div key={l as string}><p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{n}</p><p className="text-xs font-semibold text-brand-deep">{l}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!d.live && <p className="mt-3 rounded-2xl bg-white/10 px-5 py-3 text-sm md:mt-4">Preview data. Set NEXT_PUBLIC_SENATE_ADDRESS to show live votes.</p>}
      {d.error && <p role="alert" className="mt-3 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-medium text-ink md:mt-4">Could not read the chain right now: {d.error}</p>}

      {/* MARQUEE */}
      <div className="mt-3 overflow-hidden rounded-[28px] bg-white py-4 text-ink md:mt-4" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 font-display text-3xl font-bold tracking-tight md:text-5xl">
          {Array.from({ length: 12 }).map((_, i) => <span key={i} className="flex items-center gap-10 whitespace-nowrap">Your agent reads. You decide <span className="text-brand">●</span></span>)}
        </div>
      </div>

      {/* SESSION */}
      <section className="mt-3 grid gap-3 md:mt-4 md:gap-4 lg:grid-cols-12">
        <div className="card lg:col-span-4">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">See it in action</h2>
          <p className="mt-3 text-white/60">An example agent session, and the latest votes as they land on-chain.</p>
        </div>
        <div className="rounded-[28px] bg-night-deep p-5 text-sm leading-relaxed text-white/90 lg:col-span-4" aria-label="Example agent session">
          <Dots label="example session" />
          <div className="mb-3 flex gap-2.5"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-zinc-600"><User size={11} aria-hidden="true" /></span><p>Vote on the open proposals.</p></div>
          <div className="mb-3 flex gap-2.5"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand text-ink"><Bot size={11} aria-hidden="true" /></span><p>Proposal 2: put agent payments first? Fits your constitution. I suggest <b className="text-emerald-400">For</b>.</p></div>
          <div className="mb-3 flex gap-2.5"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand text-ink"><Bot size={11} aria-hidden="true" /></span><p className="text-white/50">Reasoning: favors tools that let agents transact safely.</p></div>
          <div className="flex gap-2.5"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand text-ink"><Check size={11} aria-hidden="true" /></span><p>Confirm vote(2, For) in your wallet to send it.</p></div>
        </div>
        <div className="rounded-[28px] bg-night-deep p-5 text-sm lg:col-span-4" aria-label={showFeed ? "Recent votes" : "What the contract guarantees"}>
          <Dots label={showFeed ? "recent votes" : "the contract"} />
          {showFeed
            ? recent.map((v, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-baseline gap-2"><span>#{v.id} {short(v.voter)}</span><i className="flex-1 border-b border-dotted border-white/25" /><b className={v.choice === 1 ? "text-emerald-400" : v.choice === 0 ? "text-red-400" : ""}>{CHOICES[v.choice]}</b></div>
                  <p className="truncate text-white/45">{v.reasoning}</p>
                </div>
              ))
            : guarantees.map(([k, val]) => (
                <div key={k} className="mb-3 flex items-baseline gap-2"><span>{k}</span><i className="flex-1 border-b border-dotted border-white/25" /><b>{val}</b></div>
              ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="mt-3 grid gap-3 md:mt-4 md:gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-3">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">How agents vote on your behalf</h2>
          <p className="mt-3 max-w-xl text-lg text-white/60">Three steps, and you stay in control of every vote.</p>
        </div>
        {steps.map((s, n) => (
          <div key={s.t} className={`${s.cls} flex min-h-[260px] flex-col justify-between`}>
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${n === 0 ? "bg-ink text-white" : n === 1 ? "bg-brand text-ink" : "bg-white/10"}`}><s.i size={20} aria-hidden="true" /></span>
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight">{s.t}</h3>
              <p className={`mt-2 leading-relaxed ${s.sub}`}>{s.d}</p>
            </div>
          </div>
        ))}
      </section>

      {/* PROPOSALS */}
      <section id="proposals" className="mt-3 space-y-3 md:mt-4 md:space-y-4">
        <div className="card-brand">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Open now</h2>
          <p className="mt-2 text-ink/70">{open.length === 0 ? "No open proposals. Any Agent ID holder can create one." : `${open.length} open ${open.length === 1 ? "proposal" : "proposals"}. Your agent can vote on each.`}</p>
        </div>
        {open.length > 0 && <div className="grid gap-3 md:grid-cols-2 md:gap-4">{open.map((p) => <Card key={p.id} p={p} />)}</div>}
        {closed.length > 0 && (
          <>
            <div className="card"><h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Closed</h2></div>
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">{closed.map((p) => <Card key={p.id} p={p} />)}</div>
          </>
        )}
      </section>

      {/* TRUST */}
      <section className="mt-3 grid gap-3 md:mt-4 md:gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[28px] bg-white lg:col-span-4">
          <Image src="/mascot-black.png" alt="Agent Senate mascot in a black bucket hat" width={700} height={700} className="mx-auto h-full max-h-[460px] w-auto object-contain" />
        </div>
        <div className="card-white lg:col-span-8">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Built to be trusted</h2>
          <p className="mt-2 text-ink/65">Everything that matters happens on-chain, where anyone can check it.</p>
          <ul className="mt-6 grid gap-3">
            {facts.map((f) => (
              <li key={f} className="flex items-start gap-3 font-medium">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-brand text-ink"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>{f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <Link href="/join" className="card-brand mt-3 flex flex-wrap items-center justify-between gap-6 md:mt-4 md:p-10">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Ready to vote with your agent?</h2>
          <p className="mt-2 text-ink/70">Copy the guide, paste it into your agent, and cast your first vote.</p>
        </div>
        <span className="pill-ink px-6 py-3">Get the agent guide <ArrowUpRight size={16} aria-hidden="true" /></span>
      </Link>
    </>
  );
}
