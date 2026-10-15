import { describe, it, expect } from "vitest";
import { computeScoring } from "../scoring";
import type { EvidenceBundle } from "../types";

describe("Deterministic Scoring Engine (Profile public-v1)", () => {
  const baseBundle: EvidenceBundle = {
    schemaVersion: 1,
    bundleId: "scoring-test",
    source: {
      network: "satnogs",
      observationId: 1001,
      stationId: 1,
      stationName: "Test GS",
      stationLatMicroDeg: 0,
      stationLonMicroDeg: 0,
      stationAltM: 0,
      noradId: 10001,
      satelliteName: "TestSat",
      observationUrl: "https://example.com/obs/1001",
      dbUrl: "https://example.com/sat/10001",
      license: "CC BY-SA 4.0",
      attribution: "Test Attribution",
      fetchedAtMs: 1700000000000,
    },
    tle: { line1: "", line2: "", epochMs: 1700000000000, sourceNote: "" },
    pass: {
      startMs: 1700000000000,
      endMs: 1700000600000,
      aosMs: 1700000000000,
      losMs: 1700000600000,
      reportedMaxElevationCentiDeg: null,
    },
    frames: [],
    series: { snr: null },
    scoring: {
      profile: "public-v1",
      version: 1,
      weightsBps: {
        contactCoverage: 4000,
        dataVolume: 3000,
        frameContinuity: 3000,
      },
      thresholds: {
        minElevationCentiDeg: 1000,
        maxGapMs: 30000, // 30s
      },
    },
    booking: {
      bookingId: "0x1111111111111111111111111111111111111111111111111111111111111111",
      requestedDataBytes: 1000,
      requestedWindowStartMs: 1700000000000,
      requestedWindowEndMs: 1700000600000,
      provenance: "simulated",
    },
    provenance: {},
  };

  function makeUniformFrames(startMs: number, endMs: number, totalBytes: number, stepMs = 20000) {
    const frames = [];
    let current = startMs;
    let idx = 0;
    while (current < endMs) {
      frames.push({
        index: idx++,
        tsMs: current,
        hex: "00".repeat(20),
      });
      current += stepMs;
    }
    frames.push({
      index: idx,
      tsMs: endMs,
      hex: "00".repeat(20),
    });
    // Adjust total byte count to match requested
    const currentBytes = frames.length * 20;
    const diff = totalBytes - currentBytes;
    if (diff > 0) {
      frames[0].hex += "00".repeat(diff);
    }
    return frames;
  }

  it("returns FULL_RELEASE for D_bps >= 9500", () => {
    // 600s duration, frames span 600s, 1000 bytes, 0 gaps > 30s
    const frames = makeUniformFrames(1700000000000, 1700000600000, 1000, 20000);
    const bundle = { ...baseBundle, frames };
    const res = computeScoring(bundle, 600000);

    expect(res.contactCoverageBps).toBe(10000);
    expect(res.dataVolumeBps).toBe(10000);
    expect(res.frameContinuityBps).toBe(10000);
    expect(res.dBps).toBe(10000);
    expect(res.tier).toBe("FULL_RELEASE");
    expect(res.operatorShareBps).toBe(10000);
    expect(res.buyerRefundBps).toBe(0);
  });

  it("handles boundary case at 9500 bps (exact FULL_RELEASE threshold)", () => {
    // We want weighted sum = 9500 bps
    // If weights: 4000 (coverage), 3000 (volume), 3000 (continuity)
    // If continuity = 10000, volume = 10000 -> 3000 + 3000 = 6000
    // We need 4000 * coverage / 10000 = 3500 -> coverage = 8750 bps (525s / 600s)
    const frames = makeUniformFrames(1700000000000, 1700000525000, 1000, 20000);
    const bundle = { ...baseBundle, frames };
    const res = computeScoring(bundle, 600000);

    expect(res.contactCoverageBps).toBe(8750);
    expect(res.frameContinuityBps).toBe(10000);
    expect(res.dBps).toBe(9500);
    expect(res.tier).toBe("FULL_RELEASE");
    expect(res.operatorShareBps).toBe(10000);
    expect(res.buyerRefundBps).toBe(0);
  });

  it("handles boundary case at 9499 bps (PRO_RATA tier)", () => {
    // 524880 ms => 8748 bps coverage
    const frames = makeUniformFrames(1700000000000, 1700000524880, 1000, 20000);
    const bundle = { ...baseBundle, frames };
    const res = computeScoring(bundle, 600000);

    expect(res.contactCoverageBps).toBe(8748);
    expect(res.frameContinuityBps).toBe(10000);
    expect(res.dBps).toBe(9499);
    expect(res.tier).toBe("PRO_RATA");
    expect(res.operatorShareBps).toBe(9499);
    expect(res.buyerRefundBps).toBe(501);
  });

  it("handles boundary case at 7000 bps (PRO_RATA tier minimum)", () => {
    // coverage = 2500 bps: 2500 * 600000 / 10000 = 150000 ms
    const frames = makeUniformFrames(1700000000000, 1700000150000, 1000, 20000);
    const bundle = { ...baseBundle, frames };
    const res = computeScoring(bundle, 600000);

    expect(res.contactCoverageBps).toBe(2500);
    expect(res.frameContinuityBps).toBe(10000);
    expect(res.dBps).toBe(7000);
    expect(res.tier).toBe("PRO_RATA");
    expect(res.operatorShareBps).toBe(7000);
    expect(res.buyerRefundBps).toBe(3000);
  });

  it("handles boundary case at 6999 bps (FULL_REFUND tier)", () => {
    // 149880 ms => 2498 bps coverage
    const frames = makeUniformFrames(1700000000000, 1700000149880, 1000, 20000);
    const bundle = { ...baseBundle, frames };
    const res = computeScoring(bundle, 600000);

    expect(res.contactCoverageBps).toBe(2498);
    expect(res.frameContinuityBps).toBe(10000);
    expect(res.dBps).toBe(6999);
    expect(res.tier).toBe("FULL_REFUND");
    expect(res.operatorShareBps).toBe(0);
    expect(res.buyerRefundBps).toBe(10000);
  });

  it("evaluates heavy gaps exceeding threshold properly", () => {
    // Gap threshold is 30s (30,000ms).
    // Let frame 0 be at 0s, frame 1 at 200s (gap = 200s > 30s), frame 2 at 205s (gap = 5s <= 30s)
    // Observed span = 205,000 ms
    // Total gap duration = 200,000 ms
    // Gap share = floor(200000 * 10000 / 205000) = 9756 bps
    // Continuity = 10000 - 9756 = 244 bps
    const frames = [
      { index: 0, tsMs: 1700000000000, hex: "00".repeat(500) },
      { index: 1, tsMs: 1700000200000, hex: "00".repeat(300) },
      { index: 2, tsMs: 1700000205000, hex: "00".repeat(200) },
    ];
    const bundle = { ...baseBundle, frames };
    const res = computeScoring(bundle, 600000);

    expect(res.arithmetic.gapDurationMs).toBe(200000);
    expect(res.frameContinuityBps).toBe(244);
    expect(res.dBps).toBeLessThan(7000);
    expect(res.tier).toBe("FULL_REFUND");
  });

  it("handles zero frames safely without throwing", () => {
    const bundle = { ...baseBundle, frames: [] };
    const res = computeScoring(bundle, 600000);

    expect(res.dBps).toBe(0);
    expect(res.tier).toBe("FULL_REFUND");
    expect(res.operatorShareBps).toBe(0);
    expect(res.buyerRefundBps).toBe(10000);
  });
});
