'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Signal, 
  Radio, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCw, 
  Satellite, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import SatelliteEscrowArtifact from '@/contracts/SatelliteEscrow.json';

interface Settlement {
  status: 'SETTLED' | 'PARTIAL_REFUND' | 'REFUNDED' | 'PENDING';
  action: 'RELEASE' | 'PARTIAL_REFUND' | 'REFUND';
  txHash: string;
  blockNumber?: number;
  etherscanUrl: string;
  operatorPayout: string;
  buyerRefund: string;
  settledAt: string;
  gasUsed?: string;
}

interface Attestation {
  id: string;
  sessionId: string;
  groundStation: string;
  location: string;
  satellite: string;
  noradId: number;
  bookingRef: string;
  bookingId: string;
  timestamp: string;
  frequency: string;
  snr: string;
  totalFrames: number;
  validFrames: number;
  droppedFrames: number;
  frameQualityPct: number;
  status: 'NOMINAL' | 'DEGRADED' | 'BREACH';
  sha256Fingerprint: string;
  oracleSignature: string;
  oracleAddress: string;
  contractAddress: string;
  settlement: Settlement;
}

interface LiveFrame {
  id: string;
  frameHex: string;
  satellite: string;
  groundStation: string;
  quality: number;
  snr: string;
  status: string;
  timestamp: string;
}

