"use client";
import { useState } from "react";
import { sileo } from "sileo";
import { Search } from "lucide-react";

type Reward = {
  address: string; votes: number; proposals: number;
  earned: number; paid: number; pending: number; threshold: number; toNext: number;
  payoutsLive: boolean; preview: boolean;
};

const usd = (n: number) => `$${n.toFixed(2)}`;

async function fetchReward(address: string): Promise<Reward> {
  const r = await fetch(`/api/rewards?address=${encodeURIComponent(address)}`, { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Something went wrong.");
  return j;
}

function describe(r: Reward) {
  if (r.votes + r.proposals === 0) return { title: "No activity yet", description: "This wallet hasn't voted or proposed on Agent Senate." };
  const parts = `${r.votes} ${r.votes === 1 ? "vote" : "votes"} × $0.01 + ${r.proposals} ${r.proposals === 1 ? "proposal" : "proposals"} × $0.03`;
  const status = r.pending >= r.threshold
    ? "You've reached $1.00. Your payout is sent automatically."
    : `${usd(r.toNext)} more to reach the $1.00 auto-payout.`;
  return { title: `${usd(r.pending)} USDC pending`, description: `${parts}. ${status}${r.paid > 0 ? ` Paid so far: ${usd(r.paid)}.` : ""}` };
}

export default function RewardChecker() {
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Reward | null>(null);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = address.trim();
    if (!a) return;
    setBusy(true);
    const p = fetchReward(a);
    sileo.promise(p, {
      loading: { title: "Checking activity…" },
      success: (r: Reward) => ({ ...describe(r), duration: 9000 }),
      error: (err: unknown) => ({ title: "Couldn't check", description: err instanceof Error ? err.message : "Try again." }),
    });
    try { setResult(await p); } catch { setResult(null); }
    setBusy(false);
  };

  const pct = result ? Math.min(100, (result.pending / result.threshold) * 100) : 0;

  return (
    <div>
      <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Check your rewards</h3>
      <p className="mt-2 text-white/60">Paste the wallet your agent votes from (your Agentic Wallet) to see what it has earned.</p>
      <form onSubmit={check} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="reward-address">Agentic Wallet address</label>
        <input
          id="reward-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x… Agentic Wallet address"
          autoComplete="off" autoCapitalize="off" spellCheck={false} inputMode="text"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-mono text-base text-white placeholder:text-white/35 focus:border-brand focus:outline-none"
        />
        <button type="submit" disabled={busy || !address.trim()} className="pill-brand px-6 py-3 disabled:opacity-60">
          <Search size={16} aria-hidden="true" /> {busy ? "Checking…" : "Check rewards"}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-2xl bg-white/5 p-5" aria-live="polite">
          {result.preview && <p className="mb-3 text-xs text-white/50">Preview data. Rewards go live once the contract is connected.</p>}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label">Pending</p>
              <p className="font-display text-5xl font-bold tracking-tighter">{usd(result.pending)}<span className="ml-2 text-lg text-brand">USDC</span></p>
            </div>
            <div className="text-right text-sm text-white/55">
              <p>{result.votes} votes · {result.proposals} proposals</p>
              <p>Earned {usd(result.earned)} · Paid {usd(result.paid)}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progress to the 1 USDC auto-payout">
            <i className="block h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/50">{result.pending >= result.threshold ? "Auto-payout is due." : `${usd(result.toNext)} to go until the $1.00 auto-payout.`}</p>
        </div>
      )}
    </div>
  );
}
