'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Globe,
  Radio,
  FileText,
  Layers,
  Info,
} from 'lucide-react';
import { TierExplanationState } from '@/lib/operators/tierService';
import { TIER_CONFIG } from '@/config/tiers';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { TierBadge } from './TierBadge';

export interface TierExplainedCardProps {
  explanation: TierExplanationState;
  operatorAddress: string;
  isDemo?: boolean;
}

export function TierExplainedCard({
  explanation,
  operatorAddress,
  isDemo = false,
}: TierExplainedCardProps) {
  const currentTier = explanation.currentTier;
  const caps = TIER_CONFIG[currentTier] || TIER_CONFIG[0];

  const requirements = [
    {
      id: 'reg',
      label: 'Operator Wallet Registered',
      met: explanation.registered,
      category: 'Tier 0',
      description: 'Operator registered on-chain in OperatorRegistry contract.',
      details: explanation.registered ? `Wallet: ${operatorAddress.slice(0, 10)}...` : 'Not registered',
      icon: Globe,
    },
    {
      id: 'stake_s0',
      label: 'Minimum Stake S0 (0.01 ETH)',
      met: explanation.hasMinStakeT0,
      category: 'Tier 0',
      description: 'Active stake deposited into non-custodial staking balance.',
      details: `Staked: ${explanation.stakeAmount} ETH (Required: 0.01 ETH)`,
      icon: Layers,
    },
    {
      id: 'kyb',
      label: 'KYB Entity Verification Attested',
      met: explanation.kybMet,
      category: 'Tier 0',
      description: 'Corporate registration & sanction clearance verified by authorized attester.',
      details: explanation.kybMet
        ? `Attesters: ${explanation.kybAttesters.length > 0 ? explanation.kybAttesters.join(', ') : 'Authorized Attester'}`
        : 'Pending verification',
      icon: FileText,
    },
    {
      id: 'domain',
      label: 'Official Domain TXT Binding',
      met: explanation.domainMet,
      category: 'Tier 0',
      description: 'Cryptographic challenge verified via DNS TXT record at _dsrm.<domain>.',
      details: explanation.domainMet
        ? `DNS Verified (Attesters: ${explanation.domainAttesters.length > 0 ? explanation.domainAttesters.join(', ') : 'Authorized Attester'})`
        : 'Pending DNS resolution',
      icon: Globe,
    },
    {
      id: 'control',
      label: 'Satellite Control Proof Challenge',
      met: explanation.controlledSatelliteCount > 0 && !explanation.hasUnresolvedContest,
      category: 'Tier 1',
      description: 'Ephemeris challenge nonce broadcasted and confirmed via AttestationRegistry.',
      details: explanation.controlledSatelliteCount > 0
        ? `${explanation.controlledSatelliteCount} Controlled Satellite(s): NORAD ${explanation.activeControlledNoradIds.join(', ') || 'Active'}`
        : explanation.hasUnresolvedContest
        ? 'Contested Claim under arbitration'
        : 'No confirmed control proof',
      icon: Radio,
    },
    {
      id: 'stake_s2',
      label: 'Trusted Stake S2 (0.10 ETH)',
      met: explanation.hasMinStakeT2,
      category: 'Tier 2',
      description: 'Higher security bond to underwrite large booking volumes.',
      details: `Staked: ${explanation.stakeAmount} ETH (Required: 0.10 ETH)`,
      icon: Layers,
    },
    {
      id: 'regulatory',
      label: 'Regulatory Licensing Attestation',
      met: explanation.regulatoryMet,
      category: 'Tier 2',
      description: 'Filing verification against public sovereign telecommunications database.',
      details: explanation.regulatoryMet
        ? `Licensed (Attesters: ${explanation.regulatoryAttesters.length > 0 ? explanation.regulatoryAttesters.join(', ') : 'Authorized Attester'})`
        : 'Pending review',
      icon: ShieldCheck,
    },
    {
      id: 'vouches',
      label: 'Independent Peer Vouches (≥ 2)',
      met: explanation.vouchCount >= 2,
      category: 'Tier 2',
      description: 'Reputational attestations from independent ground station operators.',
      details: `Vouches: ${explanation.vouchCount} / 2 required`,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white tracking-tight">Tier Derivation Matrix</h2>
            <TierBadge
              tier={explanation.isSuspended ? 'Suspended' : explanation.hasUnresolvedContest ? 'Contested' : currentTier}
              isDemo={isDemo}
            />
            <ProvenanceBadge isDemo={isDemo} provenance={isDemo ? 'simulated' : 'real'} />
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Pure on-chain function <code className="text-zinc-300">tierOf(address)</code> recomputed live from verifiable facts.
          </p>
        </div>

        {/* Caps Summary Pills */}
        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="bg-zinc-900/60 p-2.5 rounded-xl">
            <span className="text-zinc-500 block text-[10px]">BOOKING CAP</span>
            <span className="text-zinc-200 font-semibold">{caps.maxBookingValueEth} ETH</span>
          </div>
          <div className="bg-zinc-900/60 p-2.5 rounded-xl">
            <span className="text-zinc-500 block text-[10px]">ACTIVE WINDOWS</span>
            <span className="text-zinc-200 font-semibold">{caps.maxActiveWindows}</span>
          </div>
          <div className="bg-zinc-900/60 p-2.5 rounded-xl">
            <span className="text-zinc-500 block text-[10px]">PAYOUT HOLD</span>
            <span className="text-zinc-200 font-semibold">{caps.payoutHoldHours}h</span>
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          On-Chain Requirements & Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requirements.map((req) => (
            <div
              key={req.id}
                className={`p-4 rounded-2xl transition-colors flex items-start gap-3.5 ${
                  req.met
                    ? 'bg-zinc-900/40 text-zinc-200'
                    : 'bg-zinc-900/10 text-zinc-500'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    req.met
                      ? 'bg-emerald-950/60 text-emerald-400'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  {req.met ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {req.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {req.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {req.description}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 pt-0.5 truncate">
                    {req.details}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* What this tier does NOT prove notice */}
      <div className="bg-zinc-900/30 rounded-2xl p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-semibold">
          <Info className="w-4 h-4 text-zinc-400" />
          <span>What this tier does NOT prove</span>
        </div>
        <ul className="text-zinc-400 text-[11px] space-y-1 list-disc list-inside">
          <li>Does NOT guarantee 100% nominal telemetry delivery or uplink reception on every pass.</li>
          <li>Does NOT insure against localized RF jamming, physical hardware degradation, or solar flare interference.</li>
          <li>Does NOT substitute for sovereign ITU/FCC operating authorization in the buyer&apos;s specific territory.</li>
        </ul>
      </div>
    </div>
  );
}
