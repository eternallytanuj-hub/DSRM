'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  Plus, 
  Radio, 
  Clock, 
  Wifi, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { supabase, OperatorListing, Profile } from '@/lib/supabase';
import { fetchOperatorListings, createOperatorListing, fetchProfiles } from '@/app/actions/supabase';

export default function OperatorRegistryPage() {
  const { address, isConnected } = useAccount();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<OperatorListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tierFilter, setTierFilter] = useState<'ALL' | 'VERIFIED' | 'TIER1'>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    operator_name: '',
    satellite_name: '',
    category: 'Communication',
    band: 'Ku/Ka-Band',
    bandwidth: '500 Mbps',
    elevation: '52°',
    speed: '7.6 km/s',
    window_display: '14:00 - 14:30 UTC (30m)',
    price_eth: '0.0001 ETH',
    coverage_area: 'Global High-Throughput'
  });

  const loadData = useCallback(async () => {
    try {
      const [profRes, listRes] = await Promise.all([
        fetchProfiles(),
        fetchOperatorListings()
      ]);

      if (profRes.success && profRes.data) {
        setProfiles(profRes.data);
      }
      if (listRes.success && listRes.data) {
        setListings(listRes.data);
      }
    } catch (err) {
      console.error('Error loading Supabase operator data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Supabase realtime updates on both operator listings and profiles
    const channel = supabase
      .channel('operator_registry_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operator_listings' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.operator_name.trim() || !form.satellite_name.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    const operatorAddr = (address || '0x1928374619283746192837461928374619283746').toLowerCase();

    const res = await createOperatorListing({
      ...form,
      operator_address: operatorAddr
    });

    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(`Capacity window for ${form.satellite_name} published to Supabase!`);
      loadData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
      }, 1500);
    } else {
      alert(res.error || 'Failed to publish listing');
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (tierFilter === 'VERIFIED') return p.kyc_tier === 'Tier 2' || p.kyc_tier === 'Tier 3';
    if (tierFilter === 'TIER1') return p.kyc_tier === 'Tier 1';
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/95">Operator Registry & Capacity</h1>
          <p className="text-white/50 mt-1 text-sm">
            FCC / ITU verified network participants and on-demand capacity windows stored in Supabase.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/[0.12] transition-all flex items-center gap-2 shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>List Capacity Window</span>
        </button>
      </header>

      {/* Verified Operator Profiles */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white/90">Network Participants & KYC Tiers</h2>
            <p className="text-xs text-white/40 mt-0.5">Tier 1 anonymous terminals vs Tier 2/3 verified operators</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => setTierFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                tierFilter === 'ALL'
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              All ({profiles.length})
            </button>
            <button
              onClick={() => setTierFilter('VERIFIED')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                tierFilter === 'VERIFIED'
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Tier 2/3 ({profiles.filter(p => p.kyc_tier === 'Tier 2' || p.kyc_tier === 'Tier 3').length})
            </button>
            <button
              onClick={() => setTierFilter('TIER1')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                tierFilter === 'TIER1'
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Tier 1 ({profiles.filter(p => p.kyc_tier === 'Tier 1').length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProfiles.map((op, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              key={op.id}
              className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.04] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
                    <Globe className="text-white/70 w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                    op.kyc_tier === 'Tier 3'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : op.kyc_tier === 'Tier 2'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {op.kyc_tier} Verified
                  </span>
                </div>

                <h3 className="font-semibold text-white/95 text-base">{op.display_tag || 'Registered Profile'}</h3>
                <p className="text-xs font-mono text-white/40 mt-1 truncate">
                  {op.wallet_address}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-white/40 font-mono">Reputation Score</span>
                <span className="font-semibold text-emerald-400 font-mono">{op.reputation_score} / 100</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Operator Capacity Windows (from Supabase operator_listings) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white/90">Custom Capacity Windows</h2>
            <p className="text-xs text-white/40 mt-0.5">Submitted by verified ground station and satellite operators</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {listings.length} Active Windows
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((l, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={l.id}
              className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.035] transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {l.status}
                  </span>
                  <span className="text-xs font-mono text-white/50">{l.price_eth || '0.0001 ETH'}</span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-semibold text-white/95">{l.satellite_name}</h3>
                  <p className="text-xs text-white/40 mt-0.5 font-mono">{l.operator_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
                  <div>
                    <span className="text-white/30 text-[10px] block">BAND & SPEED</span>
                    <span className="text-white/80">{l.band} • {l.bandwidth}</span>
                  </div>
                  <div>
                    <span className="text-white/30 text-[10px] block">COVERAGE</span>
                    <span className="text-white/80">{l.coverage_area}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-white/[0.04]">
                    <span className="text-white/30 text-[10px] block">WINDOW</span>
                    <span className="text-emerald-400">{l.window_display}</span>
                  </div>
                </div>
              </div>

              <a
                href="/marketplace"
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08] text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <span>Book Window in Marketplace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Submit Capacity Window Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c10]/90 border border-white/[0.1] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white/95">Submit Capacity Window</h3>
                  <p className="text-xs text-white/40">Publish custom capacity to Supabase PostgreSQL.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {successMessage ? (
                <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="text-sm font-semibold">{successMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 block mb-1">OPERATOR NAME</label>
                      <input
                        type="text"
                        required
                        value={form.operator_name}
                        onChange={e => setForm({ ...form, operator_name: e.target.value })}
                        placeholder="e.g. Orbitex Space"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 block mb-1">SATELLITE NAME</label>
                      <input
                        type="text"
                        required
                        value={form.satellite_name}
                        onChange={e => setForm({ ...form, satellite_name: e.target.value })}
                        placeholder="e.g. ORBITEX-RELAY-1"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 block mb-1">FREQUENCY BAND</label>
                      <input
                        type="text"
                        value={form.band}
                        onChange={e => setForm({ ...form, band: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 block mb-1">BANDWIDTH / SPEED</label>
                      <input
                        type="text"
                        value={form.bandwidth}
                        onChange={e => setForm({ ...form, bandwidth: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 block mb-1">PASS WINDOW (UTC)</label>
                      <input
                        type="text"
                        value={form.window_display}
                        onChange={e => setForm({ ...form, window_display: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 block mb-1">PRICE (ETH)</label>
                      <input
                        type="text"
                        value={form.price_eth}
                        onChange={e => setForm({ ...form, price_eth: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/40 block mb-1">COVERAGE AREA</label>
                    <input
                      type="text"
                      value={form.coverage_area}
                      onChange={e => setForm({ ...form, coverage_area: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all text-xs flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Publish to Supabase</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
