'use client';

import React from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OperatorRegistryPage() {
  const operators = [
    { name: 'Orbitex', status: 'FCC Verified', satellites: 42 },
    { name: 'Meridian Space', status: 'ITU Verified', satellites: 18 },
    { name: 'Heliosat', status: 'Pending', satellites: 5 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">Operator Registry</h1>
        <p className="text-white/50 mt-2 text-sm">FCC / ITU Verified network participants.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {operators.map((op, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={op.name}
            className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl text-center flex flex-col items-center justify-center hover:bg-white/[0.04] transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center border border-white/[0.1] mb-6">
              <Globe className="text-white/60 w-8 h-8" />
            </div>
            <h3 className="font-semibold text-white/90 text-lg">{op.name}</h3>
            <p className="text-xs text-white/40 mt-1">{op.satellites} Active Satellites</p>
            
            <div className={`mt-6 px-4 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 ${
              op.status.includes('Verified') 
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              {op.status}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
