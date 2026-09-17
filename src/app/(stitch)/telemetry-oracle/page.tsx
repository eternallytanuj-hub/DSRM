'use client';

import React from 'react';
import { Activity, Signal, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TelemetryOraclePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">Telemetry Oracle</h1>
        <p className="text-white/50 mt-2 text-sm">SatNOGS / NOAA Ingest Streams.</p>
      </header>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
          <h2 className="text-lg font-semibold text-white/90">Live Ingest</h2>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0"
            >
              <div className="flex items-center gap-4">
                <Radio className="w-5 h-5 text-white/40" />
                <span className="text-sm text-white/70 font-mono">FRAME_0x{Math.floor(Math.random()*10000).toString(16)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-mono">99.8%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