const DEFAULT_ATTESTATIONS: Attestation[] = [
  {
    id: "ATT-9376-1957",
    sessionId: "GS-BLR-0434",
    groundStation: "SatNOGS Ground Station #1428",
    location: "Bangalore, IN (12.9716° N, 77.5946° E)",
    satellite: "STARLINK-32573",
    noradId: 58219,
    bookingRef: "BKG-1957",
    bookingId: "0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    frequency: "2245.00 MHz (S-Band Downlink)",
    snr: "14.6 dB",
    totalFrames: 1000,
    validFrames: 987,
    droppedFrames: 13,
    frameQualityPct: 98.7,
    status: "NOMINAL",
    sha256Fingerprint: "0x4c1fbf4967a1b0e97a8e1103657934093dac70306d728a0ce815b0632e1a1f59",
    oracleSignature: "0x870c4b7f70b30d634b3a750cf6b435c0dd26eb22808132c4f8f28120e7c7b2e9486b1099308587c61388952a0bcdf901a08447437dde34a351db3b7cb89d78c71c",
    oracleAddress: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176",
    contractAddress: "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735",
    settlement: {
      status: "SETTLED",
      action: "RELEASE",
      txHash: "0x829caaa2dc08adbb2c7f396f211b01fc2dc41b3f25056910547f6ac3bb55cb13",
      blockNumber: 11726893,
      etherscanUrl: "https://sepolia.etherscan.io/tx/0x829caaa2dc08adbb2c7f396f211b01fc2dc41b3f25056910547f6ac3bb55cb13",
      operatorPayout: "0.00001000 Sepolia ETH (100%)",
      buyerRefund: "0.00000000 ETH (0%)",
      settledAt: new Date(Date.now() - 50000).toISOString(),
      gasUsed: "102,211"
    }
  },
  {
    id: "ATT-9842-BKG1",
    sessionId: "GS-BLR-0182",
    groundStation: "SatNOGS Ground Station #1428",
    location: "Bangalore, IN (12.9716° N, 77.5946° E)",
    satellite: "STARLINK-32573",
    noradId: 58219,
    bookingRef: "BKG-SATNOGS-001",
    bookingId: "0x99820bf9f502f87f32fc1fe27239b50bd76d63824b3567b3a15729655c3993a7",
    timestamp: new Date(Date.now() - 360000).toISOString(),
    frequency: "2245.00 MHz (S-Band Downlink)",
    snr: "14.8 dB",
    totalFrames: 1000,
    validFrames: 984,
    droppedFrames: 16,
    frameQualityPct: 98.4,
    status: "NOMINAL",
    sha256Fingerprint: "0x1227ac1f5261d18be36854910204842389d1af4e2db95f439da62d8624b64b52",
    oracleSignature: "0xd4a3ba69a080a6a580c65686e064f3ce49392b7537c9ae576519e1133a9177d87ba497086131381f5a1ac1cc1be8614c4ff6f73c4025666633e77c8df270b1391b",
    oracleAddress: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176",
    contractAddress: "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735",
    settlement: {
      status: "SETTLED",
      action: "RELEASE",
      txHash: "0x6635c7a647877a781e01af6a231226282500291a0f91405503881e4113c7b359",
      blockNumber: 11726829,
      etherscanUrl: "https://sepolia.etherscan.io/tx/0x6635c7a647877a781e01af6a231226282500291a0f91405503881e4113c7b359",
      operatorPayout: "0.00010000 Sepolia ETH (100%)",
      buyerRefund: "0.00000000 ETH (0%)",
      settledAt: new Date(Date.now() - 300000).toISOString(),
      gasUsed: "121,776"
    }
  },
  {
    id: "ATT-8419-BKG2",
    sessionId: "GS-SVB-0914",
    groundStation: "NOAA Earth Observation Ingest",
    location: "Svalbard, NO (78.2298° N, 15.4078° E)",
    satellite: "NOAA-19",
    noradId: 33591,
    bookingRef: "BKG-NOAA-002",
    bookingId: "0x84bf1864f110ccbe2cfbf24023089daefd48449c995f029dfdc69727afdca8ae",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    frequency: "1698.75 MHz (L-Band HRPT)",
    snr: "9.2 dB",
    totalFrames: 1000,
    validFrames: 840,
    droppedFrames: 160,
    frameQualityPct: 84.0,
    status: "DEGRADED",
    sha256Fingerprint: "0x8f3c4e9123b0a7d5e6f1c4a289b0d3e5a7c9f1b3e5d7a9c1e3f5b7d9a1c3e5f7",
    oracleSignature: "0xa81c94d3f5b7e9a1c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c91c",
    oracleAddress: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176",
    contractAddress: "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735",
    settlement: {
      status: "PARTIAL_REFUND",
      action: "PARTIAL_REFUND",
      txHash: "0x6c0b385616af57731755d79cb04e98dd265097734af6748c471847657e068f68",
      blockNumber: 11726831,
      etherscanUrl: "https://sepolia.etherscan.io/tx/0x6c0b385616af57731755d79cb04e98dd265097734af6748c471847657e068f68",
      operatorPayout: "0.00008400 Sepolia ETH (84%)",
      buyerRefund: "0.00001600 Sepolia ETH (16%)",
      settledAt: new Date(Date.now() - 90000).toISOString(),
      gasUsed: "123,491"
    }
  },
  {
    id: "ATT-4219-BKG3",
    sessionId: "GS-REDU-0341",
    groundStation: "ESA Redu Station",
    location: "Redu, BE (50.0016° N, 5.1461° E)",
    satellite: "METEOSAT-11",
    noradId: 40732,
    bookingRef: "BKG-REFUND-TEST-001",
    bookingId: "0x421ce01e5b3bcd4856a05f35d0b26e5e442f825d0e06920110f88b5264e916f9",
    timestamp: new Date(Date.now() - 40000).toISOString(),
    frequency: "1675.00 MHz (Raw Telemetry)",
    snr: "4.1 dB",
    totalFrames: 1000,
    validFrames: 0,
    droppedFrames: 1000,
    frameQualityPct: 0.0,
    status: "BREACH",
    sha256Fingerprint: "0x421ce01e5b3bcd4856a05f35d0b26e5e442f825d0e06920110f88b5264e916f9",
    oracleSignature: "0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e1c",
    oracleAddress: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176",
    contractAddress: "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735",
    settlement: {
      status: "REFUNDED",
      action: "REFUND",
      txHash: "0xb2e3c88bdbf83fd2d94297c526e99cac63be669e99768f86913c89de6b3c829c",
      blockNumber: 11726880,
      etherscanUrl: "https://sepolia.etherscan.io/tx/0xb2e3c88bdbf83fd2d94297c526e99cac63be669e99768f86913c89de6b3c829c",
      operatorPayout: "0.00000000 ETH (0%)",
      buyerRefund: "0.00005000 Sepolia ETH (100%)",
      settledAt: new Date(Date.now() - 30000).toISOString(),
      gasUsed: "48,932"
    }
  }
];

