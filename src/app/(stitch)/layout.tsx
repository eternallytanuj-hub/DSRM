'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import "../globals.css";

const navTabs = [
  {
    href: "/marketplace",
    label: "MARKETPLACE (112 LIVE PASSES)",
    match: ["/marketplace"],
  },
  {
    href: "/my-bookings",
    label: "MY BOOKINGS (3 ACTIVE)",
    match: ["/my-bookings", "/bookings"],
  },
  {
    href: "/escrow-clearing",
    label: "ESCROW & CLEARING (LIVE VERIFIED SETTLEMENT)",
    match: ["/escrow-clearing", "/escrow"],
  },
  {
    href: "/telemetry-oracle",
    label: "TELEMETRY ORACLE (SatNOGS / NOAA INGEST)",
    match: ["/telemetry-oracle", "/telemetry"],
  },
  {
    href: "/operator-registry",
    label: "OPERATOR REGISTRY (FCC / ITU VERIFIED)",
    match: ["/operator-registry", "/registry"],
  },
  {
    href: "/api-smart-contract",
    label: "API & SMART CONTRACT (CHAINLINK FUNCTIONS)",
    match: ["/api-smart-contract", "/api-engine"],
  },
];

const settlementLinks = [
  {
    href: "/marketplace",
    label: "Pass Spot Market",
    icon: "swap_horiz",
    match: ["/marketplace"],
  },
  {
    href: "/my-bookings",
    label: "Committed Slots",
    icon: "book_online",
    match: ["/my-bookings", "/bookings"],
  },
  {
    href: "/escrow-clearing",
    label: "Escrow Execution",
    icon: "currency_exchange",
    match: ["/escrow-clearing", "/escrow"],
  },
];

const oracleLinks = [
  {
    href: "/telemetry-oracle",
    label: "SatNOGS RF Passes",
    icon: "radar",
    match: ["/telemetry-oracle", "/telemetry"],
  },
  {
    href: "/operator-registry",
    label: "FCC IBFS Registrations",
    icon: "verified_user",
    match: ["/operator-registry", "/registry"],
  },
  {
    href: "/api-smart-contract",
    label: "Chainlink Functions",
    icon: "terminal",
    match: ["/api-smart-contract", "/api-engine"],
  },
];

