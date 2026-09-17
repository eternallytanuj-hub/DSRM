'use client';

import React from 'react';
import { Terminal, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApiSmartContractPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">API & Smart Contract</h1>
        <p className="text-white/50 mt-2 text-sm">Chainlink Functions integration and Agent API.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <Terminal className="w-6 h-6 text-white/70" />
            <h2 className="text-lg font-semibold text-white/90">REST API Endpoint</h2>
          </div>
          <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-white/60 overflow-x-auto border border-white/[0.05]">
            GET /api/v1/marketplace/search<br/>
            Authorization: Bearer dsrm_...<br/>
            <br/>
            {'{'}<br/>
            &nbsp;&nbsp;"query": "I need 10 minutes over India",<br/>
            &nbsp;&nbsp;"bandwidth_min": 20<br/>
            {'}'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <Code2 className="w-6 h-6 text-white/70" />
            <h2 className="text-lg font-semibold text-white/90">Smart Contract</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-white/[0.05] pb-2">
              <span className="text-white/40">Network</span>
              <span className="text-white/90">Sepolia ETH</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/[0.05] pb-2">
              <span className="text-white/40">Address</span>
              <span className="text-white/90 font-mono">0x7f9a...4B12</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/[0.05] pb-2">
              <span className="text-white/40">Oracle</span>
              <span className="text-white/90">Chainlink DON</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
