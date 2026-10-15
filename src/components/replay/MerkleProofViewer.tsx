"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, ShieldCheck, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "sonner";
import {
  generateMerkleProof,
  verifyMerkleProof,
  buildLeafPreimage,
  computeLeafHash,
  computeNodeHash,
} from "@/lib/replay/merkle";
import { bytesToHex, hexToBytes } from "@/lib/replay/hashing";
import type { MerkleProof, TelemetryFrame } from "@/lib/replay/types";

interface MerkleProofViewerProps {
  selectedFrame: TelemetryFrame | null;
  frames: TelemetryFrame[];
  originalFrames?: TelemetryFrame[];
  expectedRoot: `0x${string}` | null;
  isTampered?: boolean;
  onSelectFrame?: (index: number) => void;
}

interface StepWithHash {
  level: number;
  siblingHash: `0x${string}`;
  side: "left" | "right";
  resultingHash: `0x${string}`;
  isDivergent?: boolean;
}

export function MerkleProofViewer({
  selectedFrame,
  frames,
  originalFrames,
  expectedRoot,
  isTampered = false,
  onSelectFrame,
}: MerkleProofViewerProps) {
  const [proof, setProof] = useState<MerkleProof | null>(null);
  const [stepsWithHashes, setStepsWithHashes] = useState<StepWithHash[]>([]);
  const [leafHash, setLeafHash] = useState<`0x${string}` | null>(null);
  const [computedRoot, setComputedRoot] = useState<`0x${string}` | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate proof whenever selectedFrame changes
  useEffect(() => {
    if (!selectedFrame || frames.length === 0) {
      setProof(null);
      setStepsWithHashes([]);
      setLeafHash(null);
      setComputedRoot(null);
      setVerifySuccess(null);
      return;
    }

    let isMounted = true;

    async function compute() {
      if (!selectedFrame) return;
      try {
        const p = await generateMerkleProof(frames, selectedFrame.index);
        const lHash = await computeLeafHash(selectedFrame);
        const lHex = bytesToHex(lHash);

        // Compute running authentic hashes if originalFrames is provided for divergence comparison
        const authenticRunningHashes: string[] = [];
        if (originalFrames && originalFrames.length === frames.length) {
          const authFrame = originalFrames[selectedFrame.index];
          if (authFrame) {
            const authP = await generateMerkleProof(originalFrames, selectedFrame.index);
            let curAuth = await computeLeafHash(authFrame);
            for (let i = 0; i < authP.steps.length; i++) {
              const step = authP.steps[i];
              const sib = hexToBytes(step.siblingHash);
              if (step.side === "left") {
                curAuth = await computeNodeHash(sib, curAuth);
              } else {
                curAuth = await computeNodeHash(curAuth, sib);
              }
              authenticRunningHashes.push(bytesToHex(curAuth).toLowerCase());
            }
          }
        }

        // Compute running hashes at each step for current tree
        let current = lHash;
        const detailedSteps: StepWithHash[] = [];
        let firstDivergenceFound = false;

        for (let i = 0; i < p.steps.length; i++) {
          const step = p.steps[i];
          const sibling = hexToBytes(step.siblingHash);
          if (step.side === "left") {
            current = await computeNodeHash(sibling, current);
          } else {
            current = await computeNodeHash(current, sibling);
          }
          const resHex = bytesToHex(current);
          let isDivergent = false;

          if (authenticRunningHashes[i]) {
            if (resHex.toLowerCase() !== authenticRunningHashes[i] && !firstDivergenceFound) {
              isDivergent = true;
              firstDivergenceFound = true;
            }
          } else if (isTampered && i === 0 && !firstDivergenceFound) {
            isDivergent = true;
            firstDivergenceFound = true;
          }

          detailedSteps.push({
            level: i + 1,
            siblingHash: step.siblingHash,
            side: step.side,
            resultingHash: resHex,
            isDivergent,
          });
        }

        const rootHex = bytesToHex(current);

        if (isMounted) {
          setProof(p);
          setLeafHash(lHex);
          setStepsWithHashes(detailedSteps);
          setComputedRoot(rootHex);
          if (expectedRoot) {
            setVerifySuccess(rootHex.toLowerCase() === expectedRoot.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Merkle proof generation error:", err);
      }
    }

    compute();
    return () => {
      isMounted = false;
    };
  }, [selectedFrame, frames, originalFrames, expectedRoot, isTampered]);

  const handleVerify = async () => {
    if (!proof || !leafHash || !expectedRoot) return;
    setIsVerifying(true);
    const t0 = performance.now();
    try {
      const ok = await verifyMerkleProof(leafHash, proof.steps, expectedRoot);
      const elapsed = Math.round(performance.now() - t0);
      setVerifySuccess(ok);
      if (ok) {
        toast.success(`Merkle proof verified in ${elapsed}ms against on-chain root.`);
      } else {
        toast.error(`Merkle proof verification failed in ${elapsed}ms: root mismatch.`);
      }
    } catch (err) {
      toast.error(`Verification error: ${(err as Error).message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyProof = () => {
    if (!proof) return;
    navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
    setCopied(true);
    toast.info("Merkle proof JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedFrame) {
    return (
      <div className="p-6 text-center bg-zinc-950 rounded-xl space-y-3 font-mono text-xs">
        <div className="text-zinc-400">
          Select any frame to inspect its on-chain Merkle inclusion proof.
        </div>
        {frames.length > 0 && onSelectFrame && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-zinc-600 text-[11px] mr-1">Quick Select:</span>
            {frames.slice(0, 6).map((f) => (
              <button
                key={f.index}
                onClick={() => onSelectFrame(f.index)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] transition-colors"
              >
                Frame #{f.index}
              </button>
            ))}
            {frames.length > 6 && (
              <span className="text-zinc-600 text-[10px]">+{frames.length - 6} more</span>
            )}
          </div>
        )}
      </div>
    );
  }

  const { frameBytes } = buildLeafPreimage(selectedFrame);

  return (
    <div className="space-y-4 bg-zinc-950 p-5 rounded-xl text-xs font-mono text-zinc-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          <span className="font-semibold text-zinc-100">
            Merkle Inclusion Proof — Frame #{selectedFrame.index}
          </span>
          {onSelectFrame && frames.length > 1 && (
            <select
              value={selectedFrame.index}
              onChange={(e) => onSelectFrame(Number(e.target.value))}
              aria-label="Select frame"
              className="bg-zinc-900 text-zinc-300 rounded px-2 py-0.5 text-[11px] outline-none cursor-pointer"
            >
              {frames.map((f) => (
                <option key={f.index} value={f.index}>
                  Frame #{f.index}
                </option>
              ))}
            </select>
          )}
          {isTampered && (
            <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-sans uppercase">
              Tampered Divergence
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyProof}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Proof</span>
          </button>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded transition-colors disabled:opacity-50"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isVerifying ? "Verifying..." : "Verify Proof (WebCrypto)"}</span>
          </button>
        </div>
      </div>

      {/* Leaf Hash Derivation */}
      <div className="space-y-2 bg-zinc-900/60 p-3 rounded">
        <div className="text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider">
          Leaf Hash Derivation (Preimage Schema)
        </div>
        <div className="text-xs text-zinc-400 leading-relaxed break-all">
          <span className="text-emerald-400">leaf</span> = SHA-256(
          <span className="text-amber-400">0x00</span> ||{" "}
          <span className="text-sky-400">uint64_be({selectedFrame.tsMs})</span> ||{" "}
          <span className="text-purple-400">uint32_be({frameBytes.length})</span> ||{" "}
          <span className="text-zinc-300">frameBytes[{frameBytes.length}]</span>)
        </div>
        <div className="text-xs flex items-center gap-2">
          <span className="text-zinc-500">Computed Leaf Hash:</span>
          <span className="text-zinc-200 font-semibold">{leafHash || "--"}</span>
        </div>
      </div>

      {/* Proof Steps Table */}
      <div className="space-y-2">
        <div className="text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider">
          Authentication Path ({stepsWithHashes.length} levels)
        </div>

        <div className="overflow-x-auto bg-zinc-900/30 rounded p-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-zinc-500 pb-1">
                <th className="py-1 px-2 font-normal">Level</th>
                <th className="py-1 px-2 font-normal">Sibling Position</th>
                <th className="py-1 px-2 font-normal">Sibling Hash</th>
                <th className="py-1 px-2 font-normal">Resulting Parent Hash</th>
              </tr>
            </thead>
            <tbody>
              {stepsWithHashes.map((s) => (
                <tr
                  key={s.level}
                  className={s.isDivergent ? "bg-red-950/40 text-red-300 rounded" : ""}
                >
                  <td className="py-2 px-2 text-zinc-400">L{s.level}</td>
                  <td className="py-2 px-2 uppercase text-zinc-300">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px]">
                      {s.side}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-zinc-400 truncate max-w-[200px]" title={s.siblingHash}>
                    {s.siblingHash.slice(0, 14)}...{s.siblingHash.slice(-8)}
                  </td>
                  <td className="py-2 px-2 text-zinc-200 truncate max-w-[200px]" title={s.resultingHash}>
                    {s.resultingHash.slice(0, 14)}...{s.resultingHash.slice(-8)}
                    {s.isDivergent && (
                      <span className="ml-2 text-[10px] text-red-400 font-sans uppercase font-semibold">
                        [First Divergence Point]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final Comparison */}
      <div className="pt-3 flex items-center justify-between text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Calculated Root:</span>
            <span className="text-zinc-200">{computedRoot || "--"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Expected Root:</span>
            <span className="text-zinc-200">{expectedRoot || "--"}</span>
          </div>
        </div>

        <div>
          {verifySuccess === true && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold px-2.5 py-1 rounded bg-emerald-950/50">
              <ShieldCheck className="w-4 h-4" />
              <span>PROOF VALID (MATCHES ROOT)</span>
            </div>
          )}
          {verifySuccess === false && (
            <div className="flex items-center gap-1.5 text-red-400 font-semibold px-2.5 py-1 rounded bg-red-950/50">
              <ShieldAlert className="w-4 h-4" />
              <span>PROOF FAILED (ROOT MISMATCH)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