export default function StitchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || "";

  const isTabActive = (item: { href: string; match: string[] }) => {
    return item.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
  };

  return (
    <>
      {/* STITCH HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-panel border-b border-border-default shadow-md">
        <div className="h-10 px-margin-desktop flex items-center justify-between border-b border-border-default bg-surface-panel">
          <div className="flex items-center gap-space-lg">
            <Link href="/marketplace" className="flex items-center gap-space-xs hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-primary text-headline-sm animate-pulse">satellite_alt</span>
              <span className="font-label-md text-label-md tracking-wider text-text-primary font-semibold">DSRM // ORBITAL ACCESS EXCHANGE</span>
              <span className="px-space-xs py-0 text-label-sm font-label-sm border border-border-default bg-surface-inset text-text-secondary">CLEARING v2.4</span>
            </Link>
            <div className="h-4 w-px bg-border-default"></div>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
              <span className="text-text-tertiary">NET:</span>
              <span className="text-text-secondary">SEPOLIA ETH</span>
              <span className="h-1.5 w-1.5 bg-status-nominal"></span>
            </div>
            <div className="h-4 w-px bg-border-default"></div>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
              <span className="text-text-tertiary">CONTRACT:</span>
              <span className="font-code-sm text-code-sm text-primary font-mono">0x7f9a...4B12</span>
            </div>
          </div>
          
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
              <span className="text-text-tertiary">SatNOGS ACTIVE:</span>
              <span className="text-text-primary font-code-sm">418 ACTIVE</span>
              <span className="h-1.5 w-1.5 bg-status-nominal"></span>
            </div>
            <div className="h-4 w-px bg-border-default"></div>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
              <span className="text-text-tertiary">CHAINLINK DON:</span>
              <span className="text-status-nominal font-code-sm">5/7 CONSENSUS</span>
            </div>
            <div className="h-4 w-px bg-border-default"></div>
            <div className="flex items-center gap-space-xs font-code-sm text-code-sm bg-surface-inset px-space-sm py-0.5 border border-border-default">
              <span className="text-text-tertiary">UTC</span>
              <span className="text-text-primary tracking-widest font-semibold">2025.04.12 18:42:09.841</span>
            </div>
            <div className="h-4 w-px bg-border-default"></div>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
              <span className="text-text-tertiary">MULTI-SIG:</span>
              <span className="text-status-nominal font-code-sm">3/5 SECURE</span>
            </div>
            <div className="flex items-center gap-space-xs font-code-sm text-code-sm bg-surface-inset px-space-sm py-0.5 border border-border-default text-text-secondary">
              <span className="text-text-tertiary">WALLET:</span>
              <span className="text-primary font-code-sm">0x4f2a...9c1e</span>
            </div>
          </div>
        </div>
        
        <div className="h-9 px-margin-desktop flex items-center justify-between bg-surface-inset">
          <nav className="flex items-center h-full gap-0">
            {navTabs.map((tab) => {
              const active = isTabActive(tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "h-full px-space-lg flex items-center font-label-md bg-surface-panel text-primary border-b-2 border-primary font-semibold shadow-[0_2px_12px_rgba(173,198,255,0.35)] relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:shadow-[0_0_8px_#adc6ff] transition-all"
                      : "h-full px-space-lg flex items-center text-label-md font-label-md text-text-secondary hover:text-text-primary hover:bg-surface-panel border-r border-border-default border-b-2 border-transparent transition-colors"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-space-sm text-label-sm font-label-sm">
            <span className="text-text-tertiary">CHANNEL:</span>
            <span className="text-status-nominal font-code-sm">SECURE LINK E2EE</span>
          </div>
        </div>
      </header>

      {/* STITCH SIDEBAR */}
      <aside className="fixed left-0 top-[76px] bottom-7 w-64 bg-surface-panel border-r border-border-default z-40 flex flex-col justify-between">
        <div className="p-space-md border-b border-border-default">
          <div className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider mb-space-xs">Terminal Ops Module</div>
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-text-primary">FLIGHT COCKPIT</span>
            <span className="h-2 w-2 bg-status-nominal animate-pulse"></span>
          </div>
        </div>
        
        <div className="flex-1 py-space-sm px-space-xs overflow-y-auto space-y-0.5">
          <div className="px-space-sm py-space-xs font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Settlement Ops</div>
          {settlementLinks.map((item) => {
            const active = isTabActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "w-full flex items-center justify-between px-space-sm py-1.5 text-primary bg-surface-inset border-l-2 border-primary font-label-md text-label-md font-semibold shadow-[inset_2px_0_8px_rgba(173,198,255,0.2)]"
                    : "w-full flex items-center justify-between px-space-sm py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-inset border-l-2 border-transparent hover:border-primary font-label-md text-label-md transition-colors group"
                }
              >
                <div className="flex items-center gap-space-sm">
                  <span className={`material-symbols-outlined text-headline-sm ${active ? "text-primary drop-shadow-[0_0_6px_rgba(173,198,255,0.6)]" : "text-text-secondary group-hover:text-text-primary"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_#adc6ff] animate-pulse mr-1"></span>
                )}
              </Link>
            );
          })}
          
          <div className="pt-space-md px-space-sm py-space-xs font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Oracle Verification</div>
          {oracleLinks.map((item) => {
            const active = isTabActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "w-full flex items-center justify-between px-space-sm py-1.5 text-primary bg-surface-inset border-l-2 border-primary font-label-md text-label-md font-semibold shadow-[inset_2px_0_8px_rgba(173,198,255,0.2)]"
                    : "w-full flex items-center justify-between px-space-sm py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-inset border-l-2 border-transparent hover:border-primary font-label-md text-label-md transition-colors group"
                }
              >
                <div className="flex items-center gap-space-sm">
                  <span className={`material-symbols-outlined text-headline-sm ${active ? "text-primary drop-shadow-[0_0_6px_rgba(173,198,255,0.6)]" : "text-text-secondary group-hover:text-text-primary"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_#adc6ff] animate-pulse mr-1"></span>
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="p-space-sm border-t border-border-default bg-surface-inset">
          <div className="flex items-center justify-between font-label-sm text-label-sm mb-space-xs">
            <span className="text-text-tertiary">DON PEERS:</span>
            <span className="text-text-primary font-code-sm">7 ONLINE</span>
          </div>
          <div className="flex items-center justify-between font-label-sm text-label-sm">
            <span className="text-text-tertiary">MERKLE ROOT:</span>
            <span className="text-hash-spectral font-code-sm">0x91F8...6E</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="pl-64 pt-[76px] pb-7 w-full min-h-screen bg-canvas-base flex flex-col">
        {children}
      </div>

      {/* STITCH FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 h-7 bg-surface-panel border-t border-border-default z-50 flex items-center justify-between px-margin-desktop font-label-sm text-label-sm text-text-secondary">
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-xs">
            <span className="text-text-tertiary">GAS:</span>
            <span className="text-status-nominal font-code-sm">14.2 GWEI</span>
          </div>
          <div className="h-3 w-px bg-border-default"></div>
          <div className="flex items-center gap-space-xs">
            <span className="text-text-tertiary">ETH BLOCK:</span>
            <span className="text-text-primary font-code-sm">#6,892,104</span>
          </div>
          <div className="h-3 w-px bg-border-default"></div>
          <div className="flex items-center gap-space-xs">
            <span className="text-text-tertiary">IPFS GATEWAY:</span>
            <span className="text-status-nominal">PINATA / FILECOIN NOMINAL</span>
            <span className="h-1.5 w-1.5 bg-status-nominal"></span>
          </div>
        </div>
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-xs">
            <span className="text-text-tertiary">REGULATORY:</span>
            <span className="text-text-primary">FCC IBFS SYNC NOMINAL</span>
            <span className="h-1.5 w-1.5 bg-status-nominal"></span>
          </div>
          <div className="h-3 w-px bg-border-default"></div>
          <div className="flex items-center gap-space-xs">
            <span className="text-text-tertiary">ENCRYPTION:</span>
            <span className="text-hash-spectral">ED25519-ECDSA</span>
          </div>
        </div>
      </footer>
    </>
  );
}
