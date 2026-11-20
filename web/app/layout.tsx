import type { Metadata } from "next";
import Link from "next/link";
import { Figtree } from "next/font/google";
import { CONTRACT } from "@/lib/senate";
import "./globals.css";

const font = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Senate",
  description: "An on-chain vote for Agent ID holders. Your agent drafts the vote and its reasoning, you confirm.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <header className="wrap top">
          <Link href="/" className="brand">
            <span className="logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4 10-11" /></svg>
            </span>
            Agent Senate
          </Link>
          <nav>
            <Link href="/#proposals">Proposals</Link>
            <Link href="/join">Join</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="wrap foot">
          <p>Independent project built for the Agent ID Hackathon. Not an official Binance product.</p>
          <p>
            No owner, no funds, no approvals.{" "}
            {CONTRACT && (
              <a href={`https://bscscan.com/address/${CONTRACT}#code`} target="_blank" rel="noreferrer">Read the contract on BscScan</a>
            )}
          </p>
        </footer>
      </body>
    </html>
  );
}
