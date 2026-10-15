'use client';

import React from 'react';
import { FlaskConical } from 'lucide-react';

export interface DemoModeBannerProps {
  onOpenConsole?: () => void;
  className?: string;
}

export function DemoModeBanner({ onOpenConsole, className = '' }: DemoModeBannerProps) {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (!isDemo) return null;

  return (
    <div
      className={`w-full bg-amber-950/70 border-b border-amber-500/20 text-amber-200 px-4 py-2 flex items-center justify-between text-xs font-mono transition-all z-40 relative ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold text-amber-300">
          DEMO MODE: simulated verification, not real operators.
        </span>
        <span className="hidden sm:inline text-amber-400/70 text-[11px]">
          Runs real verifiers (Merkle, SHA-256, EIP-712, SGP4) in isolated demo namespace.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hidden md:inline">
          is_demo = true
        </span>
        {onOpenConsole && (
          <button
            onClick={onOpenConsole}
            className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 text-[11px] font-medium transition-colors"
          >
            Judge Console
          </button>
        )}
      </div>
    </div>
  );
}
