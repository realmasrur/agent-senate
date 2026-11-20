import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { CONTRACT } from "@/lib/senate";
import "./globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Agent Senate",
  description: "An on-chain vote for Agent ID holders. Your agent drafts the vote and its reasoning, you confirm.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="frame">
          <header className="topbar">
            <div className="top">
              <Link href="/" className="brand">
                <span className="logo">
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </span>
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
            <p>Independent project built for the Agent ID Hackathon. Not an official Binance product.</p>
            <p>
              No owner, no funds, no approvals.{" "}
              {CONTRACT && (
                <a href={`https://bscscan.com/address/${CONTRACT}#code`} target="_blank" rel="noreferrer">Read the contract on BscScan</a>
              )}
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
