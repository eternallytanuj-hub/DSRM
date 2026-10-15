import { describe, it, expect } from "vitest";
import { verifyPassGeometry } from "../geometry";
import type { EvidenceBundle } from "../types";

describe("Orbital Pass Geometry & Elevation Check (SGP4)", () => {
  const fixtureBundle: EvidenceBundle = {
    schemaVersion: 1,
    bundleId: "geom-test",
    source: {
      network: "satnogs",
      observationId: 11726893,
      stationId: 1428,
      stationName: "Athens GS",
      stationLatMicroDeg: 37983810, // 37.983810 N
      stationLonMicroDeg: 23727539, // 23.727539 E
      stationAltM: 120,
      noradId: 43017,
      satelliteName: "AO-91",
      observationUrl: "https://example.com",
      dbUrl: "https://example.com",
      license: "CC BY-SA 4.0",
      attribution: "Test",
      fetchedAtMs: 1716153000000,
    },
    tle: {
      line1: "1 43017U 17073E   24140.45678912  .00000854  00000-0  85412-4 0  9993",
      line2: "2 43017  97.7412 215.3412 0245123 180.1234 179.8765 14.81234567345678",
      epochMs: 1716116267000,
      sourceNote: "SatNOGS TLE",
    },
    pass: {
      startMs: 1716151500000, // 20:45:00 UTC
      endMs: 1716152280000,   // 20:58:00 UTC
      aosMs: 1716151616000,   // 20:46:56 UTC
      losMs: 1716152213000,   // 20:56:53 UTC
      reportedMaxElevationCentiDeg: 5644,
    },
    frames: [
      { index: 0, tsMs: 1716151630000, hex: "2e3100" },
      { index: 1, tsMs: 1716151800000, hex: "2e3101" },
      { index: 2, tsMs: 1716152190000, hex: "2e3102" },
    ],
    series: { snr: null },
    scoring: {
      profile: "public-v1",
      version: 1,
      weightsBps: { contactCoverage: 4000, dataVolume: 3000, frameContinuity: 3000 },
      thresholds: { minElevationCentiDeg: 1000, maxGapMs: 30000 },
    },
    booking: {
      bookingId: "0x1111111111111111111111111111111111111111111111111111111111111111",
      requestedDataBytes: 500,
      requestedWindowStartMs: 1716151500000,
      requestedWindowEndMs: 1716152280000,
      provenance: "simulated",
    },
    provenance: {},
  };

  it("verifies that predicted pass interval overlaps the observation window", () => {
    const res = verifyPassGeometry(fixtureBundle);

    expect(res.passIntervalOverlaps).toBe(true);
    expect(res.predictedAosMs).toBeLessThanOrEqual(res.predictedLosMs);
    expect(res.predictedDurationMs).toBeGreaterThan(0);
  });

  it("confirms maximum elevation is computed accurately and matches reported elevation within tolerance", () => {
    const res = verifyPassGeometry(fixtureBundle);

    expect(res.computedMaxElevationCentiDeg).toBeGreaterThan(5000); // > 50 degrees
    expect(res.maxElevationMatch).toBe(true);
    expect(res.elevationDeltaCentiDeg).toBeLessThanOrEqual(1000); // within 10 degrees
  });

  it("verifies all valid frame timestamps lie inside predicted pass window", () => {
    const res = verifyPassGeometry(fixtureBundle);

    expect(res.framesWithinInterval).toBe(true);
    expect(res.outOfWindowFrameCount).toBe(0);
  });

  it("confirms TLE epoch freshness within stated 14-day threshold", () => {
    const res = verifyPassGeometry(fixtureBundle);

    expect(res.tleEpochFresh).toBe(true);
    expect(res.tleAgeDays).toBeLessThan(1.0); // Epoch is within hours of pass
  });

  it("detects 2-hour timestamp shift as a fatal geometry failure (Tamper Mode 2)", () => {
    const shiftMs = 2 * 3600 * 1000;
    const tamperedBundle: EvidenceBundle = {
      ...fixtureBundle,
      pass: {
        ...fixtureBundle.pass,
        startMs: fixtureBundle.pass.startMs + shiftMs,
        endMs: fixtureBundle.pass.endMs + shiftMs,
        aosMs: fixtureBundle.pass.aosMs + shiftMs,
        losMs: fixtureBundle.pass.losMs + shiftMs,
      },
      frames: fixtureBundle.frames.map((f) => ({
        ...f,
        tsMs: f.tsMs + shiftMs,
      })),
    };

    const res = verifyPassGeometry(tamperedBundle);

    // Two hours later, satellite is on the other side of Earth, so pass doesn't overlap or frames fail
    const failed = !res.passIntervalOverlaps || !res.framesWithinInterval || !res.maxElevationMatch;
    expect(failed).toBe(true);
  });

  it("produces valid sampled ground track coordinates for visualization", () => {
    const res = verifyPassGeometry(fixtureBundle);

    expect(res.groundTrack.length).toBeGreaterThan(0);
    const firstPoint = res.groundTrack[0];
    expect(firstPoint.lat).toBeGreaterThanOrEqual(-90);
    expect(firstPoint.lat).toBeLessThanOrEqual(90);
    expect(firstPoint.lon).toBeGreaterThanOrEqual(-180);
    expect(firstPoint.lon).toBeLessThanOrEqual(180);
    expect(firstPoint.altM).toBeGreaterThan(300000); // LEO altitude > 300km
  });
});