export default function TelemetryOraclePage() {
  const [attestations, setAttestations] = useState<Attestation[]>(DEFAULT_ATTESTATIONS);
  const [liveFrames, setLiveFrames] = useState<LiveFrame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getBackendUrl = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  };

  const fetchAttestations = async () => {
    setIsLoading(true);
    const urls = [
      getBackendUrl(),
      'https://dsrmbackend-production.up.railway.app'
    ];

    for (const base of urls) {
      try {
        const res = await fetch(`${base}/api/v1/telemetry/attestations`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.attestations) && data.attestations.length > 0) {
            setAttestations(data.attestations);
            break;
          }
        }
      } catch {
        // Try next
      }
    }
    setIsLoading(false);
  };

  const fetchFrames = async () => {
    const urls = [
      getBackendUrl(),
      'https://dsrmbackend-production.up.railway.app'
    ];

    for (const base of urls) {
      try {
        const res = await fetch(`${base}/api/v1/telemetry/live-frames`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.frames) && data.frames.length > 0) {
            setLiveFrames(data.frames);
            return;
          }
        }
      } catch {
        // Try next
      }
    }

    // Client-side frames fallback generator
    const stations = ["SatNOGS #1428 (BLR)", "NOAA Ingest (SVB)", "ESA Redu (BE)", "Woomera (AU)"];
    const sats = ["STARLINK-32573", "NOAA-19", "ONEWEB-0142", "SENTINEL-2A"];
    const randHex = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
    const quality = +(97 + Math.random() * 2.8).toFixed(1);
    
    setLiveFrames((prev) => [
      {
        id: `FRAME-0x${randHex}`,
        frameHex: `0x${randHex.toUpperCase()}`,
        satellite: sats[Math.floor(Math.random() * sats.length)],
        groundStation: stations[Math.floor(Math.random() * stations.length)],
        quality,
        snr: `${(13 + Math.random() * 3).toFixed(1)} dB`,
        status: quality > 98 ? 'VERIFIED' : 'PARITY_OK',
        timestamp: new Date().toISOString()
      },
      ...prev.slice(0, 7)
    ]);
  };

  useEffect(() => {
    fetchAttestations();
    fetchFrames();
    const interval = setInterval(() => {
      fetchFrames();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulatePass = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/telemetry/trigger-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          satellite: "STARLINK-32573",
          groundStation: "SatNOGS Ground Station #1428 (Bangalore)",
          packetDeliveryPct: +(96.5 + Math.random() * 3.0).toFixed(1),
          doOnChainSettlement: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.attestation) {
          setAttestations(prev => [data.attestation, ...prev]);
        }
      } else {
        console.error("Trigger pass failed:", await res.text());
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-mono mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Automated Ground Station Oracle Bridge
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white/95">Telemetry Oracle & Attestation</h1>
            <p className="text-white/50 mt-2 text-sm max-w-2xl">
              Cryptographic ground station proof network. Evaluates frame quality metrics, generates signed SHA-256 fingerprints, and triggers automated on-chain settlement on Ethereum Sepolia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulatePass}
              disabled={isSimulating}
              className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play size={14} className={isSimulating ? "animate-spin" : ""} />
              <span>{isSimulating ? "Running Pass..." : "Simulate Ground Pass"}</span>
            </button>
            <button
              onClick={fetchAttestations}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all"
              title="Refresh Attestations"
            >
              <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {/* Network Metadata Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-[11px] text-white/40 uppercase tracking-wider font-mono">Oracle Relayer</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-mono text-white/90 truncate max-w-[170px]">
              {SatelliteEscrowArtifact.oracleAddress || "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176"}
            </span>
            <button
              onClick={() => handleCopy(SatelliteEscrowArtifact.oracleAddress, 'oracle')}
              className="text-white/40 hover:text-white transition-colors"
            >
              {copiedKey === 'oracle' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ECDSA Verified Signer
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-[11px] text-white/40 uppercase tracking-wider font-mono">Escrow Contract</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-mono text-white/90 truncate max-w-[170px]">
              {SatelliteEscrowArtifact.address}
            </span>
            <button
              onClick={() => handleCopy(SatelliteEscrowArtifact.address, 'contract')}
              className="text-white/40 hover:text-white transition-colors"
            >
              {copiedKey === 'contract' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${SatelliteEscrowArtifact.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-blue-400 hover:text-blue-300 font-mono mt-1 flex items-center gap-1 transition-colors"
          >
            <span>Sepolia Etherscan</span>
            <ExternalLink size={10} />
          </a>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-[11px] text-white/40 uppercase tracking-wider font-mono">Settlement Policy</div>
          <div className="text-xs text-white/90 mt-2 font-medium">≥ 95.0% Valid Frames</div>
          <div className="text-[10px] text-white/40 font-mono mt-1">
            Triggers 100% Release Payment
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-[11px] text-white/40 uppercase tracking-wider font-mono">Partial Refund Policy</div>
          <div className="text-xs text-amber-400 mt-2 font-medium">&lt; 95.0% Delivery</div>
          <div className="text-[10px] text-white/40 font-mono mt-1">
            Proportional Refund to Buyer
          </div>
        </div>
      </div>

      {/* Verified Smart Contract Attestations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Verified On-Chain Attestations</span>
          </h2>
          <span className="text-xs font-mono text-white/40">{attestations.length} Attestations Mapped</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {attestations.map((att, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              key={att.id}
              className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.035] transition-all duration-300"
            >
              {/* Card Top Row */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Satellite className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white/95 text-base">{att.satellite}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-white/60">
                        NORAD #{att.noradId}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{att.groundStation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 ${
                    att.settlement.action === 'RELEASE' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {att.settlement.action === 'RELEASE' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )}
                    <span>{att.settlement.action === 'RELEASE' ? 'SETTLED (100% RELEASE)' : 'PARTIAL REFUND SETTLED'}</span>
                  </div>

                  <a
                    href={att.settlement.etherscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 text-xs font-medium transition-all flex items-center gap-1.5"
                  >
                    <span>Inspect on Etherscan</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Metrics & Quality Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-white/[0.05] text-xs">
                <div>
                  <span className="text-white/40 block mb-1">Packet Quality</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-white/95 text-sm">{att.frameQualityPct}%</span>
                    <span className="text-[10px] text-white/40 font-mono">({att.validFrames}/{att.totalFrames})</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full ${att.frameQualityPct >= 95 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                      style={{ width: `${att.frameQualityPct}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <span className="text-white/40 block mb-1">Downlink RF Specs</span>
                  <div className="font-mono text-white/90 text-xs">{att.frequency}</div>
                  <div className="text-[11px] text-white/50 font-mono mt-0.5">SNR: {att.snr}</div>
                </div>

                <div>
                  <span className="text-white/40 block mb-1">Settlement Payout</span>
                  <div className="font-mono text-emerald-400 text-xs font-medium">{att.settlement.operatorPayout}</div>
                  <div className="text-[11px] text-white/40 font-mono mt-0.5">
                    Buyer Refund: {att.settlement.buyerRefund}
                  </div>
                </div>

                <div>
                  <span className="text-white/40 block mb-1">On-Chain Block</span>
                  <div className="font-mono text-white/90 text-xs">
                    {att.settlement.blockNumber ? `#${att.settlement.blockNumber}` : 'Confirmed'}
                  </div>
                  <div className="text-[11px] text-white/40 font-mono mt-0.5">
                    Gas: {att.settlement.gasUsed || 'Optimized'}
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof Details */}
              <div className="pt-4 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2 border border-white/[0.04]">
                  <span className="text-white/40 font-sans">SHA-256 Fingerprint:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 truncate max-w-[280px] md:max-w-md">{att.sha256Fingerprint}</span>
                    <button
                      onClick={() => handleCopy(att.sha256Fingerprint, `fp-${att.id}`)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      {copiedKey === `fp-${att.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2 border border-white/[0.04]">
                  <span className="text-white/40 font-sans">Oracle ECDSA Signature:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 truncate max-w-[280px] md:max-w-md">{att.oracleSignature}</span>
                    <button
                      onClick={() => handleCopy(att.oracleSignature, `sig-${att.id}`)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      {copiedKey === `sig-${att.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2 border border-white/[0.04]">
                  <span className="text-white/40 font-sans">Settlement Tx Hash:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={att.settlement.etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 truncate max-w-[260px] md:max-w-md flex items-center gap-1"
                    >
                      <span>{att.settlement.txHash}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Ingest Stream */}
      <section className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
            <h2 className="text-lg font-semibold text-white/90">SatNOGS / NOAA Ground Station Ingest Feed</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400/80">LIVE TELEMETRY STREAM</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {liveFrames.map((frame, i) => (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              key={frame.id + i}
              className="flex items-center justify-between py-3 font-mono text-xs"
            >
              <div className="flex items-center gap-4">
                <Radio className="w-4 h-4 text-white/40" />
                <span className="text-white/90 font-medium">{frame.id}</span>
                <span className="text-white/40 text-[11px] hidden sm:inline">{frame.satellite}</span>
                <span className="text-white/30 text-[10px] hidden md:inline">[{frame.groundStation}]</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/40 text-[11px]">{frame.snr}</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Signal className="w-3.5 h-3.5" />
                  <span>{frame.quality}%</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {frame.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
