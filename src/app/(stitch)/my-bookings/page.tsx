'use client';

import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyBookingsPage() {
  const bookings = [
    { id: 'BKG-9482', sat: 'SAT-07', date: 'Oct 12, 2025', status: 'Active', time: '06:42 IST' },
    { id: 'BKG-9102', sat: 'SAT-14', date: 'Oct 10, 2025', status: 'Completed', time: '07:11 IST' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">My Bookings</h1>
        <p className="text-white/50 mt-2 text-sm">Manage your committed slots and access windows.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((b, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={b.id}
            className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.04] transition-all duration-300"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.1]">
                <Calendar className="text-white/70 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white/90">{b.id}</h3>
                <p className="text-xs text-white/40 uppercase tracking-wider">{b.sat} • {b.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4 text-white/40" />
                {b.time}
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-medium border ${
                b.status === 'Active' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-white/5 text-white/50 border-white/10'
              }`}>
                {b.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
