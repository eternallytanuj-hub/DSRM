'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Booking {
  id: string;
  sat: string;
  date: string;
  status: string;
  time: string;
  txHash?: string;
  etherscanUrl?: string;
  amount?: string;
}

const DEFAULT_BOOKINGS: Booking[] = [
  { 
    id: 'BKG-1957', 
    sat: 'STARLINK-32573', 
    date: 'Sep 18, 2026', 
    status: 'Settled', 
    time: '07:45 - 08:00 UTC (15m)',
    txHash: '0x829caaa2dc08adbb2c7f396f211b01fc2dc41b3f25056910547f6ac3bb55cb13',
    etherscanUrl: 'https://sepolia.etherscan.io/tx/0x829caaa2dc08adbb2c7f396f211b01fc2dc41b3f25056910547f6ac3bb55cb13',
    amount: '0.00001 Sepolia ETH'
  },
  { 
    id: 'BKG-SATNOGS-001', 
    sat: 'STARLINK-32573', 
    date: 'Sep 18, 2026', 
    status: 'Settled', 
    time: '06:42 - 06:55 UTC (13m)',
    txHash: '0x6635c7a647877a781e01af6a231226282500291a0f91405503881e4113c7b359',
    etherscanUrl: 'https://sepolia.etherscan.io/tx/0x6635c7a647877a781e01af6a231226282500291a0f91405503881e4113c7b359',
    amount: '0.00010 Sepolia ETH'
  },
  { 
    id: 'BKG-NOAA-002', 
    sat: 'NOAA-19 HRPT', 
    date: 'Sep 18, 2026', 
    status: 'Partially Settled', 
    time: '07:10 - 07:22 UTC (12m)',
    txHash: '0x6c0b385616af57731755d79cb04e98dd265097734af6748c471847657e068f68',
    etherscanUrl: 'https://sepolia.etherscan.io/tx/0x6c0b385616af57731755d79cb04e98dd265097734af6748c471847657e068f68',
    amount: '0.00010 Sepolia ETH'
  },
  { 
    id: 'BKG-REFUND-TEST-001', 
    sat: 'METEOSAT-11 HRIT', 
    date: 'Sep 18, 2026', 
    status: 'Refunded', 
    time: '07:30 - 07:45 UTC (15m)',
    txHash: '0xb2e3c88bdbf83fd2d94297c526e99cac63be669e99768f86913c89de6b3c829c',
    etherscanUrl: 'https://sepolia.etherscan.io/tx/0xb2e3c88bdbf83fd2d94297c526e99cac63be669e99768f86913c89de6b3c829c',
    amount: '0.00005 Sepolia ETH'
  }
];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dsrm_user_bookings') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setBookings([...stored, ...DEFAULT_BOOKINGS]);
      }
    } catch {
      // Use defaults
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white/95">My Bookings & Pass Windows</h1>
        <p className="text-white/50 mt-2 text-sm">
          Manage your committed slots, access windows, and on-chain escrow reservations.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((b, i) => (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            key={b.id + i}
            className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.035] transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
                <Calendar className="text-white/70 w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white/95 text-base">{b.id}</h3>
                  {b.amount && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {b.amount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-mono mt-0.5">
                  {b.sat} • {b.date}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4 text-white/40" />
                <span className="font-mono">{b.time}</span>
              </div>

              <div className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium border ${
                b.status === 'Active' || b.status === 'Settled'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : b.status === 'Locked'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : b.status === 'Refunded'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {b.status}
              </div>

              {b.etherscanUrl && (
                <a
                  href={b.etherscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.08] transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
