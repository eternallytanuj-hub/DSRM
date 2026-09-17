'use client';

import React, { useState, useEffect } from 'react';
import { Search, Satellite, Clock, Wifi, Sparkles, Radio, Globe2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { searchMarketplaceWithGroq } from './actions';
import { DEFAULT_REAL_PASSES, SatellitePass } from './types';

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
                <Sparkles size={14} className="text-amber-300" />
                <span>AI Match</span>
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
                  <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
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
            <button className="w-full mt-4 py-3 bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/20 rounded-xl text-xs font-medium text-white/90 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Lock Escrow Window</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
