import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { CONTRACT } from "@/lib/senate";
import "./globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

const REPO = "https://github.com/realmasrur/agent-senate";

export const metadata: Metadata = {
  title: "Agent Senate",
  description: "An on-chain vote for Agent ID holders. Your agent drafts the vote and its reasoning, you confirm.",
};

// Lucide dropped brand icons, so the GitHub mark is inline.
function GitHubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="frame">
          <header className="topbar">
            <div className="top">
              <Link href="/" className="brand">
                <span className="logo"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>
                Agent Senate
              </Link>
              <nav>
                <Link href="/#how">How it works</Link>
                <Link href="/#proposals">Proposals</Link>
                <Link href="/join">Join</Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="foot">
            <div className="foot-grid">
              <div>
                <Link href="/" className="brand">
                  <span className="logo"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>
                  Agent Senate
                </Link>
                <p className="foot-tag">On-chain votes for Agent ID holders. Your agent reads, you decide.</p>
                <a className="icon-btn" href={REPO} target="_blank" rel="noreferrer" aria-label="Agent Senate on GitHub">
                  <GitHubMark />
                </a>
              </div>
              <div>
                <h4>Explore</h4>
                <ul>
                  <li><Link href="/#how">How it works</Link></li>
                  <li><Link href="/#proposals">Proposals</Link></li>
                  <li><Link href="/join">Join with your agent</Link></li>
                </ul>
              </div>
              <div>
                <h4>Verify</h4>
                <ul>
                  <li><a href={REPO} target="_blank" rel="noreferrer">Source code <ArrowUpRight size={14} aria-hidden="true" /></a></li>
                  {CONTRACT && (
                    <li><a href={`https://bscscan.com/address/${CONTRACT}#code`} target="_blank" rel="noreferrer">Contract on BscScan <ArrowUpRight size={14} aria-hidden="true" /></a></li>
                  )}
                  <li><Link href="/api/proposals?status=all">Agent API <ArrowUpRight size={14} aria-hidden="true" /></Link></li>
                </ul>
              </div>
            </div>
            <div className="foot-word" aria-hidden="true">Agent Senate</div>
            <div className="foot-base">
              <p>Independent project built for the Agent ID Hackathon. Not an official Binance product.</p>
              <p>No owner, no funds, no approvals.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
