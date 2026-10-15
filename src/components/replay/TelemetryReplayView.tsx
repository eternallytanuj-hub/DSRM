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
  Database,
  Info,
  Radio,
  ArrowRight,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [activeTab, setActiveTab] = useState<"replay" | "verification" | "consensus">("replay");
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
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(0);
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
        targetIdx = 0;
        setSelectedFrameIndex(0);
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8 text-zinc-200 font-sans selection:bg-zinc-800">
      {/* ======================================================== */}
      {/* 1. COMPACT PERSISTENT BANNER                             */}
      {/* ======================================================== */}
      <Alert className="bg-zinc-950 border-0 rounded-xl p-3 flex items-center gap-2 text-zinc-400 font-mono text-xs shadow-none">
        <Info className="h-4 w-4 text-zinc-400 shrink-0" />
        <AlertDescription className="text-zinc-400 text-xs leading-normal">
          <span className="text-zinc-200 font-semibold uppercase mr-1">Retroactive Settlement Replay:</span>
          Verifies telemetry pipeline on an authentic public observation. No operator sold capacity in this booking.
        </AlertDescription>
      </Alert>

      {/* ======================================================== */}
      {/* 2. HERO HEADER & EXECUTIVE VERDICT PILL                  */}
      {/* ======================================================== */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase bg-zinc-900/60 px-2 py-0.5 rounded-md">
              ORBITAL PASS #{activeBundle.source.observationId}
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-xs font-mono text-zinc-400">
              {activeBundle.source.satelliteName} (NORAD #{activeBundle.source.noradId})
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Telemetry Oracle & Verifiable Pass Replay
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Ground Station #{activeBundle.source.stationId} ({activeBundle.source.stationName}) • 12 Demodulated Frames
          </p>
        </div>

        {/* Executive Verdict & Provenance Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {verdict && (
            <button
              onClick={() => setActiveTab("verification")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                verdict.status === "pass"
                  ? "bg-emerald-950/60 text-emerald-300 hover:bg-emerald-950/90"
                  : verdict.status === "warn" || verdict.status === "unconfigured"
                  ? "bg-amber-950/60 text-amber-300 hover:bg-amber-950/90"
                  : "bg-red-950/60 text-red-300 hover:bg-red-950/90"
              }`}
            >
              {verdict.status === "pass" ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : verdict.status === "warn" || verdict.status === "unconfigured" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-red-400" />
              )}
              <span>{verdict.title}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>
          )}

          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="px-2 py-1 bg-zinc-900 text-zinc-300 rounded-md">OBS: REAL</span>
            <span className="px-2 py-1 bg-zinc-900 text-zinc-400 rounded-md">ORBIT: DERIVED</span>
            <span className="px-2 py-1 bg-zinc-900 text-zinc-400 rounded-md">BOOKING: SIMULATED</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. COMPACT METADATA RIBBON                               */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
        <button
          onClick={() => copyText("bookingId", activeBundle.booking.bookingId)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg text-zinc-300 transition-colors shrink-0"
        >
          <span className="text-zinc-500 uppercase text-[10px]">Booking:</span>
          <span>{activeBundle.booking.bookingId.slice(0, 8)}...</span>
          {copiedId === "bookingId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
        </button>

        <button
          onClick={() => copyText("bundleHash", verification?.bundleHash || "")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg text-zinc-300 transition-colors shrink-0"
        >
          <span className="text-zinc-500 uppercase text-[10px]">SHA-256:</span>
          <span>{verification?.bundleHash ? `${verification.bundleHash.slice(0, 10)}...` : "computing..."}</span>
          {copiedId === "bundleHash" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
        </button>

        <button
          onClick={() => copyText("merkleRoot", verification?.merkleRoot || "")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg text-zinc-300 transition-colors shrink-0"
        >
          <span className="text-zinc-500 uppercase text-[10px]">Root:</span>
          <span>{verification?.merkleRoot ? `${verification.merkleRoot.slice(0, 10)}...` : "computing..."}</span>
          {copiedId === "merkleRoot" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
        </button>

        <button
          onClick={() => copyText("cid", verification?.onChainAttestation?.cid || "bafybeiga11ecac984c77ede3dbdb1ada8f669afc6d77e86a3e9b0e5f30c")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg text-zinc-300 transition-colors shrink-0"
        >
          <span className="text-zinc-500 uppercase text-[10px]">CID:</span>
          <span>{(verification?.onChainAttestation?.cid || "bafybeig...").slice(0, 12)}...</span>
          {copiedId === "cid" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
        </button>

        <button
          onClick={() => copyText("registry", registryAddress || "unset")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg text-zinc-300 transition-colors shrink-0"
        >
          <span className="text-zinc-500 uppercase text-[10px]">Registry:</span>
          <span>{registryAddress ? `${registryAddress.slice(0, 8)}...` : "Sepolia (0x5CDc...)"}</span>
          {copiedId === "registry" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 rounded-lg text-zinc-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Sepolia #11155111</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN NAVIGATION TABS                                  */}
      {/* ======================================================== */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "replay" | "verification" | "consensus")}
        className="space-y-6"
      >
        <TabsList className="bg-zinc-950 p-1 rounded-xl h-auto flex flex-wrap border-0">
          <TabsTrigger
            value="replay"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-mono data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-colors"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Pass Replay & Mission Data</span>
          </TabsTrigger>
          <TabsTrigger
            value="verification"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-mono data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Pipeline & Tamper Lab</span>
            {isTampered && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="consensus"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-mono data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Consensus Quorum & Provenance</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================================================== */}
        {/* TAB 1: PASS REPLAY & MISSION DATA                    */}
        {/* ==================================================== */}
        <TabsContent value="replay" className="space-y-6 m-0">
          {/* Upper Grid: Mapbox Ground Track + Mission Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ground Track Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                <span>ORBITAL TRAJECTORY (SGP4 PROPAGATION)</span>
                <span className="text-zinc-500 text-[10px]">DERIVED FROM TLE</span>
              </div>
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

            {/* Playback Controls & Frame Arrival */}
            <div className="bg-zinc-950 p-5 rounded-2xl flex flex-col justify-between space-y-5">
              {/* Controls bar */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition-colors"
                      aria-label={isPlaying ? "Pause replay" : "Play replay"}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setScrubTimeMs(aosMs);
                      }}
                      className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center transition-colors"
                      aria-label="Reset scrubber to AOS"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 text-xs font-mono">
                      {([1, 10, 60] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setPlaybackSpeed(s)}
                          className={`px-2 py-1 rounded transition-colors ${
                            playbackSpeed === s ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-zinc-200">{new Date(scrubTimeMs).toISOString().slice(11, 19)} UTC</span>
                    </div>
                    <span>
                      +{Math.floor(currentOffsetSec / 60)}m {currentOffsetSec % 60}s{" "}
                      <span className="text-zinc-600">/ {Math.round(passDurationMs / 1000)}s</span>
                    </span>
                  </div>
                </div>

                {/* Slider */}
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
                    <span>MAX ELEVATION: ~56.4°</span>
                    <span>LOS: {new Date(losMs).toISOString().slice(11, 19)} UTC</span>
                  </div>
                </div>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-zinc-900/60 p-3 rounded-xl">
                  <div className="text-[10px] text-zinc-500 uppercase">Frames</div>
                  <div className="text-lg font-semibold text-white mt-0.5">
                    {framesReceived.length} <span className="text-xs text-zinc-500 font-normal">/ {activeBundle.frames.length}</span>
                  </div>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-xl">
                  <div className="text-[10px] text-zinc-500 uppercase">Volume</div>
                  <div className="text-lg font-semibold text-white mt-0.5">
                    {bytesReceived} <span className="text-xs text-zinc-500 font-normal">/ {totalBytesCount} B</span>
                  </div>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-xl">
                  <div className="text-[10px] text-zinc-500 uppercase">Settlement Quota</div>
                  <div className="text-sm font-semibold text-white mt-1 truncate">
                    {activeBundle.booking.requestedDataBytes} B
                  </div>
                </div>
              </div>

              {/* Cumulative Frame Arrival Chart */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>CUMULATIVE FRAME ARRIVAL (REAL)</span>
                  <span className="text-zinc-500 text-[10px]">T+{currentOffsetSec}s</span>
                </div>
                <div className="h-[120px] w-full">
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
            </div>
          </div>

          {/* Lower Section: Telemetry Frame Stream & Invariant 5 Disclosure */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <span>TELEMETRY FRAME STREAM (CLICK TO SELECT FOR MERKLE PROOF)</span>
                <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">REAL</span>
              </div>
              {selectedFrame && (
                <button
                  onClick={() => setActiveTab("verification")}
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors self-start"
                >
                  <span>Inspect Frame #{selectedFrame.index} Merkle Proof</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl bg-zinc-950 font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-zinc-900/90 backdrop-blur text-zinc-400 text-[11px]">
                  <tr>
                    <th className="py-2 px-3 font-normal">Index</th>
                    <th className="py-2 px-3 font-normal">Timestamp (UTC)</th>
                    <th className="py-2 px-3 font-normal">Offset</th>
                    <th className="py-2 px-3 font-normal">Bytes</th>
                    <th className="py-2 px-3 font-normal">Leaf Hash (SHA-256)</th>
                    <th className="py-2 px-3 font-normal">Payload Sample</th>
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
                        onClick={() => {
                          setSelectedFrameIndex(frame.index);
                          toast.info(`Selected Frame #${frame.index} for Merkle proof`);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-800 text-white font-medium"
                            : isArrived
                            ? "hover:bg-zinc-900 text-zinc-200"
                            : "opacity-40 hover:opacity-80 text-zinc-500"
                        }`}
                      >
                        <td className="py-1.5 px-3">#{frame.index}</td>
                        <td className="py-1.5 px-3 text-zinc-400">{new Date(frame.tsMs).toISOString().slice(11, 23)}</td>
                        <td className="py-1.5 px-3 text-zinc-400">+{offsetSec}s</td>
                        <td className="py-1.5 px-3">{frame.hex.length / 2} B</td>
                        <td className="py-1.5 px-3 text-zinc-400 truncate max-w-[140px]" title={leafH}>
                          {leafH.slice(0, 14)}...
                        </td>
                        <td className="py-1.5 px-3 text-zinc-500 truncate max-w-[120px]">
                          0x{frame.hex.slice(0, 16)}...
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Invariant 5 Mandatory Disclosure */}
            <div className="bg-zinc-950 p-4 rounded-xl text-xs font-mono text-zinc-400 space-y-1">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-200 font-semibold">SNR Telemetry Disclosure:</span> Calibrated signal strength is not available from public SatNOGS demodulated telemetry. Data is exported post-decoding without raw receiver IQ metrics. Per Invariant 5, synthetic SNR curves are excluded.
                </div>
              </div>
              <div className="pl-6 text-zinc-500 text-[11px]">
                Packet error rate and signal integrity are not measurable from public SatNOGS demodulated data and are excluded from scoring profile v1.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 2: VERIFICATION PIPELINE & TAMPER LAB            */}
        {/* ==================================================== */}
        <TabsContent value="verification" className="space-y-6 m-0">
          {/* Executive Verdict Hero Banner */}
          {verdict && (
            <div
              className={`p-5 rounded-2xl font-mono text-xs ${
                verdict.status === "pass"
                  ? "bg-emerald-950/40 text-emerald-300"
                  : verdict.status === "warn" || verdict.status === "unconfigured"
                  ? "bg-amber-950/40 text-amber-300"
                  : "bg-red-950/40 text-red-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {verdict.status === "pass" ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : verdict.status === "warn" || verdict.status === "unconfigured" ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h2 className="text-base font-semibold text-white">{verdict.title}</h2>
                    <p className="mt-1 text-zinc-300 text-xs leading-relaxed max-w-3xl">
                      {verdict.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => runAll(activeBundle)}
                  disabled={isVerifying}
                  className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold px-4 py-2 rounded-xl shrink-0 border-0 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying && runningStepId === null ? "animate-spin" : ""}`} />
                  <span>{isVerifying ? "Verifying..." : "Re-run All Checks"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Interactive In-Memory Tamper Sandbox */}
          <div className="bg-zinc-950 p-5 rounded-2xl space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">Interactive In-Memory Tamper Sandbox</span>
                {isTampered && (
                  <Badge variant="destructive" className="text-[10px] uppercase font-sans">
                    Tampered Simulation Active
                  </Badge>
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
                  aria-label="Tamper simulation mode"
                  className="bg-zinc-900 text-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none cursor-pointer"
                >
                  <option value="none">Normal (Authentic Evidence)</option>
                  <option value="byte_flip">Mode 1: Flip 1 Byte in Frame (Breaks SHA-256 & Merkle)</option>
                  <option value="time_shift">Mode 2: Shift Timestamps +2hr (Breaks SGP4 Orbit)</option>
                </select>

                {isTampered && (
                  <Button
                    onClick={restoreOriginal}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-lg px-3 py-1.5 h-auto border-0"
                  >
                    Restore Authentic
                  </Button>
                )}
              </div>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Test how on-chain mathematical consensus immediately rejects forged telemetry. Runs strictly in-browser memory without altering stored data.
            </p>
          </div>

          {/* 8-Step Verification Pipeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1 pb-1">
              <span>8-STEP DETERMINISTIC VERIFICATION PIPELINE</span>
              <span className="text-zinc-500 text-[10px]">ALL CHECKS EXECUTE IN-BROWSER</span>
            </div>

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
                  "delivery_challenge",
                ] as VerificationStepId[]
              ).map((stepId, idx) => {
                const step = verification.steps[stepId];
                const isExpanded = !!expandedSteps[stepId];
                const isRunningThisStep = isVerifying && runningStepId === stepId;

                return (
                  <div
                    key={stepId}
                    className="rounded-xl bg-zinc-950 overflow-hidden font-mono text-xs transition-colors"
                  >
                    {/* Step Header */}
                    <div className="flex items-center justify-between p-3.5">
                      <div
                        onClick={() => toggleStep(stepId)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <span className="text-zinc-600 font-medium">#{idx + 1}</span>
                        <span className="font-semibold text-zinc-100">{step.label}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {step.elapsedMs !== undefined && (
                          <span className="text-zinc-500 text-[11px]">{step.elapsedMs}ms</span>
                        )}

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

                        <button
                          onClick={() => toggleStep(stepId)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Compact Actual vs Expected summary */}
                    <div className="px-3.5 pb-2.5 text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-zinc-900/20 pt-1">
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

                    {/* Technical Details */}
                    {isExpanded && (
                      <div className="p-3.5 bg-zinc-900/40 text-[11px] space-y-2 text-zinc-400 border-t border-zinc-900">
                        {step.detail && (
                          <div className="whitespace-pre-wrap leading-relaxed font-mono">
                            {step.detail}
                          </div>
                        )}
                        {step.error && (
                          <div className="text-red-400 font-mono bg-red-950/30 p-2.5 rounded-lg">
                            Error: {step.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Merkle Proof Inspector */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono text-zinc-400 px-1">
              CRYPTOGRAPHIC MERKLE INCLUSION PROOF
            </div>
            <MerkleProofViewer
              selectedFrame={selectedFrame}
              frames={activeBundle.frames}
              originalFrames={originalBundle?.frames}
              expectedRoot={verification?.merkleRoot || null}
              isTampered={isTampered && tamperMode === "byte_flip"}
              onSelectFrame={setSelectedFrameIndex}
            />
          </div>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 3: CONSENSUS QUORUM & PROVENANCE                 */}
        {/* ==================================================== */}
        <TabsContent value="consensus" className="space-y-6 m-0">
          {/* Oracle Attesters */}
          <section className="bg-zinc-950 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-zinc-400" />
                  <span>Oracle Attester Registry & Multisig Quorum</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Authorized EIP-712 signer keys verifying cryptographic telemetry consensus.
                </p>
              </div>
              <span className="bg-amber-950/60 text-amber-400 text-xs font-mono px-2.5 py-1 rounded-md self-start">
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
                    className="p-3.5 bg-zinc-900/40 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200">{attester.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
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

          {/* Public Data Provenance Links */}
          <section className="bg-zinc-950 p-5 rounded-2xl space-y-4 font-mono text-xs">
            <div className="pb-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-400" />
                <span>Public Data Provenance & Verification Links</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Direct links to SatNOGS Network, on-chain explorer, and IPFS bundle gateways.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <a
                href={activeBundle.source.observationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
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
                className="p-3.5 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
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
                className="p-3.5 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-zinc-200">SatNOGS DB Satellite</div>
                  <div className="text-[11px] text-zinc-500">NORAD #{activeBundle.source.noradId}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>

              <a
                href={`https://sepolia.etherscan.io/address/${registryAddress || "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
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
                className="p-3.5 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
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
                className="p-3.5 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-zinc-200">Raw Bundle JSON</div>
                  <div className="text-[11px] text-zinc-500">Direct Download</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>
            </div>

            <div className="p-3 bg-zinc-900/30 rounded-xl text-zinc-500 text-[11px] space-y-1">
              <div>{activeBundle.source.attribution}</div>
              <div>License: {activeBundle.source.license}</div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
