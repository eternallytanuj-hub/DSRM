/**
 * Telemetry Scoring Engine - Profile "public-v1"
 * Strictly uses deterministic integer arithmetic (no floating point calculations).
 * Evaluates contactCoverage, dataVolume, and frameContinuity against Schedule B tiers.
 */

import { hexToBytes } from "./hashing";
import type { EvidenceBundle, ScoringResult } from "./types";

/**
 * Computes deterministic score D_bps for an evidence bundle and predicted pass duration.
 * 
 * @param bundle The evidence bundle
 * @param predictedDurationMs Pass duration in milliseconds above elevation threshold
 */
export function computeScoring(
  bundle: EvidenceBundle,
  predictedDurationMs: number
): ScoringResult {
  const { frames, scoring, booking } = bundle;
  const weights = scoring.weightsBps;
  const thresholds = scoring.thresholds;

  if (frames.length === 0) {
    return {
      profile: scoring.profile,
      version: scoring.version,
      contactCoverageBps: 0,
      dataVolumeBps: 0,
      frameContinuityBps: 0,
      dBps: 0,
      tier: "FULL_REFUND",
      operatorShareBps: 0,
      buyerRefundBps: 10000,
      arithmetic: {
        observedSpanMs: 0,
        predictedDurationMs,
        totalFrameBytes: 0,
        requestedDataBytes: booking.requestedDataBytes,
        gapDurationMs: 0,
        gapShareBps: 0,
        weights,
        computation: "No frames received. Score = 0 bps.",
      },
    };
  }

  // 1. Observed Span
  const firstFrameTs = BigInt(frames[0].tsMs);
  const lastFrameTs = BigInt(frames[frames.length - 1].tsMs);
  const observedSpanBig = lastFrameTs >= firstFrameTs ? lastFrameTs - firstFrameTs : BigInt(0);
  const observedSpanMs = Number(observedSpanBig);

  // 2. Contact Coverage Score (Weight 4000 bps)
  const predictedDurationBig = BigInt(Math.max(0, predictedDurationMs));
  let contactCoverageBig = BigInt(0);
  if (predictedDurationBig > BigInt(0)) {
    const rawCoverage = (observedSpanBig * BigInt(10000)) / predictedDurationBig;
    contactCoverageBig = rawCoverage > BigInt(10000) ? BigInt(10000) : rawCoverage;
  }
  const contactCoverageBps = Number(contactCoverageBig);

  // 3. Data Volume Score (Weight 3000 bps)
  let totalBytesCount = 0;
  for (const frame of frames) {
    const b = hexToBytes(frame.hex);
    totalBytesCount += b.length;
  }
  const totalFrameBytesBig = BigInt(totalBytesCount);
  const requestedDataBytesBig = BigInt(Math.max(1, booking.requestedDataBytes));
  const rawVolume = (totalFrameBytesBig * BigInt(10000)) / requestedDataBytesBig;
  const dataVolumeBig = rawVolume > BigInt(10000) ? BigInt(10000) : rawVolume;
  const dataVolumeBps = Number(dataVolumeBig);

  // 4. Frame Continuity Score (Weight 3000 bps)
  const maxGapMsBig = BigInt(thresholds.maxGapMs);
  let gapDurationBig = BigInt(0);

  for (let i = 0; i < frames.length - 1; i++) {
    const currentTs = BigInt(frames[i].tsMs);
    const nextTs = BigInt(frames[i + 1].tsMs);
    const gap = nextTs - currentTs;
    if (gap > maxGapMsBig) {
      gapDurationBig += gap;
    }
  }

  let gapShareBig = BigInt(0);
  let frameContinuityBig = BigInt(10000);
  if (observedSpanBig > BigInt(0)) {
    gapShareBig = (gapDurationBig * BigInt(10000)) / observedSpanBig;
    if (gapShareBig > BigInt(10000)) gapShareBig = BigInt(10000);
    frameContinuityBig = BigInt(10000) - gapShareBig;
  }
  const frameContinuityBps = Number(frameContinuityBig);

  // 5. Total D_bps calculation
  // D_bps = floor(sum(weight_i * score_i) / 10000)
  const wCoverage = BigInt(weights.contactCoverage);
  const wVolume = BigInt(weights.dataVolume);
  const wContinuity = BigInt(weights.frameContinuity);

  const weightedSum =
    contactCoverageBig * wCoverage +
    dataVolumeBig * wVolume +
    frameContinuityBig * wContinuity;

  const totalWeights = wCoverage + wVolume + wContinuity;
  const dBpsBig = totalWeights > BigInt(0) ? weightedSum / totalWeights : BigInt(0);
  const dBps = Number(dBpsBig);

  // 6. Schedule B Settlement Tiers
  let tier: "FULL_RELEASE" | "PRO_RATA" | "FULL_REFUND";
  let operatorShareBps: number;
  let buyerRefundBps: number;

  if (dBps >= 9500) {
    tier = "FULL_RELEASE";
    operatorShareBps = 10000;
    buyerRefundBps = 0;
  } else if (dBps >= 7000) {
    tier = "PRO_RATA";
    operatorShareBps = dBps;
    buyerRefundBps = 10000 - dBps;
  } else {
    tier = "FULL_REFUND";
    operatorShareBps = 0;
    buyerRefundBps = 10000;
  }

  const computation = [
    `Contact Coverage: floor(${observedSpanMs} ms * 10000 / ${predictedDurationMs} ms) = ${contactCoverageBps} bps (weight ${weights.contactCoverage} bps)`,
    `Data Volume: floor(${totalBytesCount} bytes * 10000 / ${booking.requestedDataBytes} bytes) = ${dataVolumeBps} bps (weight ${weights.dataVolume} bps)`,
    `Frame Continuity: 10000 - floor(${Number(gapDurationBig)} ms * 10000 / ${observedSpanMs} ms) = ${frameContinuityBps} bps (weight ${weights.frameContinuity} bps)`,
    `D_bps = floor((${contactCoverageBps} * ${weights.contactCoverage} + ${dataVolumeBps} * ${weights.dataVolume} + ${frameContinuityBps} * ${weights.frameContinuity}) / 10000) = ${dBps} bps`,
    `Settlement Tier: ${tier} (Operator ${operatorShareBps / 100}%, Buyer Refund ${buyerRefundBps / 100}%)`,
  ].join("\n");

  return {
    profile: scoring.profile,
    version: scoring.version,
    contactCoverageBps,
    dataVolumeBps,
    frameContinuityBps,
    dBps,
    tier,
    operatorShareBps,
    buyerRefundBps,
    arithmetic: {
      observedSpanMs,
      predictedDurationMs,
      totalFrameBytes: totalBytesCount,
      requestedDataBytes: booking.requestedDataBytes,
      gapDurationMs: Number(gapDurationBig),
      gapShareBps: Number(gapShareBig),
      weights,
      computation,
    },
  };
}
