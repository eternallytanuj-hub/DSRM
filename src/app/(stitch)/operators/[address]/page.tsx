'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Radio,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { TierExplainedCard } from '@/components/operators/TierExplainedCard';
import { TierBadge } from '@/components/operators/TierBadge';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { OperatorStatusResponse } from '@/lib/operators/tierService';

export default function OperatorPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const addressParam = Array.isArray(params?.address) ? params.address[0] : (params?.address as string);
  const operatorAddress = (addressParam || '').toLowerCase();

  const [statusData, setStatusData] = useState<OperatorStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!operatorAddress) return;

    let mounted = true;
    async function loadStatus() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/operators/${operatorAddress}/status`);
        if (!res.ok) {
          throw new Error(`Failed to load operator status: ${res.statusText}`);
        }
        const data = await res.json();
        if (mounted) {
          setStatusData(data);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStatus();
    return () => {
      mounted = false;
    };
  }, [operatorAddress]);

  const handleCopy = () => {
    if (!operatorAddress) return;
    navigator.clipboard.writeText(operatorAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
        <p className="text-xs font-mono text-zinc-500">Querying on-chain operator registry & derivation matrix...</p>
      </div>
    );
  }

  if (error || !statusData) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6">
        <div className="bg-zinc-950 p-8 rounded-3xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-semibold text-white">Operator Not Found</h2>
          <p className="text-xs text-zinc-400 font-mono">
            Could not retrieve verification records for address <code className="text-zinc-300">{operatorAddress}</code>.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              href="/operator-registry"
              className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
            >
              Operator Registry
            </Link>
            <Link
              href="/marketplace"
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto pb-16 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <ProvenanceBadge isDemo={statusData.isDemo} provenance={statusData.provenance} />
      </div>

      {/* Operator Header Card */}
      <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-300">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-semibold text-white tracking-tight">
                    Operator Profile
                  </h1>
                  <TierBadge
                    tier={
                      statusData.explanation.isSuspended
                        ? 'Suspended'
                        : statusData.explanation.hasUnresolvedContest
                        ? 'Contested'
                        : statusData.currentTier
                    }
                    isDemo={statusData.isDemo}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-0.5">
                  <span>{operatorAddress}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:text-white transition-colors text-zinc-500"
                    title="Copy address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://sepolia.etherscan.io/address/${operatorAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-white transition-colors text-zinc-500"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl">
              <span className="text-zinc-500 text-[10px] block">TOTAL STAKE</span>
              <span className="text-zinc-200 font-semibold">{statusData.explanation.stakeAmount} ETH</span>
            </div>
            <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl">
              <span className="text-zinc-500 text-[10px] block">SATELLITES</span>
              <span className="text-zinc-200 font-semibold">{statusData.explanation.controlledSatelliteCount} Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Explanation Matrix Card */}
      <TierExplainedCard
        explanation={statusData.explanation}
        operatorAddress={operatorAddress}
        isDemo={statusData.isDemo}
      />

      {/* Controlled Satellites Catalog Section */}
      <div className="bg-zinc-950 rounded-3xl p-6 lg:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Controlled Satellites</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Satellites verified via on-chain ephemeris control challenge
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full">
            {statusData.explanation.activeControlledNoradIds.length} Verified
          </span>
        </div>

        {statusData.explanation.activeControlledNoradIds.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/20 rounded-2xl text-xs font-mono text-zinc-500">
            No confirmed satellite control claims for this operator.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {statusData.explanation.activeControlledNoradIds.map((noradId) => (
              <div
                key={noradId}
                className="bg-zinc-900/30 p-4 rounded-2xl flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-900 text-zinc-300">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-semibold block">NORAD #{noradId}</span>
                    <span className="text-zinc-500 text-[10px]">CelesTrak SATCAT Verified</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-semibold">
                  Controlled
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
