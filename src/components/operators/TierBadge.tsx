'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Globe, AlertTriangle, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TIER_CONFIG } from '@/config/tiers';

export interface TierBadgeProps {
  tier: number | 'Suspended' | 'Contested';
  isDemo?: boolean;
  className?: string;
  showTooltip?: boolean;
}

export function TierBadge({
  tier,
  isDemo = false,
  className = '',
  showTooltip = true,
}: TierBadgeProps) {
  const isSuspended = tier === 'Suspended';
  const isContested = tier === 'Contested';
  const numericTier = typeof tier === 'number' ? tier : 0;
  const caps = TIER_CONFIG[numericTier] || TIER_CONFIG[0];

  let config = {
    label: caps.name,
    icon: Globe,
    classes: 'bg-zinc-900 text-zinc-400 border-0',
    tooltip: caps.description,
  };

  if (isSuspended) {
    config = {
      label: 'Suspended',
      icon: AlertTriangle,
      classes: 'bg-red-950/60 text-red-300 border-0',
      tooltip: 'Operator stake slashed or open dispute unresolved. Capability downgraded.',
    };
  } else if (isContested) {
    config = {
      label: 'Contested',
      icon: Clock,
      classes: 'bg-amber-950/60 text-amber-300 border-0',
      tooltip: 'Conflicting satellite control claim submitted by another operator. Awaiting Arbiter resolution.',
    };
  } else if (numericTier === 2) {
    config = {
      label: 'Tier 2 Trusted',
      icon: ShieldCheck,
      classes: 'bg-zinc-800 text-zinc-100 font-medium border-0',
      tooltip: `${caps.description} (Max: ${caps.maxBookingValueEth} ETH, ${caps.maxActiveWindows} windows, ${caps.payoutHoldHours}h hold)`,
    };
  } else if (numericTier === 1) {
    config = {
      label: 'Tier 1 Controlled',
      icon: CheckCircle2,
      classes: 'bg-zinc-900 text-zinc-300 border-0',
      tooltip: `${caps.description} (Max: ${caps.maxBookingValueEth} ETH, ${caps.maxActiveWindows} windows, ${caps.payoutHoldHours}h hold)`,
    };
  } else {
    config = {
      label: 'Tier 0 Listed',
      icon: Globe,
      classes: 'bg-zinc-950 text-zinc-400 border-0',
      tooltip: `${caps.description} (Max: ${caps.maxBookingValueEth} ETH, ${caps.maxActiveWindows} windows, ${caps.payoutHoldHours}h hold)`,
    };
  }

  const Icon = config.icon;

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs transition-colors ${config.classes} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {isDemo && (
        <span className="text-[10px] uppercase font-mono px-1 rounded bg-amber-500/20 text-amber-300 ml-1">
          DEMO
        </span>
      )}
    </span>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="bg-zinc-950 text-zinc-200 border-0 p-3 max-w-xs text-xs font-mono space-y-1">
          <div className="font-semibold text-white">{config.label}</div>
          <div className="text-zinc-400 text-[11px] leading-relaxed">{config.tooltip}</div>
          {!isSuspended && !isContested && (
            <div className="pt-2 border-t border-zinc-800 text-[10px] space-y-0.5 text-zinc-400">
              <div>Booking Cap: {caps.maxBookingValueEth} ETH</div>
              <div>Max Windows: {caps.maxActiveWindows}</div>
              <div>Payout Hold: {caps.payoutHoldHours} hours</div>
              {caps.deliveryBoundChallengeRequired && (
                <div className="text-zinc-300 font-semibold">Delivery Nonce Challenge Required</div>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
