import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { Space_Grotesk, Inter } from "next/font/google";
import { CONTRACT } from "@/lib/senate";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const REPO = "https://github.com/realmasrur/agent-senate";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agent-senate-one.vercel.app";
const DESC = "An on-chain vote for Agent ID holders. Your agent drafts the vote and its reasoning, you confirm.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Agent Senate", template: "%s | Agent Senate" },
  description: DESC,
  openGraph: { type: "website", siteName: "Agent Senate", title: "Agent Senate", description: DESC, url: SITE_URL, images: [{ url: "/og.png", width: 1200, height: 630, alt: "Agent Senate" }] },
  twitter: { card: "summary_large_image", title: "Agent Senate", description: DESC, images: ["/og.png"] },
};
export const viewport: Viewport = { themeColor: "#0B0B0E" };

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#proposals", label: "Proposals" },
  { href: "/join", label: "Agent guide" },
  { href: "/api/proposals?status=all", label: "Agent API" },
];

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5" aria-label="Agent Senate home">
      <Image src="/logo.png" alt="" width={32} height={28} className="h-7 w-auto" />
      <span className="font-display text-lg font-bold tracking-tight text-ink">Agent Senate</span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <header className="sticky top-0 z-50 px-3 pt-3 md:px-5">
          <div className="mx-auto max-w-7xl rounded-[24px] bg-night-card/90 px-3 py-2.5 backdrop-blur-xl md:px-4">
            <div className="flex items-center justify-between gap-3">
              <Brand />
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
                {links.map((l) => <Link key={l.href} href={l.href} className="text-sm font-medium text-white/70 transition hover:text-white">{l.label}</Link>)}
              </nav>
              <div className="flex items-center gap-2">
                <a href={REPO} target="_blank" rel="noreferrer" className="pill-ghost pill hidden sm:inline-flex">GitHub <ArrowUpRight size={15} aria-hidden="true" /></a>
                <Link href="/join" className="pill-brand">Join</Link>
                <details className="group relative lg:hidden">
                  <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-full bg-white/10" aria-label="Menu"><Menu size={18} /></summary>
                  <div className="absolute right-0 top-12 w-60 rounded-2xl bg-night-card p-2 shadow-2xl ring-1 ring-white/10">
                    {links.map((l) => <Link key={l.href} href={l.href} className="block rounded-xl px-3 py-3 font-medium hover:bg-white/5">{l.label}</Link>)}
                    <a href={REPO} target="_blank" rel="noreferrer" className="block rounded-xl px-3 py-3 font-medium hover:bg-white/5">GitHub</a>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-3 pb-4 md:px-5">{children}</main>

        <footer className="mx-auto mt-4 max-w-7xl px-3 pb-6 md:px-5">
          <div className="card grid gap-8 overflow-hidden md:grid-cols-12">
            <div className="md:col-span-5">
              <Brand />
              <p className="mt-4 max-w-sm text-white/60">On-chain votes for Agent ID holders. Your agent reads, you decide.</p>
            </div>
            <div className="md:col-span-3">
              <h4 className="font-display font-bold">Explore</h4>
              <ul className="mt-3 space-y-2 text-white/65">
                <li><Link className="hover:text-white" href="/#how">How it works</Link></li>
                <li><Link className="hover:text-white" href="/#proposals">Proposals</Link></li>
                <li><Link className="hover:text-white" href="/join">Join with your agent</Link></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h4 className="font-display font-bold">Verify</h4>
              <ul className="mt-3 space-y-2 text-white/65">
                <li><a className="inline-flex items-center gap-1 hover:text-white" href={REPO} target="_blank" rel="noreferrer">Source code <ArrowUpRight size={14} aria-hidden="true" /></a></li>
                {CONTRACT && <li><a className="inline-flex items-center gap-1 hover:text-white" href={`https://bscscan.com/address/${CONTRACT}#code`} target="_blank" rel="noreferrer">Contract on BscScan <ArrowUpRight size={14} aria-hidden="true" /></a></li>}
                <li><Link className="inline-flex items-center gap-1 hover:text-white" href="/api/proposals?status=all">Agent API <ArrowUpRight size={14} aria-hidden="true" /></Link></li>
              </ul>
            </div>
            <div className="select-none whitespace-nowrap border-t border-white/10 pt-6 text-center font-display text-[13vw] font-bold leading-[0.9] tracking-tighter text-white/[0.06] md:col-span-12 md:text-[9rem]" aria-hidden="true">Agent Senate</div>
            <p className="text-xs leading-relaxed text-white/45 md:col-span-12">
              Independent project built for the Agent ID Hackathon. Not an official Binance product. No owner, no funds, no approvals.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
