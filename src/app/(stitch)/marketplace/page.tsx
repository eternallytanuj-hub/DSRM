'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Satellite, 
  Clock, 
  Wifi, 
  Cpu, 
  Radio, 
  Globe2, 
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther, stringToHex, keccak256 } from 'viem';

import { searchMarketplaceWithGroq } from './actions';
import { DEFAULT_REAL_PASSES, SatellitePass } from './types';
import SatelliteEscrowArtifact from '@/contracts/SatelliteEscrow.json';

const SAMPLE_QUERIES = [
  "High-speed broadband pass over South Asia / India",
  "Optical Earth observation imagery with >400 Mbps downlink",
  "Ultra-low latency IoT and telemetry relay (L-Band)",
  "Continuous geostationary weather & atmospheric tracking"
];

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [passes, setPasses] = useState<SatellitePass[]>(DEFAULT_REAL_PASSES);
  const [initialPasses, setInitialPasses] = useState<SatellitePass[]>(DEFAULT_REAL_PASSES);

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();

  const [lockingPassId, setLockingPassId] = useState<string | null>(null);
  const [lockedModal, setLockedModal] = useState<{
    pass: SatellitePass;
    bookingRef: string;
    bookingId: string;
    txHash: string;
    etherscanUrl: string;
    amount: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLockEscrow = async (p: SatellitePass) => {
    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    setLockingPassId(p.id);
    setErrorMessage(null);

    try {
      const cleanName = p.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
      const bookingRef = `BKG-${cleanName}-${Date.now().toString(36).toUpperCase()}`;
      const bookingId = keccak256(stringToHex(bookingRef));
      const operatorAddress = (SatelliteEscrowArtifact.oracleAddress || "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176") as `0x${string}`;
      const nowSec = BigInt(Math.floor(Date.now() / 1000));
      const windowEndSec = nowSec + BigInt(3600);
      const depositValue = parseEther('0.0001');

      const txHash = await writeContractAsync({
        address: SatelliteEscrowArtifact.address as `0x${string}`,
        abi: SatelliteEscrowArtifact.abi,
        functionName: 'depositEscrow',
        args: [
          bookingId,
          operatorAddress,
          nowSec,
          windowEndSec,
          p.name
        ],
        value: depositValue,
      });

      const modalData = {
        pass: p,
        bookingRef,
        bookingId,
        txHash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
        amount: '0.0001 Sepolia ETH',
      };

      try {
        const stored = JSON.parse(localStorage.getItem('dsrm_user_bookings') || '[]');
        stored.unshift({
          id: bookingRef,
          bookingId,
          sat: p.name,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: p.window || 'Active Window',
          status: 'Locked',
          amount: '0.0001 ETH',
          txHash,
          etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
        });
        localStorage.setItem('dsrm_user_bookings', JSON.stringify(stored));

        // Register booking with the automated Oracle Relayer service
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        fetch(`${backendUrl}/api/v1/telemetry/register-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingRef,
            bookingId,
            satellite: p.name,
            operator: operatorAddress,
            txHash
          })
        }).catch(() => {});
      } catch (err) {
        console.error("Storage/Relayer error:", err);
      }

      setLockedModal(modalData);
    } catch (err: any) {
      console.error("Lock escrow error:", err);
      setErrorMessage(err?.shortMessage || err?.message || "Transaction was cancelled or failed");
    } finally {
      setLockingPassId(null);
    }
  };

  useEffect(() => {
    fetch('https://dsrmbackend-production.up.railway.app/api/v1/marketplace/passes')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.passes) && data.passes.length > 0) {
          setPasses(data.passes);
          setInitialPasses(data.passes);
        }
      })
      .catch(() => {
        // Fallback already set to DEFAULT_REAL_PASSES
      });
  }, []);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPasses(initialPasses);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchMarketplaceWithGroq(searchQuery, initialPasses);
      if (results && results.length > 0) {
        setPasses(results);
      }
    } catch (e) {
      console.error("Marketplace search failed:", e);
    }
    setIsSearching(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleChipClick = (sample: string) => {
    setQuery(sample);
    executeSearch(sample);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400/90 font-mono mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Space-Track.org Real-Time Fleet
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">Orbital Resource Marketplace</h1>
        <p className="text-white/50 mt-2 text-sm max-w-2xl">
          Discover, bid, and lock verified satellite communication and observation windows. Natural language matching powered by Groq LPU inference.
        </p>
      </header>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2 backdrop-blur-xl shadow-lg transition-all focus-within:border-white/25 focus-within:bg-white/[0.05]">
          <div className="pl-4 pr-3 text-white/40">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., I need 10 minutes of low latency connectivity over India tomorrow morning..."
            className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 text-sm py-3 font-normal"
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors backdrop-blur-md disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Matching...</span>
              </>
            ) : (
              <>
                <Cpu size={14} className="text-white/80" />
                <span>Match Orbit</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white/60">
        <span className="text-white/30 font-mono text-[11px]">PROMPTS:</span>
        {SAMPLE_QUERIES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(sample)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-white/70 hover:text-white transition-all text-left truncate max-w-xs"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Satellite Pass Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {passes.map((p, i) => (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            key={p.id}
            className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.04] transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.05] flex items-center justify-center border border-white/[0.08] shadow-inner">
                    <Satellite className="text-white/80 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white/95 text-base tracking-tight">{p.name}</h3>
                    <p className="text-xs text-white/45 tracking-wide">{p.operator}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-emerald-400 font-mono">{p.price}</div>
                  <div className="text-[10px] text-white/35 font-mono">USDC / PASS</div>
                </div>
              </div>

              {/* AI Recommendation Reason */}
              {p.reason && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed flex items-start gap-2">
                  <Radio size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{p.reason}</span>
                </div>
              )}

              {/* Specs */}
              <div className="space-y-2.5 my-4 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="flex items-center gap-2 text-white/40">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    Window:
                  </span>
                  <span className="font-mono text-white/90">{p.window}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="flex items-center gap-2 text-white/40">
                    <Wifi className="w-3.5 h-3.5 text-white/40" />
                    Throughput:
                  </span>
                  <span className="font-mono text-white/90">{p.speed}</span>
                </div>
                {p.alt && (
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span className="flex items-center gap-2 text-white/40">
                      <Globe2 className="w-3.5 h-3.5 text-white/40" />
                      Altitude:
                    </span>
                    <span className="font-mono text-white/90">{p.alt} km</span>
                  </div>
                )}
                {p.noradId && (
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span className="flex items-center gap-2 text-white/40">
                      <Radio className="w-3.5 h-3.5 text-white/40" />
                      NORAD Cat ID:
                    </span>
                    <span className="font-mono text-white/60">#{p.noradId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              disabled={lockingPassId === p.id}
              onClick={() => handleLockEscrow(p)}
              className={`w-full mt-4 py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 group ${
                !isConnected
                  ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/[0.04] hover:bg-emerald-500/20 text-white/90 hover:text-white border border-white/[0.08] hover:border-emerald-500/40'
              }`}
            >
              {lockingPassId === p.id ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <span className="text-emerald-400 font-mono">Sign in Wallet (0.0001 ETH)...</span>
                </>
              ) : !isConnected ? (
                <>
                  <Wallet size={14} className="text-blue-400 group-hover:scale-105 transition-transform" />
                  <span>Connect Wallet to Lock Escrow</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} className="text-emerald-400 group-hover:scale-105 transition-transform" />
                  <span>Lock Escrow Window (0.0001 ETH)</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-red-950/90 border border-red-500/30 rounded-2xl p-4 text-xs text-red-200 shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-300 mb-0.5">Escrow Transaction Rejected</div>
            <div className="text-red-200/80 break-words">{errorMessage}</div>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {lockedModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0D0F18] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => setLockedModal(null)}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white/95">Escrow Deposit Confirmed</h3>
                  <p className="text-xs text-white/45">Funds locked on Ethereum Sepolia testnet.</p>
                </div>
              </div>

              <div className="space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-white/40 font-sans">Satellite</span>
                  <span className="text-white/90 font-semibold">{lockedModal.pass.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-white/40 font-sans">Booking Ref</span>
                  <span className="text-emerald-400">{lockedModal.bookingRef}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-white/40 font-sans">Escrow Amount</span>
                  <span className="text-white/90">{lockedModal.amount}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-white/40 font-sans">Contract Address</span>
                  <span className="text-white/70 truncate max-w-[220px]">
                    {SatelliteEscrowArtifact.address}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-white/40 font-sans">Transaction Hash</span>
                  <span className="text-blue-400 truncate max-w-[220px]">
                    {lockedModal.txHash}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-white/40 font-sans">Oracle State</span>
                  <span className="text-emerald-400">Locked • Awaiting Telemetry</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={lockedModal.etherscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 text-xs font-medium transition-all flex items-center justify-center gap-2"
                >
                  <span>Verify on Etherscan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/escrow-clearing"
                  className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08] text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Escrow & Clearing</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
