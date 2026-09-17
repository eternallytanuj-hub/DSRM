'use client';

import React, { useState } from 'react';
import { Search, Satellite, Clock, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

import { searchMarketplaceWithGrok } from './actions';

const ALL_PASSES = [
  { id: 'SAT-07', operator: 'ORBITEX', window: '06:42 - 06:52 IST', speed: '32 Mbps', price: '$41' },
  { id: 'SAT-14', operator: 'MERIDIAN', window: '07:11 - 07:25 IST', speed: '26 Mbps', price: '$38' },
  { id: 'SAT-02', operator: 'HELIOSAT', window: '05:58 - 06:12 IST', speed: '20 Mbps', price: '$47' },
];

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [passes, setPasses] = useState(ALL_PASSES);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setPasses(ALL_PASSES);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchMarketplaceWithGrok(query, ALL_PASSES);
      if (results && results.length > 0) {
        setPasses(results);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSearching(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">Marketplace</h1>
        <p className="text-white/50 mt-2 text-sm">Find and book live satellite passes instantly.</p>
      </header>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-white/[0.03] border border-white/[0.05] rounded-2xl p-2 backdrop-blur-xl shadow-lg transition-all focus-within:border-white/20 focus-within:bg-white/[0.05]">
          <div className="pl-4 pr-2 text-white/40">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., I need 10 minutes of connectivity over India tomorrow morning..."
            className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 text-sm py-3"
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors backdrop-blur-md disabled:opacity-50"
          >
            {isSearching ? 'Analyzing...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {passes.map((p, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={p.id}
            className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.04] transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.1]">
                  <Satellite className="text-white/70 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white/90">{p.id}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-wider">{p.operator}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-white">{p.price}</div>
                <div className="text-[10px] text-white/40">USDC</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Clock className="w-4 h-4 text-white/40" />
                {p.window}
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Wifi className="w-4 h-4 text-white/40" />
                {p.speed} throughput
              </div>
            </div>

            <button className="w-full mt-8 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] rounded-xl text-sm font-medium transition-all group-hover:border-white/[0.15]">
              Book Window
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
