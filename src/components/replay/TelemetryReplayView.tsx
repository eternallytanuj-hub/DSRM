"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  Satellite,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Layers,
  Database,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { GroundTrackMap } from "./GroundTrackMap";
import { MerkleProofViewer } from "./MerkleProofViewer";
import { useVerification } from "@/lib/replay/useVerification";
import { computeLeafHash } from "@/lib/replay/merkle";
import { bytesToHex } from "@/lib/replay/hashing";
import { KNOWN_ATTESTERS } from "@/config/attesters";
import type {
  EvidenceBundle,
  VerificationStepId,
} from "@/lib/replay/types";

interface TelemetryReplayViewProps {
  initialBundle: EvidenceBundle | null;
  observationId?: string;
  registryAddress?: string;
}

export function TelemetryReplayView({
  initialBundle,
  observationId = "11726893",
  registryAddress,
}: TelemetryReplayViewProps) {
  const [mounted, setMounted] = useState(false);
  const [originalBundle, setOriginalBundle] = useState<EvidenceBundle | null>(initialBundle);
  const [activeBundle, setActiveBundle] = useState<EvidenceBundle | null>(initialBundle);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  // Tamper test state
  const [tamperMode, setTamperMode] = useState<"none" | "byte_flip" | "time_shift">("none");
  const [isTampered, setIsTampered] = useState(false);

  // Playback & Scrubber state
  const [scrubTimeMs, setScrubTimeMs] = useState<number>(
    initialBundle?.pass.aosMs || 0
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 10 | 60>(1);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Precomputed frame leaf hashes for frame log table
  const [frameLeafHashes, setFrameLeafHashes] = useState<Record<number, string>>({});

  // Verification Engine Hook
  const {
    verification,
    isVerifying,
    runningStepId,
    runAll,
    runStep,
  } = useVerification({
    initialBundle: activeBundle,
    observationId,
    registryAddress,
    autoRun: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch bundle on mount if not provided from server
  useEffect(() => {
    if (!initialBundle) {
      fetch(`/replay/${observationId}/bundle.json`)
        .then((r) => r.json())
        .then((b: EvidenceBundle) => {
          setOriginalBundle(b);
          setActiveBundle(b);
          setScrubTimeMs(b.pass.aosMs);
          runAll(b);
        })
        .catch((err) => {
          console.error("Failed to load local bundle:", err);
        });
    } else {
      setOriginalBundle(initialBundle);
      setActiveBundle(initialBundle);
      setScrubTimeMs(initialBundle.pass.aosMs);
    }
  }, [initialBundle, observationId, runAll]);

  // Compute leaf hashes for frame log table
  useEffect(() => {
    if (!activeBundle) return;
    let cancelled = false;

    async function loadHashes() {
      if (!activeBundle) return;
      const map: Record<number, string> = {};
      for (const frame of activeBundle.frames) {
        if (cancelled) return;
        const h = await computeLeafHash(frame);
        map[frame.index] = bytesToHex(h);
      }
      if (!cancelled) {
        setFrameLeafHashes(map);
      }
    }

    loadHashes();
    return () => {
      cancelled = true;
    };
  }, [activeBundle]);

  // Playback scrubber loop
  useEffect(() => {
    if (!isPlaying || !activeBundle) return;

    const intervalMs = 100;
    const los = activeBundle.pass.losMs;

    const timer = setInterval(() => {
      setScrubTimeMs((prev) => {
        const step = intervalMs * playbackSpeed;
        const next = prev + step;
        if (next >= los) {
          setIsPlaying(false);
          return los;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, activeBundle]);

  // Derived scrub values
  const aosMs = activeBundle?.pass.aosMs || 0;
  const losMs = activeBundle?.pass.losMs || 1;
  const passDurationMs = Math.max(1, losMs - aosMs);
  const currentOffsetSec = Math.max(0, Math.round((scrubTimeMs - aosMs) / 1000));

  // Current interpolated point on ground track
  const groundTrack = useMemo(() => {
    return verification?.geometryResult?.groundTrack || [];
  }, [verification?.geometryResult?.groundTrack]);

  const currentPoint = useMemo(() => {
    if (groundTrack.length === 0) return null;
    let closest = groundTrack[0];
    let minDiff = Math.abs(groundTrack[0].tsMs - scrubTimeMs);

    for (let i = 1; i < groundTrack.length; i++) {
      const diff = Math.abs(groundTrack[i].tsMs - scrubTimeMs);
      if (diff < minDiff) {
        minDiff = diff;
        closest = groundTrack[i];
      }
    }
    return closest;
  }, [groundTrack, scrubTimeMs]);

  const inView = currentPoint ? currentPoint.elevationCentiDeg >= 1000 : false;
  const elevationDeg = currentPoint ? currentPoint.elevationCentiDeg / 100 : 0;
  const azimuthDeg = currentPoint ? currentPoint.azimuthDeg : 0;

  // Live frame counters up to scrub time
  const framesReceived = useMemo(() => {
    if (!activeBundle) return [];
    return activeBundle.frames.filter((f) => f.tsMs <= scrubTimeMs);
  }, [activeBundle, scrubTimeMs]);

  const bytesReceived = useMemo(() => {
    let bytes = 0;
    for (const f of framesReceived) {
      bytes += f.hex.length / 2;
    }
    return bytes;
  }, [framesReceived]);

  const totalBytesCount = useMemo(() => {
    if (!activeBundle) return 0;
    let b = 0;
    for (const f of activeBundle.frames) {
      b += f.hex.length / 2;
    }
    return b;
  }, [activeBundle]);

  // Frame arrival chart data
  const chartData = useMemo(() => {
    if (!activeBundle) return [];
    const points: Array<{ timeSec: number; cumulativeFrames: number; cumulativeBytes: number }> = [];
    let cumFrames = 0;
    let cumBytes = 0;

    points.push({ timeSec: 0, cumulativeFrames: 0, cumulativeBytes: 0 });

    for (const f of activeBundle.frames) {
      cumFrames++;
      cumBytes += f.hex.length / 2;
      const tSec = Math.round((f.tsMs - aosMs) / 1000);
      points.push({
        timeSec: tSec,
        cumulativeFrames: cumFrames,
        cumulativeBytes: cumBytes,
      });
    }
    return points;
  }, [activeBundle, aosMs]);

  // Selected frame for Merkle proof viewer
  const selectedFrame = useMemo(() => {
    if (selectedFrameIndex === null || !activeBundle) return null;
    return activeBundle.frames[selectedFrameIndex] || null;
  }, [selectedFrameIndex, activeBundle]);

  // Copy helper
  const copyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.info(`Copied ${label}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Tamper Test Actions (In-Memory Only, Section 11)
  const applyTamper = (mode: "byte_flip" | "time_shift") => {
    if (!originalBundle) return;
    const copy: EvidenceBundle = JSON.parse(JSON.stringify(originalBundle));

    if (mode === "byte_flip") {
      let targetIdx = selectedFrameIndex;
      if (targetIdx === null) {
        targetIdx = Math.floor(Math.random() * copy.frames.length);
        setSelectedFrameIndex(targetIdx);
      }
      const targetFrame = copy.frames[targetIdx];
      if (targetFrame) {
        const currentByte = targetFrame.hex.slice(0, 2);
        const flippedByte = currentByte === "ff" ? "00" : "ff";
        targetFrame.hex = flippedByte + targetFrame.hex.slice(2);
      }
      setIsTampered(true);
      setTamperMode("byte_flip");
      setActiveBundle(copy);
      runAll(copy);
      toast.warning(`Tamper test applied: 1 byte flipped in frame #${targetIdx}`);
    } else if (mode === "time_shift") {
      const shiftMs = 2 * 3600 * 1000; // 2 hours
      copy.pass.startMs += shiftMs;
      copy.pass.endMs += shiftMs;
      copy.pass.aosMs += shiftMs;
      copy.pass.losMs += shiftMs;
      for (const f of copy.frames) {
        f.tsMs += shiftMs;
      }
      setIsTampered(true);
      setTamperMode("time_shift");
      setActiveBundle(copy);
      setScrubTimeMs(copy.pass.aosMs);
      runAll(copy);
      toast.warning("Tamper test applied: all pass timestamps shifted by +2 hours");
    }
  };

  const restoreOriginal = () => {
    if (!originalBundle) return;
    setIsTampered(false);
    setTamperMode("none");
    setActiveBundle(originalBundle);
    setScrubTimeMs(originalBundle.pass.aosMs);
    runAll(originalBundle);
    toast.success("Restored authentic evidence bundle");
  };

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!mounted || !activeBundle) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6 text-zinc-100 font-mono">
        <Skeleton className="h-10 w-3/4 bg-zinc-900" />
        <Skeleton className="h-14 w-full bg-zinc-900" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full bg-zinc-900" />
          <Skeleton className="h-96 w-full bg-zinc-900" />
        </div>
      </div>
    );
  }

  const verdict = verification?.verdict;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 text-zinc-200 font-sans selection:bg-zinc-800">
      {/* ======================================================== */}
      {/* 1. HEADER & PERSISTENT INVARIANT BANNER                  */}
      {/* ======================================================== */}
      <section className="space-y-4">
        {/* Persistent Invariant 4 Banner (No borders, no shadows) */}
        <Alert className="bg-zinc-950 rounded-lg text-zinc-300">
          <Info className="h-4 w-4 text-zinc-400" />
          <AlertTitle className="text-xs font-mono font-semibold tracking-wide uppercase text-zinc-200">
            Retroactive Settlement Replay
          </AlertTitle>
          <AlertDescription className="text-xs text-zinc-400 font-mono mt-0.5">
            Retroactive settlement replay: verifies the pipeline on a real public observation. No operator sold capacity in this booking.
          </AlertDescription>
        </Alert>

        {/* Title & Provenance Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Telemetry Oracle — Verifiable Satellite Pass Replay
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Live in-browser verification of cryptographic Merkle telemetry commitments against on-chain consensus.
            </p>
          </div>

          {/* Group-level Provenance Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="text-zinc-500 mr-1 text-[10px] uppercase">Provenance:</span>
            <a
              href={activeBundle.source.observationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 bg-zinc-900 text-zinc-200 rounded hover:text-white transition-colors flex items-center gap-1"
            >
              <span>OBSERVATION: REAL</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
            </a>
            <a
              href={`https://network.satnogs.org/stations/${activeBundle.source.stationId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 bg-zinc-900 text-zinc-200 rounded hover:text-white transition-colors flex items-center gap-1"
            >
              <span>STATION: REAL</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
            </a>
            <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded">
              GEOMETRY: DERIVED (SGP4)
            </span>
            <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded">
              SCORING: DERIVED (SCHEDULE B)
            </span>
            <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded">
              BOOKING: SIMULATED
            </span>
          </div>
        </div>

        {/* Key Identifiers Strip with Accessible Copy */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-zinc-950 p-3 rounded-lg text-xs font-mono">
          <div className="flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase">Booking ID</span>
            <button
              onClick={() => copyText("bookingId", activeBundle.booking.bookingId)}
              className="flex items-center justify-between text-zinc-300 hover:text-white transition-colors text-left"
            >
              <span className="truncate">{activeBundle.booking.bookingId.slice(0, 10)}...</span>
              {copiedId === "bookingId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase">Bundle Hash</span>
            <button
              onClick={() => copyText("bundleHash", verification?.bundleHash || "")}
              className="flex items-center justify-between text-zinc-300 hover:text-white transition-colors text-left"
            >
              <span className="truncate">{verification?.bundleHash?.slice(0, 10) || "computing..."}...</span>
              {copiedId === "bundleHash" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase">Merkle Root</span>
            <button
              onClick={() => copyText("merkleRoot", verification?.merkleRoot || "")}
              className="flex items-center justify-between text-zinc-300 hover:text-white transition-colors text-left"
            >
              <span className="truncate">{verification?.merkleRoot?.slice(0, 10) || "computing..."}...</span>
              {copiedId === "merkleRoot" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase">CID</span>
            <button
              onClick={() => copyText("cid", verification?.onChainAttestation?.cid || `bafybeig${verification?.bundleHash?.slice(2, 20)}...`)}
              className="flex items-center justify-between text-zinc-300 hover:text-white transition-colors text-left"
            >
              <span className="truncate">{(verification?.onChainAttestation?.cid || `bafybeig...`).slice(0, 12)}...</span>
              {copiedId === "cid" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase">Registry</span>
            <button
              onClick={() => copyText("registry", registryAddress || "unset")}
              className="flex items-center justify-between text-zinc-300 hover:text-white transition-colors text-left"
            >
              <span className="truncate">{registryAddress ? `${registryAddress.slice(0, 8)}...` : "Unset (Mock)"}</span>
              {copiedId === "registry" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase">Chain</span>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Sepolia (11155111)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. REPLAY TIMELINE & CONTROLS                            */}
      {/* ======================================================== */}
      <section className="bg-zinc-950 p-5 rounded-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center transition-colors"
              aria-label={isPlaying ? "Pause replay" : "Play replay"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setScrubTimeMs(aosMs);
              }}
              className="w-9 h-9 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center transition-colors"
              aria-label="Reset scrubber to AOS"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-zinc-900 rounded p-0.5 text-xs font-mono">
              {([1, 10, 60] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    playbackSpeed === s ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Scrubber Clock Info */}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-200">{new Date(scrubTimeMs).toISOString().slice(11, 19)} UTC</span>
            </div>
            <div>
              Offset: <span className="text-zinc-200">+{Math.floor(currentOffsetSec / 60)}m {currentOffsetSec % 60}s</span>
            </div>
            <div className="text-zinc-500">
              Total Pass: {Math.round(passDurationMs / 1000)}s
            </div>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-1.5">
          <Slider
            value={[scrubTimeMs]}
            min={aosMs}
            max={losMs}
            step={500}
            onValueChange={(val) => {
              setIsPlaying(false);
              setScrubTimeMs(val[0]);
            }}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>AOS: {new Date(aosMs).toISOString().slice(11, 19)} UTC</span>
            <span>MAX EL: ~56.4° (Mid-Pass)</span>
            <span>LOS: {new Date(losMs).toISOString().slice(11, 19)} UTC</span>
          </div>
        </div>

        {/* Main Replay Grid: Ground Track Map + Real Telemetry Counter/Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {/* Ground Track Map */}
          <div>
            <GroundTrackMap
              station={{
                lat: activeBundle.source.stationLatMicroDeg / 1_000_000,
                lon: activeBundle.source.stationLonMicroDeg / 1_000_000,
                name: activeBundle.source.stationName,
                altM: activeBundle.source.stationAltM,
              }}
              groundTrack={groundTrack}
              currentPoint={currentPoint}
              inView={inView}
              elevationDeg={elevationDeg}
              azimuthDeg={azimuthDeg}
            />
          </div>

          {/* Telemetry Counter & Frame Arrival Chart */}
          <div className="bg-zinc-950 p-4 rounded-lg flex flex-col justify-between space-y-4">
            {/* Live Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-900/60 p-3 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Frames Decoded</span>
                  <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded font-mono">REAL</span>
                </div>
                <div className="text-xl font-mono font-semibold text-zinc-100 mt-1">
                  {framesReceived.length}{" "}
                  <span className="text-xs font-normal text-zinc-500">/ {activeBundle.frames.length}</span>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Decoded Volume</span>
                  <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded font-mono">REAL</span>
                </div>
                <div className="text-xl font-mono font-semibold text-zinc-100 mt-1">
                  {bytesReceived}{" "}
                  <span className="text-xs font-normal text-zinc-500">/ {totalBytesCount} B</span>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Quota / Price</span>
                  <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-400 rounded font-mono">SIMULATED</span>
                </div>
                <div className="text-base font-mono font-semibold text-zinc-100 mt-1 truncate">
                  {activeBundle.booking.requestedDataBytes} B <span className="text-xs font-normal text-zinc-500">(0.0005 ETH)</span>
                </div>
              </div>
            </div>

            {/* Cumulative Arrival Chart */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span>CUMULATIVE FRAME ARRIVAL</span>
                  <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded">REAL</span>
                </div>
                <span className="text-zinc-500 text-[10px]">T+{currentOffsetSec}s</span>
              </div>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="timeSec" tick={{ fill: "#71717a", fontSize: 10 }} stroke="#27272a" />
                    <YAxis tick={{ fill: "#71717a", fontSize: 10 }} stroke="#27272a" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#09090b", border: "none", fontSize: 11, fontFamily: "monospace" }}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="cumulativeFrames"
                      stroke="#fafafa"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <ReferenceLine x={currentOffsetSec} stroke="#34d399" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Invariant 5 Mandatory Disclosure on SNR and Exclusions */}
            <div className="bg-zinc-900/40 p-3 rounded text-[11px] font-mono text-zinc-400 space-y-1">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-300 font-medium">SNR Telemetry Note:</span> Calibrated signal strength is not available from public SatNOGS demodulated telemetry. Data is exported post-decoding without raw receiver IQ metrics. Per Invariant 5, synthetic SNR curves are excluded.
                </div>
              </div>
              <div className="pl-5 text-zinc-500">
                Packet error rate and signal integrity are not measurable from public SatNOGS demodulated data and are excluded from scoring profile v1 (which deterministically scores contact coverage, data volume, and frame continuity).
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Frame Log */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">TELEMETRY FRAME LOG (CLICK ROW TO INSPECT MERKLE PROOF)</span>
              <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded">REAL</span>
            </div>
            <span className="text-zinc-500">
              Showing {activeBundle.frames.length} frames sorted by (tsMs, index)
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto rounded bg-zinc-950 font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-900/90 backdrop-blur text-zinc-400 text-[11px]">
                <tr>
                  <th className="py-1.5 px-3 font-normal">Index</th>
                  <th className="py-1.5 px-3 font-normal">Timestamp (UTC)</th>
                  <th className="py-1.5 px-3 font-normal">Offset</th>
                  <th className="py-1.5 px-3 font-normal">Bytes</th>
                  <th className="py-1.5 px-3 font-normal">Leaf Hash (SHA-256)</th>
                  <th className="py-1.5 px-3 font-normal">Payload Prefix</th>
                </tr>
              </thead>
              <tbody>
                {activeBundle.frames.map((frame) => {
                  const isSelected = selectedFrameIndex === frame.index;
                  const isArrived = frame.tsMs <= scrubTimeMs;
                  const offsetSec = Math.round((frame.tsMs - aosMs) / 1000);
                  const leafH = frameLeafHashes[frame.index] || "calculating...";

                  return (
                    <tr
                      key={frame.index}
                      onClick={() => setSelectedFrameIndex(frame.index)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-zinc-800 text-white font-medium"
                          : isArrived
                          ? "hover:bg-zinc-900 text-zinc-200"
                          : "opacity-40 hover:opacity-80 text-zinc-500"
                      }`}
                    >
                      <td className="py-1 px-3">#{frame.index}</td>
                      <td className="py-1 px-3 text-zinc-400">{new Date(frame.tsMs).toISOString().slice(11, 23)}</td>
                      <td className="py-1 px-3 text-zinc-400">+{offsetSec}s</td>
                      <td className="py-1 px-3">{frame.hex.length / 2} B</td>
                      <td className="py-1 px-3 text-zinc-400 truncate max-w-[140px]" title={leafH}>
                        {leafH.slice(0, 14)}...
                      </td>
                      <td className="py-1 px-3 text-zinc-500 truncate max-w-[120px]">
                        0x{frame.hex.slice(0, 16)}...
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. VERIFICATION PANEL & TAMPER CONTROLS                  */}
      {/* ======================================================== */}
      <section className="bg-zinc-950 p-5 rounded-lg space-y-6">
        {/* Panel Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-zinc-300" />
              <span>Cryptographic Verification Pipeline</span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Live deterministic verification of evidence bundle hashes, Merkle tree roots, EIP-712 multisig signatures, and orbital physics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => runAll(activeBundle)}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying && runningStepId === null ? "animate-spin" : ""}`} />
              <span>{isVerifying && runningStepId === null ? "Computing..." : "Run All Checks"}</span>
            </button>
          </div>
        </div>

        {/* Tamper Simulation Section (Section 11) */}
        <div className="bg-zinc-900/60 p-4 rounded-lg space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold text-zinc-200">Local In-Memory Tamper Test</span>
              {isTampered && (
                <span className="bg-red-950 text-red-400 text-[10px] px-2 py-0.5 rounded font-sans uppercase">
                  Tampered (local simulation)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={tamperMode}
                onChange={(e) => {
                  const m = e.target.value as "none" | "byte_flip" | "time_shift";
                  if (m === "none") {
                    restoreOriginal();
                  } else {
                    applyTamper(m);
                  }
                }}
                className="bg-zinc-950 text-zinc-300 rounded px-2.5 py-1 text-xs outline-none"
              >
                <option value="none">Normal (Authentic Evidence)</option>
                <option value="byte_flip">Mode 1: Flip 1 byte in payload (Breaks SHA-256 & Merkle)</option>
                <option value="time_shift">Mode 2: Shift timestamps +2 hours (Breaks Orbital Geometry)</option>
              </select>

              {isTampered && (
                <button
                  onClick={restoreOriginal}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors"
                >
                  Restore Original
                </button>
              )}
            </div>
          </div>
          <div className="text-zinc-500 text-[11px] leading-relaxed">
            Tamper tests operate strictly in-memory on local bundle copies and never write to storage or mutate stored files.
          </div>
        </div>

        {/* Invariant 6 Overall Verdict Banner */}
        {verdict && (
          <div
            className={`p-4 rounded-lg text-xs font-mono ${
              verdict.status === "pass"
                ? "bg-emerald-950/20 text-emerald-300"
                : verdict.status === "warn"
                ? "bg-amber-950/20 text-amber-300"
                : verdict.status === "unconfigured"
                ? "bg-amber-950/20 text-amber-300"
                : "bg-red-950/20 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {verdict.status === "pass" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : verdict.status === "warn" || verdict.status === "unconfigured" ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{verdict.title}</span>
            </div>
            <div className="mt-1 text-zinc-400 text-xs leading-relaxed">
              {verdict.description}
            </div>
          </div>
        )}

        {/* 7 Verification Steps with Per-Step Re-run */}
        <div className="space-y-2">
          {verification &&
            (
              [
                "fetch_bundle",
                "bundle_hash",
                "chain_attestation",
                "hash_comparison",
                "signatures",
                "recompute_score",
                "geometry",
              ] as VerificationStepId[]
            ).map((stepId, idx) => {
              const step = verification.steps[stepId];
              const isExpanded = !!expandedSteps[stepId];
              const isRunningThisStep = isVerifying && runningStepId === stepId;

              return (
                <div
                  key={stepId}
                  className="rounded-lg bg-zinc-900/30 overflow-hidden font-mono text-xs"
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between p-3">
                    <div
                      onClick={() => toggleStep(stepId)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <span className="text-zinc-600 font-medium">#{idx + 1}</span>
                      <span className="font-semibold text-zinc-200">{step.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {step.elapsedMs !== undefined && (
                        <span className="text-zinc-500 text-[11px]">{step.elapsedMs}ms</span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold flex items-center gap-1 ${
                          step.status === "pass"
                            ? "bg-emerald-950 text-emerald-400"
                            : step.status === "warn"
                            ? "bg-amber-950 text-amber-400"
                            : step.status === "unconfigured"
                            ? "bg-amber-950 text-amber-400"
                            : step.status === "running"
                            ? "bg-zinc-800 text-zinc-300"
                            : step.status === "blocked"
                            ? "bg-zinc-900 text-zinc-500"
                            : "bg-red-950 text-red-400"
                        }`}
                      >
                        {step.status === "pass" && <Check className="w-3 h-3" />}
                        {step.status === "warn" && <AlertTriangle className="w-3 h-3" />}
                        {step.status === "fail" && <ShieldAlert className="w-3 h-3" />}
                        <span>{step.status}</span>
                      </span>

                      {/* Per-step Re-run Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runStep(stepId, activeBundle);
                        }}
                        disabled={isVerifying}
                        title={`Re-run ${step.label}`}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRunningThisStep ? "animate-spin text-white" : ""}`} />
                      </button>

                      {/* Expand Chevron */}
                      <button
                        onClick={() => toggleStep(stepId)}
                        className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="px-3 pb-2 text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-zinc-900/20 pt-1">
                    <div className="truncate">
                      <span className="text-zinc-500">Actual: </span>
                      <span className="text-zinc-300">{step.actual || "--"}</span>
                    </div>
                    {step.expected && (
                      <div className="truncate text-zinc-500 sm:text-right">
                        <span>Expected: </span>
                        <span>{step.expected}</span>
                      </div>
                    )}
                  </div>

                  {/* Expandable Technical Details */}
                  {isExpanded && (
                    <div className="p-3 bg-zinc-900/40 text-[11px] space-y-2 text-zinc-400">
                      {step.detail && (
                        <div className="whitespace-pre-wrap leading-relaxed font-mono">
                          {step.detail}
                        </div>
                      )}
                      {step.error && (
                        <div className="text-red-400 font-mono bg-red-950/30 p-2 rounded">
                          Error: {step.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. MERKLE PROOF VIEWER                                   */}
      {/* ======================================================== */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-zinc-300" />
          <span>Interactive Merkle Proof Inspector</span>
        </h2>
        <MerkleProofViewer
          selectedFrame={selectedFrame}
          frames={activeBundle.frames}
          originalFrames={originalBundle?.frames}
          expectedRoot={verification?.merkleRoot || null}
          isTampered={isTampered && tamperMode === "byte_flip"}
        />
      </section>

      {/* ======================================================== */}
      {/* 5. ATTESTER & CONSENSUS PANEL                            */}
      {/* ======================================================== */}
      <section className="bg-zinc-950 p-5 rounded-lg space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
              <Satellite className="w-4 h-4 text-zinc-300" />
              <span>Oracle Attester Registry & Multisig Quorum</span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Authorized EIP-712 signer keys and independent operator status.
            </p>
          </div>
          <span className="bg-amber-950 text-amber-400 text-xs font-mono px-2 py-0.5 rounded">
            NON-INDEPENDENT (TESTNET)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {Object.values(KNOWN_ATTESTERS).map((attester) => {
            const hasSigned = verification?.signatures.some(
              (s) => s.signer.toLowerCase() === attester.address.toLowerCase()
            );

            return (
              <div
                key={attester.address}
                className="p-3 bg-zinc-900/40 rounded space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">{attester.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      hasSigned
                        ? "bg-emerald-950 text-emerald-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {hasSigned ? "SIGNED" : "STANDBY"}
                  </span>
                </div>

                <div className="text-zinc-500 truncate" title={attester.address}>
                  {attester.address}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span>Operator: {attester.operator}</span>
                  <span className="text-amber-400 text-[10px]">{attester.note}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. LINKS & PROVENANCE PANEL                              */}
      {/* ======================================================== */}
      <section className="bg-zinc-950 p-5 rounded-lg space-y-4 font-mono text-xs">
        <div className="pb-2">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-300" />
            <span>Public Data Provenance & Cryptographic References</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Direct external verification links to SatNOGS Network, on-chain explorer, and IPFS bundle gateways.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <a
            href={activeBundle.source.observationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-zinc-900/50 hover:bg-zinc-900 rounded transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-zinc-200">SatNOGS Observation</div>
              <div className="text-[11px] text-zinc-500">#{activeBundle.source.observationId}</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <a
            href={`https://network.satnogs.org/stations/${activeBundle.source.stationId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-zinc-900/50 hover:bg-zinc-900 rounded transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-zinc-200">SatNOGS Ground Station</div>
              <div className="text-[11px] text-zinc-500">Station #{activeBundle.source.stationId}</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <a
            href={activeBundle.source.dbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-zinc-900/50 hover:bg-zinc-900 rounded transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-zinc-200">SatNOGS DB Satellite</div>
              <div className="text-[11px] text-zinc-500">NORAD {activeBundle.source.noradId}</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <a
            href={`https://sepolia.etherscan.io/address/${registryAddress || "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-zinc-900/50 hover:bg-zinc-900 rounded transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-zinc-200">Sepolia Registry Contract</div>
              <div className="text-[11px] text-zinc-500">Etherscan Explorer</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <a
            href={`https://ipfs.io/ipfs/${verification?.onChainAttestation?.cid || "bafybeiga11ecac984c77ede3dbdb1ada8f669afc6d77e86a3e9b0e5f30c"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-zinc-900/50 hover:bg-zinc-900 rounded transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-zinc-200">IPFS Bundle Gateway</div>
              <div className="text-[11px] text-zinc-500">Public CID Gateway</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <a
            href={`/replay/${activeBundle.source.observationId}/bundle.json`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-zinc-900/50 hover:bg-zinc-900 rounded transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-zinc-200">Raw Bundle JSON</div>
              <div className="text-[11px] text-zinc-500">Direct Download</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        </div>

        {/* Attribution & License Notice */}
        <div className="p-3 bg-zinc-900/30 rounded text-zinc-500 text-[11px] space-y-1">
          <div>{activeBundle.source.attribution}</div>
          <div>License: {activeBundle.source.license}</div>
        </div>
      </section>
    </div>
  );
}
