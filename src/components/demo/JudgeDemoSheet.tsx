'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  FlaskConical,
  Play,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { TierBadge } from '@/components/operators/TierBadge';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { TierExplanationState } from '@/lib/operators/tierService';

interface ScenarioDef {
  id: string;
  title: string;
  subtitle: string;
  steps: {
    label: string;
    action: string;
    description: string;
    expectedTier: number | 'Suspended' | 'Contested';
  }[];
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'honest_climb',
    title: '1. Honest Operator Climb (T0 → T1 → T2)',
    subtitle: 'Demonstrates pure on-chain derivation climbing across all 3 tiers as cryptographic proofs are verified.',
    steps: [
      {
        label: 'Register & Stake S0 (0.01 ETH)',
        action: 'simulate_stake',
        description: 'Deposits non-custodial security bond into OperatorRegistry.',
        expectedTier: 0,
      },
      {
        label: 'Attest KYB & Domain DNS TXT',
        action: 'simulate_dns',
        description: 'Verifies entity clearance and proves domain ownership at _dsrm.<domain>.',
        expectedTier: 0,
      },
      {
        label: 'Submit Control Proof (NORAD #43017)',
        action: 'simulate_control_proof',
        description: 'Transmits on-chain challenge nonce, builds real Merkle tree, and verifies SGP4 geometry.',
        expectedTier: 1,
      },
      {
        label: 'Upgrade to Tier 2 (S2 Stake + Regulatory + 2 Vouches)',
        action: 'simulate_vouch',
        description: 'Increases stake to 0.10 ETH, attests sovereign spectrum license, and secures 2 independent vouches.',
        expectedTier: 2,
      },
    ],
  },
  {
    id: 'identity_spoofer',
    title: '2. Identity Spoofer (Contested Claim)',
    subtitle: 'Rogue actor attempts to claim a satellite already controlled by an honest operator.',
    steps: [
      {
        label: 'Attempt Unauthorized Satellite Takeover',
        action: 'fraud_identity_spoofer',
        description: 'Rogue wallet submits conflicting claim for active NORAD satellite. Contract flags Contested status and suspends Tier 1.',
        expectedTier: 'Contested',
      },
    ],
  },
  {
    id: 'passive_replay',
    title: '3. Passive-Replay Telemetry Fraud',
    subtitle: 'Attacker attempts to settle escrow using historical frames without the buyer delivery nonce.',
    steps: [
      {
        label: 'Test Missing Buyer Nonce & Stale Timestamps',
        action: 'fraud_passive_replay',
        description: 'Runs real Step 8 Telemetry Verifier against replayed frames. Fails with "Passive replay fraud detected: nonce absent".',
        expectedTier: 1,
      },
    ],
  },
  {
    id: 'unauthorized_attester',
    title: '4. Unauthorized Attester Signature',
    subtitle: 'Adversary signs claims with an unapproved keypair not in the on-chain attester quorum.',
    steps: [
      {
        label: 'Submit Rogue Attester Claim',
        action: 'fraud_unauthorized_attester',
        description: 'EIP-712 recovery recovers rogue address. Verifier confirms signer is not in isAttester set and rejects the claim.',
        expectedTier: 0,
      },
    ],
  },
  {
    id: 'dispute_slash',
    title: '5. Arbiter Dispute & Stake Slashing',
    subtitle: 'Arbiter resolves customer dispute and slashes operator stake, collapsing capability tier.',
    steps: [
      {
        label: 'Execute 0.05 ETH Slashing Penalty',
        action: 'simulate_slash',
        description: 'Slashes security bond below S0 minimum threshold. Pure derivation immediately marks status Suspended.',
        expectedTier: 'Suspended',
      },
    ],
  },
];

const STEP_DESCRIPTIONS: Record<string, string> = {
  simulate_register: 'In production, requires wallet signing register() on the deployed OperatorRegistry smart contract.',
  simulate_stake: 'In production, requires sending native ETH to stake() on-chain with a 7-day unstaking delay.',
  simulate_kyb: 'In production, requires KYC/KYB vendor audit (e.g. Sumsub) and EIP-712 signature from an authorized attester.',
  simulate_dns: 'In production, requires adding a DNS TXT record at _dsrm.<domain> matching the dsrm-verify signature.',
  simulate_control_proof: 'In production, requires opening an on-chain challenge, broadcasting the nonce via RF, and submitting AttestationRegistry proof.',
  simulate_regulatory: 'In production, requires filing review against sovereign ITU/FCC telecommunications databases.',
  simulate_vouch: 'In production, requires 2 separate cryptographic vouch claims from independent ground station operators.',
  simulate_slash: 'In production, requires Arbiter multisig execution on the OperatorRegistry contract following a verified dispute.',
  fast_forward_time: 'In production, occurs naturally after 90 days if control proofs are not renewed before expiry.',
};

