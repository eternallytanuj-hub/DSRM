'use client';

import React, { useState } from 'react';
import { Terminal, Code2, ExternalLink, Copy, Check, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import SatelliteEscrowArtifact from '@/contracts/SatelliteEscrow.json';

export default function ApiSmartContractPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white/95">API & Smart Contract Engine</h1>
        <p className="text-white/50 mt-2 text-sm">
          Autonomous Agent API and Deployed Sepolia Escrow Smart Contract Specifications.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REST API Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white/90">Autonomous Agent API</h2>
                <p className="text-xs text-white/40 font-mono">Fastify Microservice</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-white/50 mb-1.5 font-mono">1. Natural Language Matching</div>
                <div className="bg-black/50 rounded-2xl p-4 font-mono text-xs text-white/70 overflow-x-auto border border-white/[0.05]">
                  <span className="text-emerald-400">POST</span> /api/v1/marketplace/search<br/>
                  Content-Type: application/json<br/>
                  <br/>
                  {'{'}<br/>
                  &nbsp;&nbsp;"query": "10 min low-latency pass over India",<br/>
                  &nbsp;&nbsp;"bandwidth_min": 50<br/>
                  {'}'}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/50 mb-1.5 font-mono">2. Telemetry Oracle Attestations</div>
                <div className="bg-black/50 rounded-2xl p-4 font-mono text-xs text-white/70 overflow-x-auto border border-white/[0.05]">
                  <span className="text-blue-400">GET</span> /api/v1/telemetry/attestations<br/>
                  <span className="text-white/40">// Returns SHA-256 fingerprint & ECDSA signed telemetry</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Smart Contract Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white/70" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white/90">SatelliteEscrow.sol</h2>
                  <p className="text-xs text-white/40 font-mono">Sepolia Testnet #11155111</p>
                </div>
              </div>

              <a
                href={`https://sepolia.etherscan.io/address/${SatelliteEscrowArtifact.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <span>Etherscan</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.05]">
                <span className="text-white/40 font-sans">Network</span>
                <span className="text-white/90">Ethereum Sepolia</span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.05]">
                <span className="text-white/40 font-sans">Contract Address</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/90 truncate max-w-[200px]">
                    {SatelliteEscrowArtifact.address}
                  </span>
                  <button
                    onClick={() => handleCopy(SatelliteEscrowArtifact.address, 'contract')}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    {copiedKey === 'contract' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.05]">
                <span className="text-white/40 font-sans">Oracle Relayer</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/90 truncate max-w-[200px]">
                    {SatelliteEscrowArtifact.oracleAddress || "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176"}
                  </span>
                  <button
                    onClick={() => handleCopy(SatelliteEscrowArtifact.oracleAddress, 'oracle')}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    {copiedKey === 'oracle' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.05]">
                <span className="text-white/40 font-sans">Deployment Tx</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${SatelliteEscrowArtifact.deploymentTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 truncate max-w-[200px] flex items-center gap-1"
                >
                  <span>{SatelliteEscrowArtifact.deploymentTx}</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div className="pt-2">
                <span className="text-white/40 font-sans block mb-2">Core Contract Methods</span>
                <div className="space-y-1.5 text-[11px] text-emerald-400/90 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <div>• depositEscrow(bookingId, operator, start, end, satName)</div>
                  <div>• releasePayment(bookingId, attestationHash) [onlyOracle]</div>
                  <div>• settlePayment(bookingId, packetBps, hash) [onlyOracle]</div>
                  <div>• refundBuyer(bookingId, reason)</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
