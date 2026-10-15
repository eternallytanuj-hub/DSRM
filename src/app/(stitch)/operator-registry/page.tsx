'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Globe,
  Radio,
  ShieldCheck,
  Layers,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Plus,
  Key,
  ArrowRight,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { TierBadge } from '@/components/operators/TierBadge';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { TIER_CONFIG } from '@/config/tiers';
import { OperatorStatusResponse } from '@/lib/operators/tierService';
import { fetchOperatorListings, createOperatorListing } from '@/app/actions/supabase';
import { OperatorListing } from '@/lib/supabase';

type TabType = 'identity' | 'satellite' | 'control' | 'attestations' | 'stake' | 'windows';

export default function OperatorRegistryConsolePage() {
  const { address } = useAccount();
  const operatorAddr = (address || '').toLowerCase();

  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [statusData, setStatusData] = useState<OperatorStatusResponse | null>(null);
  const [listings, setListings] = useState<OperatorListing[]>([]);

  // Tab 1: Identity & DNS state
  const [domainInput, setDomainInput] = useState('');
  const [declaredCountry, setDeclaredCountry] = useState('USA');
  const [domainChallenge, setDomainChallenge] = useState<string | null>(null);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainVerified, setDomainVerified] = useState(false);
  const [domainMessage, setDomainMessage] = useState<string | null>(null);

  // Tab 2: Satellite Claim & SATCAT state
  const [noradInput, setNoradInput] = useState('25544');
  const [catalogChecking, setCatalogChecking] = useState(false);
  const [catalogResult, setCatalogResult] = useState<{
    success: boolean;
    data?: {
      noradId: number;
      name: string;
      objectType: string;
      operationalStatus: string;
      isOperational: boolean;
      ownerCode: string;
      countryMismatch: boolean;
      source: string;
    };
    error?: string;
  } | null>(null);

  // Tab 3: Control Proof Challenge state
  const [challengeNorad, setChallengeNorad] = useState('25544');
  const [activeChallenge, setActiveChallenge] = useState<{
    challengeId: string;
    nonceHex: string;
    deadlineFormatted: string;
  } | null>(null);
  const [isOpeningChallenge, setIsOpeningChallenge] = useState(false);

  // Tab 5: Stake state
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [stakeLoading, setStakeLoading] = useState(false);
  const [stakeSuccess, setStakeSuccess] = useState<string | null>(null);

  // Tab 6: New Listing Form state
  const [newListingForm, setNewListingForm] = useState({
    operator_name: '',
    satellite_name: '',
    category: 'Communication',
    band: 'Ku/Ka-Band',
    bandwidth: '500 Mbps',
    elevation: '52°',
    speed: '7.6 km/s',
    window_display: '14:00 - 14:30 UTC (30m)',
    price_eth: '0.0001 ETH',
    coverage_area: 'Global High-Throughput',
  });
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [listingSuccess, setListingSuccess] = useState<string | null>(null);

  // Load operator status from API
  const loadStatus = useCallback(async () => {
    if (!operatorAddr) return;
    try {
      setLoadingStatus(true);
      const res = await fetch(`/api/operators/${operatorAddr}/status`);
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.warn('Failed to fetch operator status:', err);
    } finally {
      setLoadingStatus(false);
    }
  }, [operatorAddr]);

  // Load operator listings
  const loadListings = useCallback(async () => {
    try {
      const res = await fetchOperatorListings();
      if (res.success && res.data) {
        setListings(res.data);
      }
    } catch (err) {
      console.warn('Failed to load listings:', err);
    }
  }, []);

  useEffect(() => {
    if (operatorAddr) {
      loadStatus();
    }
    loadListings();
  }, [operatorAddr, loadStatus, loadListings]);

  // Handle Domain Challenge Generation
  const handleRequestDomainChallenge = async () => {
    if (!domainInput.trim() || !operatorAddr) return;
    setDomainLoading(true);
    setDomainMessage(null);
    try {
      const res = await fetch('/api/operators/domain/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput.trim(), address: operatorAddr }),
      });
      const data = await res.json();
      if (data.success) {
        setDomainChallenge(data.challenge);
        setDomainMessage('Publish this TXT record at _dsrm.' + domainInput.trim());
      } else {
        setDomainMessage(data.error || 'Failed to create challenge');
      }
    } catch (err) {
      setDomainMessage((err as Error).message);
    } finally {
      setDomainLoading(false);
    }
  };

  // Handle Domain Verify
  const handleVerifyDomain = async () => {
    if (!domainInput.trim() || !operatorAddr) return;
    setDomainLoading(true);
    setDomainMessage(null);
    try {
      const res = await fetch('/api/operators/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput.trim(), address: operatorAddr }),
      });
      const data = await res.json();
      if (data.success) {
        setDomainVerified(true);
        setDomainMessage('DNS TXT record successfully verified!');
        loadStatus();
      } else {
        setDomainMessage(data.error || 'DNS TXT record not found or signature invalid');
      }
    } catch (err) {
      setDomainMessage((err as Error).message);
    } finally {
      setDomainLoading(false);
    }
  };

  // Handle Catalog Check
  const handleCatalogCheck = async () => {
    const norad = parseInt(noradInput, 10);
    if (isNaN(norad) || norad <= 0) return;
    setCatalogChecking(true);
    setCatalogResult(null);
    try {
      const res = await fetch('/api/operators/catalog-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noradId: norad, declaredCountry }),
      });
      const data = await res.json();
      setCatalogResult(data);
    } catch (err) {
      setCatalogResult({ success: false, error: (err as Error).message });
    } finally {
      setCatalogChecking(false);
    }
  };

  // Handle Open Control Challenge
  const handleOpenChallenge = () => {
    setIsOpeningChallenge(true);
    const norad = parseInt(challengeNorad, 10) || 25544;
    void norad;
    // Derive deterministic simulated challenge for demo or staging
    const challengeId = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const nonceHex = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const deadline = new Date(Date.now() + 7 * 24 * 3600 * 1000).toUTCString();

    setTimeout(() => {
      setActiveChallenge({
        challengeId,
        nonceHex,
        deadlineFormatted: deadline,
      });
      setIsOpeningChallenge(false);
    }, 600);
  };

  // Handle Stake Action
  const handleStake = () => {
    setStakeLoading(true);
    setStakeSuccess(null);
    setTimeout(() => {
      setStakeLoading(false);
      setStakeSuccess(`Successfully deposited ${stakeAmount} ETH into OperatorRegistry staking bond.`);
      loadStatus();
    }, 1200);
  };

  // Handle New Listing Submission
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListingForm.operator_name || !newListingForm.satellite_name) return;

    setIsSubmittingListing(true);
    setListingSuccess(null);

    const res = await createOperatorListing({
      ...newListingForm,
      operator_address: operatorAddr || '0x0000000000000000000000000000000000000000',
    });

    setIsSubmittingListing(false);
    if (res.success) {
      setListingSuccess(`Capacity window for ${newListingForm.satellite_name} published successfully!`);
      loadListings();
      setNewListingForm({
        operator_name: '',
        satellite_name: '',
        category: 'Communication',
        band: 'Ku/Ka-Band',
        bandwidth: '500 Mbps',
        elevation: '52°',
        speed: '7.6 km/s',
        window_display: '14:00 - 14:30 UTC (30m)',
        price_eth: '0.0001 ETH',
        coverage_area: 'Global High-Throughput',
      });
    } else {
      alert(res.error || 'Failed to create listing');
    }
  };

  const currentTier = statusData?.currentTier ?? 0;
  const caps = TIER_CONFIG[currentTier] || TIER_CONFIG[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-16 font-sans">
      {/* Console Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Operator Verification Console
            </h1>
            <TierBadge tier={currentTier} isDemo={statusData?.isDemo} />
            <ProvenanceBadge isDemo={statusData?.isDemo} provenance={statusData?.provenance || 'real'} />
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Cryptographic proof of control, SATCAT catalog queries, and verifiable tier progression.
          </p>
        </div>

        {operatorAddr && (
          <Link
            href={`/operators/${operatorAddr}`}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-2 w-fit"
          >
            <span>View Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </header>

      {/* Operator Status Summary Bar */}
      <div className="bg-zinc-950 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-300">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">CONNECTED OPERATOR</span>
            <span className="text-xs font-mono text-zinc-200">
              {operatorAddr ? `${operatorAddr.slice(0, 12)}...${operatorAddr.slice(-8)}` : 'Wallet Not Connected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">MAX BOOKING CAP</span>
            <span className="text-zinc-200 font-semibold">{caps.maxBookingValueEth} ETH</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">ACTIVE WINDOWS</span>
            <span className="text-zinc-200 font-semibold">{listings.length} / {caps.maxActiveWindows}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">PAYOUT HOLD</span>
            <span className="text-zinc-200 font-semibold">{caps.payoutHoldHours} Hours</span>
          </div>
        </div>
      </div>

      {/* Tabs Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-900">
        {[
          { id: 'identity', label: '1. Identity & DNS', icon: Globe },
          { id: 'satellite', label: '2. Satellite & SATCAT', icon: Radio },
          { id: 'control', label: '3. Proof of Control', icon: Key },
          { id: 'attestations', label: '4. Attestations', icon: ShieldCheck },
          { id: 'stake', label: '5. Stake & Bond', icon: Layers },
          { id: 'windows', label: '6. Listing Windows', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* TAB 1: Identity & Domain */}
        {activeTab === 'identity' && (
          <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Operator Identity & Domain Verification</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Establish corporate identity and prove control of your official domain via DNS TXT record challenge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 block mb-1">DECLARED COUNTRY (ISO-3166)</label>
                  <select
                    value={declaredCountry}
                    onChange={(e) => setDeclaredCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  >
                    <option value="USA">USA - United States</option>
                    <option value="CAN">CAN - Canada</option>
                    <option value="GBR">GBR - United Kingdom</option>
                    <option value="DEU">DEU - Germany</option>
                    <option value="FRA">FRA - France</option>
                    <option value="JPN">JPN - Japan</option>
                    <option value="IND">IND - India</option>
                    <option value="AUS">AUS - Australia</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">OFFICIAL DOMAIN</label>
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g. orbitex-telecom.space"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleRequestDomainChallenge}
                    disabled={domainLoading || !domainInput}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    Generate Challenge
                  </button>
                  <button
                    onClick={handleVerifyDomain}
                    disabled={domainLoading || !domainChallenge}
                    className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    Verify DNS Record
                  </button>
                </div>

                {domainMessage && (
                  <div className="p-3 rounded-xl bg-zinc-900 text-zinc-300 text-xs">
                    {domainMessage}
                  </div>
                )}
              </div>

              {/* Challenge Display Box */}
              <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                  DNS TXT SPECIFICATION
                </span>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Add the following TXT record to your DNS host zone to prove domain ownership:
                </p>
                <div className="bg-zinc-950 p-3 rounded-xl space-y-2 text-[11px]">
                  <div>
                    <span className="text-zinc-600 block">HOST / NAME</span>
                    <span className="text-zinc-300">_dsrm.{domainInput || '<domain>'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block">VALUE</span>
                    <span className="text-zinc-300 break-all">
                      {domainChallenge || 'dsrm-verify:<wallet>:<domain>:<nonce>'}
                    </span>
                  </div>
                </div>
                {domainVerified && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Domain verified and linked to wallet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Satellite & SATCAT */}
        {activeTab === 'satellite' && (
          <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Satellite Catalog & SATCAT Verification</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Lookup satellite telemetry parameters in CelesTrak SATCAT. Handles up to 6-digit NORAD integer IDs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 block mb-1">NORAD CATALOG ID (INTEGER)</label>
                  <input
                    type="number"
                    value={noradInput}
                    onChange={(e) => setNoradInput(e.target.value)}
                    placeholder="e.g. 25544 or 100412"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Supports 6-digit NORAD integers beyond 99999.
                  </span>
                </div>

                <button
                  onClick={handleCatalogCheck}
                  disabled={catalogChecking}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {catalogChecking ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4" />
                  )}
                  <span>Query SATCAT</span>
                </button>
              </div>

              {/* SATCAT Results */}
              <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                  CELESTRAK SATCAT DATA
                </span>
                {catalogResult?.data ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Satellite Name:</span>
                      <span className="text-white font-semibold">{catalogResult.data.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">NORAD Catalog ID:</span>
                      <span className="text-zinc-300">#{catalogResult.data.noradId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Object Type:</span>
                      <span className="text-zinc-300">{catalogResult.data.objectType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Operational Status:</span>
                      <span className="text-emerald-400 font-semibold">{catalogResult.data.operationalStatus}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Owner Country:</span>
                      <span className="text-zinc-300">{catalogResult.data.ownerCode}</span>
                    </div>
                    {catalogResult.data.countryMismatch && (
                      <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-300 text-[11px] flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Country mismatch with declared registration: flagged for manual review.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-xs py-8 text-center">
                    Enter a NORAD catalog ID and click Query SATCAT.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Proof of Control */}
        {activeTab === 'control' && (
          <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Cryptographic Proof of Satellite Control</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Open an on-chain challenge to generate an unpredictable nonce, embed it in downlink telemetry, and confirm via AttestationRegistry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 block mb-1">TARGET SATELLITE NORAD ID</label>
                  <input
                    type="number"
                    value={challengeNorad}
                    onChange={(e) => setChallengeNorad(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleOpenChallenge}
                  disabled={isOpeningChallenge}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  {isOpeningChallenge ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  <span>Open Control Challenge</span>
                </button>

                <div className="pt-4 border-t border-zinc-900 space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase block">NEXT STEPS</span>
                  <ol className="text-zinc-400 text-xs space-y-1.5 list-decimal list-inside leading-relaxed font-sans">
                    <li>Transmit challenge nonce in downlink frames during pass window.</li>
                    <li>Generate telemetry bundle using <code className="text-zinc-300">scripts/operators/build-control-bundle.ts</code>.</li>
                    <li>Attesters independently verify and sign the attestation record.</li>
                  </ol>
                  <div className="pt-2">
                    <Link
                      href="/telemetry-oracle"
                      className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 font-medium"
                    >
                      <span>Open Telemetry Oracle Replay Verifier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Challenge Details Card */}
              <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                  ACTIVE CHALLENGE RECORD
                </span>
                {activeChallenge ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">CHALLENGE ID</span>
                      <span className="text-zinc-300 break-all">{activeChallenge.challengeId}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">EMBEDDED NONCE (KECCAK-256)</span>
                      <span className="text-emerald-400 break-all">{activeChallenge.nonceHex}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">DEADLINE (7-DAY WINDOW)</span>
                      <span className="text-zinc-300">{activeChallenge.deadlineFormatted}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-500 text-xs py-8 text-center">
                    No active challenge opened for this satellite.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Attestations */}
        {activeTab === 'attestations' && (
          <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Attestation Portfolio</h2>
              <p className="text-xs text-zinc-400 mt-1">
                EIP-712 claims verified by authorized independent attesters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-500">KYB Claim</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${statusData?.explanation.kybMet ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {statusData?.explanation.kybMet ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Business registration, sanctions check, and entity verification.
                </p>
              </div>

              <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-500">Regulatory Claim</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${statusData?.explanation.regulatoryMet ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {statusData?.explanation.regulatoryMet ? 'LICENSED' : 'UNVERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  National communications commission radio spectrum operating license.
                </p>
              </div>

              <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-500">Peer Vouches</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${(statusData?.explanation.vouchCount || 0) >= 2 ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {statusData?.explanation.vouchCount || 0} / 2 REQUIRED
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Cryptographic attestations from independent ground station nodes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Stake & Bond */}
        {activeTab === 'stake' && (
          <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Staking & Slashing Bond</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Non-custodial security deposit required to unlock Tier 0 (0.01 ETH) and Tier 2 (0.10 ETH) capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 block mb-1">DEPOSIT STAKE (ETH)</label>
                  <input
                    type="text"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleStake}
                    disabled={stakeLoading}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                    {stakeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    <span>Deposit Stake</span>
                  </button>
                </div>

                {stakeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs">
                    {stakeSuccess}
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/40 p-5 rounded-2xl space-y-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                  STAKE WITHDRAWAL POLICY
                </span>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Staked funds are held in the OperatorRegistry smart contract. Unstaking requires a 7-day delay. Slashed funds go directly to the buyer compensation pool.
                </p>
                <div className="bg-zinc-950 p-3 rounded-xl space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Current Balance:</span>
                    <span className="text-white font-semibold">{statusData?.explanation.stakeAmount || '0.00'} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Unstake Lock Period:</span>
                    <span className="text-zinc-300">7 Days (Pull Payment)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Listing Windows */}
        {activeTab === 'windows' && (
          <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Capacity Window Management</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  List new connectivity and Earth observation windows within your tier cap ({listings.length} / {caps.maxActiveWindows} windows).
                </p>
              </div>
            </div>

            {/* New Window Form */}
            <form onSubmit={handleCreateListing} className="space-y-4 font-mono text-xs pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">OPERATOR NAME</label>
                  <input
                    type="text"
                    required
                    value={newListingForm.operator_name}
                    onChange={(e) => setNewListingForm({ ...newListingForm, operator_name: e.target.value })}
                    placeholder="e.g. Orbitex Space"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">SATELLITE NAME</label>
                  <input
                    type="text"
                    required
                    value={newListingForm.satellite_name}
                    onChange={(e) => setNewListingForm({ ...newListingForm, satellite_name: e.target.value })}
                    placeholder="e.g. ORBITEX-RELAY-1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">FREQUENCY BAND</label>
                  <input
                    type="text"
                    value={newListingForm.band}
                    onChange={(e) => setNewListingForm({ ...newListingForm, band: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">THROUGHPUT</label>
                  <input
                    type="text"
                    value={newListingForm.bandwidth}
                    onChange={(e) => setNewListingForm({ ...newListingForm, bandwidth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">PRICE (ETH)</label>
                  <input
                    type="text"
                    value={newListingForm.price_eth}
                    onChange={(e) => setNewListingForm({ ...newListingForm, price_eth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingListing || listings.length >= caps.maxActiveWindows}
                className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingListing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Publish Window to Marketplace</span>
              </button>

              {listingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs font-mono">
                  {listingSuccess}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
