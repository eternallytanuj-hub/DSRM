'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { 
  ShoppingCart, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Terminal 
} from "lucide-react";
import "../globals.css";

const navLinks = [
  { href: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  { href: "/my-bookings", label: "My Bookings", icon: Calendar },
  { href: "/escrow-clearing", label: "Escrow & Clearing", icon: ShieldCheck },
  { href: "/telemetry-oracle", label: "Telemetry Oracle", icon: Activity },
  { href: "/operator-registry", label: "Operator Registry", icon: Globe },
  { href: "/api-smart-contract", label: "API & Smart Contract", icon: Terminal },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  return (
    <div className="min-h-screen bg-[#07080C] text-white selection:bg-white/20 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 flex-shrink-0 flex flex-col backdrop-blur-2xl bg-white/[0.02] border-r border-white/[0.05] relative z-10">
          <div className="p-6 flex items-center gap-3 border-b border-white/[0.05]">
            <img src="/DSRM_logo.png" alt="DSRM" className="w-8 h-8 object-contain" />
            <span className="font-semibold tracking-wide text-sm opacity-90">DSRM Network</span>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navLinks.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "opacity-100" : "opacity-50"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/[0.05] bg-white/[0.01]">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
              <span className="text-xs text-white/50">System Nominal</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative z-0">
          <div className="max-w-6xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
