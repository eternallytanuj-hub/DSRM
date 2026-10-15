'use client';

import React from 'react';
import { ShieldCheck, Cpu, FlaskConical } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ProvenanceBadgeProps {
  provenance?: 'real' | 'derived' | 'simulated';
  isDemo?: boolean;
  label?: string;
  className?: string;
}

export function ProvenanceBadge({
  provenance = 'real',
  isDemo = false,
  label,
  className = '',
}: ProvenanceBadgeProps) {
  const effectiveProvenance = isDemo ? 'simulated' : provenance;

  const config = {
    real: {
      text: label || 'Real On-Chain',
      icon: ShieldCheck,
      classes: 'bg-emerald-950/60 text-emerald-400 border-0',
      tooltip: 'Derived from live Ethereum Sepolia contract state or verified cryptographic signatures.',
    },
    derived: {
      text: label || 'Derived',
      icon: Cpu,
      classes: 'bg-sky-950/60 text-sky-400 border-0',
      tooltip: 'Deterministically recomputed from verifiable telemetry evidence and SGP4 propagation.',
    },
    simulated: {
      text: label || 'SIMULATED DEMO',
      icon: FlaskConical,
      classes: 'bg-amber-950/70 text-amber-300 font-mono tracking-wider border-0',
      tooltip: 'Simulated environment evidence executed with real verifier algorithms against demo keys.',
    },
  }[effectiveProvenance];

  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${config.classes} ${className}`}
          >
            <Icon className="w-3 h-3" />
            <span>{config.text}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 text-zinc-200 text-xs max-w-xs border-0">
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
