'use client';

import React from 'react';
import { ShieldCheck, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EscrowClearingPage() {
  const escrows = [
    { id: 'ESC-4A1', amount: '41.00 USDC', status: 'Locked', target: 'SAT-07' },
    { id: 'ESC-9B2', amount: '38.00 USDC', status: 'Released', target: 'SAT-14' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">Escrow & Clearing</h1>
        <p className="text-white/50 mt-2 text-sm">Live verified settlement contracts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {escrows.map((e, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={e.id}
            className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl hover:bg-white/[0.04] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-semibold text-white/90 text-lg">{e.amount}</h3>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{e.id} • {e.target}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                e.status === 'Locked' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
              }`}>
                {e.status === 'Locked' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
            </div>
            
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${e.status === 'Locked' ? 'w-1/2 bg-blue-500/50' : 'w-full bg-green-500/50'}`} />
            </div>
            <p className="text-xs text-white/40 mt-4 text-center">
              {e.status === 'Locked' ? 'Awaiting telemetry verification' : 'Settlement verified and cleared'}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