export function JudgeDemoSheet() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const [isOpen, setIsOpen] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState('honest_climb');
  const [currentScenarioStepIdx, setCurrentScenarioStepIdx] = useState(0);
  const [demoState, setDemoState] = useState<TierExplanationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepResult, setStepResult] = useState<{
    success: boolean;
    message?: string;
    details?: string;
  } | null>(null);
  const [expandedInfoKey, setExpandedInfoKey] = useState<string | null>(null);

  const demoOperator = '0x1111111111111111111111111111111111111111';

  // Load initial demo status
  const fetchDemoStatus = async () => {
    try {
      const res = await fetch(`/api/operators/${demoOperator}/status?isDemo=true`);
      if (res.ok) {
        const data = await res.json();
        setDemoState(data.explanation);
      }
    } catch (err) {
      console.warn('Failed to fetch demo operator status:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDemoStatus();
    }
  }, [isOpen]);

  const executeDemoAction = async (action: string) => {
    setLoading(true);
    setStepResult(null);
    try {
      const res = await fetch('/api/demo/execute-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          operatorAddress: demoOperator,
          noradId: 43017,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDemoState(data.explanation || null);
        setStepResult({
          success: true,
          message: data.message || `Executed ${action} successfully.`,
          details: data.details ? JSON.stringify(data.details, null, 2) : undefined,
        });
      } else {
        setStepResult({
          success: false,
          message: data.error || 'Simulation failed',
        });
      }
    } catch (err) {
      setStepResult({
        success: false,
        message: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextScenarioStep = async () => {
    const sc = SCENARIOS.find((s) => s.id === activeScenarioId);
    if (!sc) return;

    const currentStep = sc.steps[currentScenarioStepIdx];
    if (currentStep) {
      await executeDemoAction(currentStep.action);
      if (currentScenarioStepIdx < sc.steps.length - 1) {
        setCurrentScenarioStepIdx((prev) => prev + 1);
      }
    }
  };

  const handleReset = async () => {
    await executeDemoAction('reset');
    setCurrentScenarioStepIdx(0);
    setStepResult(null);
  };

  if (!isDemo) return null;

  const currentScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];
  const derivedTier = demoState ? (demoState.isSuspended ? 'Suspended' : demoState.hasUnresolvedContest ? 'Contested' : demoState.currentTier) : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-amber-950/90 hover:bg-amber-900 text-amber-200 border border-amber-500/30 font-mono text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
        >
          <FlaskConical className="w-4 h-4 text-amber-400" />
          <span>Judge Demo Console</span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-[#07080C] text-zinc-100 border-l border-zinc-900 p-6 sm:p-8 overflow-y-auto font-sans"
      >
        <SheetHeader className="space-y-2 text-left pb-4 border-b border-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FlaskConical className="w-5 h-5 text-amber-400" />
              <SheetTitle className="text-xl font-semibold text-white tracking-tight">
                Judge Demo Console
              </SheetTitle>
            </div>
            <ProvenanceBadge isDemo={true} provenance="simulated" />
          </div>
          <SheetDescription className="text-xs text-zinc-400 font-mono">
            Deterministic fraud and tier-climb scenarios executing real verifier logic in an isolated demo namespace.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8 text-xs font-mono">
          {/* Current Live Demo Operator State */}
          <div className="bg-zinc-950 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                DEMO OPERATOR STATE (IS_DEMO = TRUE)
              </span>
              <TierBadge tier={derivedTier} isDemo={true} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-500 block">WALLET ADDRESS</span>
                <span className="text-zinc-300 truncate block">{demoOperator}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">STAKE AMOUNT</span>
                <span className="text-zinc-200 font-semibold">{demoState?.stakeAmount || '0 ETH'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">KYB & DNS</span>
                <span className={demoState?.kybMet && demoState?.domainMet ? 'text-emerald-400' : 'text-zinc-500'}>
                  {demoState?.kybMet && demoState?.domainMet ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">CONTROLLED SATS</span>
                <span className={demoState && demoState.controlledSatelliteCount > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                  {demoState?.controlledSatelliteCount || 0} Satellites
                </span>
              </div>
            </div>
          </div>

          {/* Guided Scenarios Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white font-sans">Guided Verification Scenarios</h3>
              <button
                onClick={handleReset}
                disabled={loading}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>

            {/* Scenario Selector Pills */}
            <div className="flex flex-col gap-1.5">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenarioId(sc.id);
                    setCurrentScenarioStepIdx(0);
                    setStepResult(null);
                  }}
                  className={`p-3 rounded-xl text-left transition-all flex items-center justify-between ${
                    activeScenarioId === sc.id
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/60'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold block">{sc.title}</span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">{sc.subtitle}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                </button>
              ))}
            </div>

            {/* Active Scenario Step Runner Card */}
            <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <div className="text-white font-semibold text-xs font-sans">
                  {currentScenario.title}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  {currentScenario.subtitle}
                </p>
              </div>

              {/* Steps Progress */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                {currentScenario.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl flex items-start gap-3 transition-colors ${
                      idx === currentScenarioStepIdx
                        ? 'bg-zinc-800/80 text-white'
                        : idx < currentScenarioStepIdx
                        ? 'bg-emerald-950/20 text-emerald-300'
                        : 'bg-zinc-950 text-zinc-500'
                    }`}
                  >
                    <div className="mt-0.5">
                      {idx < currentScenarioStepIdx ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-zinc-700 text-[10px] flex items-center justify-center text-zinc-300">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="text-xs font-medium font-sans">{st.label}</div>
                      <p className="text-[10px] text-zinc-400 font-sans">{st.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleNextScenarioStep}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  <span>
                    Execute Step {currentScenarioStepIdx + 1} of {currentScenario.steps.length}
                  </span>
                </button>
              </div>

              {/* Result Notice */}
              {stepResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                    stepResult.success
                      ? 'bg-emerald-950/60 text-emerald-200'
                      : 'bg-red-950/60 text-red-200'
                  }`}
                >
                  <div className="font-semibold">{stepResult.message}</div>
                  {stepResult.details && (
                    <pre className="text-[10px] overflow-x-auto bg-black/40 p-2 rounded text-zinc-300">
                      {stepResult.details}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Granular Step Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white font-sans">Granular Step Simulators</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { action: 'simulate_register', label: 'Register Operator' },
                { action: 'simulate_stake', label: 'Stake 0.01 ETH' },
                { action: 'simulate_kyb', label: 'Approve KYB' },
                { action: 'simulate_dns', label: 'Bind DNS TXT' },
                { action: 'simulate_control_proof', label: 'Control Proof' },
                { action: 'simulate_regulatory', label: 'Regulatory License' },
                { action: 'simulate_vouch', label: 'Peer Vouches' },
                { action: 'simulate_slash', label: 'Dispute & Slash' },
                { action: 'fast_forward_time', label: 'Fast-Forward 90d' },
                { action: 'reset', label: 'Reset State' },
              ].map((btn) => (
                <div key={btn.action} className="bg-zinc-900/30 p-2.5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-300 text-[11px] truncate">{btn.label}</span>
                    <button
                      onClick={() => setExpandedInfoKey(expandedInfoKey === btn.action ? null : btn.action)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => executeDemoAction(btn.action)}
                    disabled={loading}
                    className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono transition-colors disabled:opacity-50"
                  >
                    Simulate Step
                  </button>
                  {expandedInfoKey === btn.action && (
                    <p className="text-[10px] text-zinc-400 font-sans leading-tight pt-1 border-t border-zinc-800">
                      {STEP_DESCRIPTIONS[btn.action] || 'Simulates real verification in demo environment.'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real vs Simulated Legend */}
          <div className="bg-zinc-950 p-5 rounded-2xl space-y-3 font-sans">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Real vs. Simulated Legend
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-zinc-400 text-[11px]">
                  <strong className="text-zinc-200">REAL COMPUTATION:</strong> Cryptographic SHA-256 canonical hashing, Merkle leaf/node proof generation, SGP4 orbital propagation, Viem EIP-712 signature verification, and pure on-chain tier derivation function <code className="text-zinc-300 font-mono">tierOf()</code>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-zinc-400 text-[11px]">
                  <strong className="text-zinc-200">SIMULATED / TESTNET:</strong> Attester keypairs live on testnet, RF frames synthetic in demo namespace, and mock KYB review records. Never writes to mainnet or real registries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
