'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  User, 
  Radio, 
  Database,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { supabase, BookingRecord, Profile } from '@/lib/supabase';
import { fetchBookings, syncUserProfile } from '@/app/actions/supabase';

export default function MyBookingsPage() {
  const { address, isConnected } = useAccount();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SETTLED' | 'REFUNDED'>('ALL');
  const [liveSyncTime, setLiveSyncTime] = useState<string>('');

  useEffect(() => {
    if (isConnected && address) {
      setActiveTab('my');
    }
  }, [isConnected, address]);

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await fetchBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }

      const targetAddress = address || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176';
      const profRes = await syncUserProfile(targetAddress);
      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
      }
      setLiveSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error loading Supabase data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [address]);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('realtime_bookings_dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          loadData();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      loadData();
    }, 12000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadData]);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'my') {
      if (address) {
        if (b.user_address.toLowerCase() !== address.toLowerCase()) return false;
      } else {
        if (b.user_address.toLowerCase() !== '0xc25f9f0ce27a2d248c43563a32cdc4886d069176') return false;
      }
    }

    if (statusFilter !== 'ALL') {
      const s = b.status?.toUpperCase();
      if (statusFilter === 'ACTIVE') {
        if (s !== 'ACTIVE' && s !== 'LOCKED' && s !== 'PENDING') return false;
      } else if (statusFilter === 'SETTLED') {
        if (s !== 'SETTLED' && s !== 'PARTIALLY_SETTLED') return false;
      } else if (statusFilter === 'REFUNDED') {
        if (s !== 'REFUNDED') return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || 'PENDING';
    if (s === 'SETTLED') {
      return (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Settled
        </span>
      );
    }
    if (s === 'PARTIALLY_SETTLED') {
      return (
        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          Partially Settled
        </span>
      );
    }
    if (s === 'ACTIVE' || s === 'LOCKED') {
      return (
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          Active Locked
        </span>
      );
    }
    if (s === 'REFUNDED') {
      return (
        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Refunded
        </span>
      );
    }
    return (
      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/95">My Bookings & Pass Windows</h1>
          <p className="text-white/50 mt-1 text-sm">
            Live on-chain escrow receipts synchronized with PostgreSQL Supabase persistence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supabase Live</span>
            {liveSyncTime && <span className="text-white/30">({liveSyncTime})</span>}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all disabled:opacity-50"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* User KYC & Profile Card */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <User className="w-6 h-6 text-white/80" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold text-white/95">
                  {profile?.display_tag || (address ? `Terminal ${address.slice(0, 6)}` : 'Relayer Terminal (Demo)')}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                  profile?.kyc_tier === 'Tier 3'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : profile?.kyc_tier === 'Tier 2'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {profile?.kyc_tier || 'Tier 1'} Verified
                </span>
              </div>
              <p className="text-xs font-mono text-white/40 mt-1 truncate max-w-[320px] sm:max-w-md">
                {address || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6 text-xs">
            <div>
              <div className="text-white/40 uppercase tracking-wider text-[10px] font-mono">KYC Status</div>
              <div className="font-semibold text-white/90 mt-0.5">
                {profile?.kyc_tier === 'Tier 1' ? 'Tier 1 (Anonymous Pass)' : 'Tier 2/3 (Operator/Institutional)'}
              </div>
            </div>
            <div>
              <div className="text-white/40 uppercase tracking-wider text-[10px] font-mono">Reputation Score</div>
              <div className="font-semibold text-emerald-400 mt-0.5 font-mono">
                {profile?.reputation_score || 100} / 100
              </div>
            </div>
            <div>
              <div className="text-white/40 uppercase tracking-wider text-[10px] font-mono">Protocol Escrows</div>
              <div className="font-semibold text-white/90 mt-0.5 font-mono">
                {bookings.length} Total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'my'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            My Wallet Bookings ({bookings.filter(b => b.user_address.toLowerCase() === (address || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176').toLowerCase()).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            All Protocol Escrows ({bookings.length})
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {(['ALL', 'ACTIVE', 'SETTLED', 'REFUNDED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                statusFilter === s
                  ? 'bg-white/[0.08] text-white border-white/[0.2]'
                  : 'bg-white/[0.02] text-white/40 border-white/[0.04] hover:text-white/70'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-white/40 font-mono text-sm bg-white/[0.01] border border-white/[0.04] rounded-3xl">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-white/50" />
            Loading Supabase records...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-white/40 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-white/30" />
            <p className="font-semibold text-white/70 text-sm">No bookings found</p>
            <p className="text-xs text-white/40 mt-1">
              {activeTab === 'my' 
                ? "You haven't locked any escrow passes yet with this wallet address."
                : "No bookings match the selected status filter."}
            </p>
            <a
              href="/marketplace"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium border border-white/[0.1] transition-all"
            >
              Explore Orbital Marketplace
            </a>
          </div>
        ) : (
          filteredBookings.map((b, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              key={b.id}
              className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.035] transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08] shrink-0 mt-0.5">
                    <Calendar className="text-white/70 w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white/95 text-base">{b.id}</h3>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {b.locked_amount}
                      </span>
                      {getStatusBadge(b.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40 uppercase tracking-wider font-mono mt-1">
                      <span className="text-white/70">{b.satellite}</span>
                      <span>•</span>
                      <span>{b.window_text || 'Standard Pass Window'}</span>
                      {b.created_at && (
                        <>
                          <span>•</span>
                          <span>{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-white/30 mt-1 flex items-center gap-2">
                      <span>User: {b.user_address.slice(0, 6)}...{b.user_address.slice(-4)}</span>
                      {b.booking_id && (
                        <>
                          <span>•</span>
                          <span title={b.booking_id}>ID: {b.booking_id.slice(0, 10)}...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.04]">
                  {b.tx_hash && (
                    <a
                      href={b.etherscan_url || `https://sepolia.etherscan.io/tx/${b.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-white/70 hover:text-white border border-white/[0.08] text-xs font-mono flex items-center gap-1.5 transition-all"
                      title="View Deposit on Sepolia Etherscan"
                    >
                      <span>Deposit Tx</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {b.settlement_tx_hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${b.settlement_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-mono flex items-center gap-1.5 transition-all"
                      title="View Settlement on Sepolia Etherscan"
                    >
                      <span>Settlement Tx</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <a
                    href="/escrow-clearing"
                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-white/50 hover:text-white border border-white/[0.08] transition-all"
                    title="Inspect in Escrow Clearing"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
