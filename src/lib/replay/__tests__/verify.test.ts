import { describe, it, expect } from "vitest";
import { runVerification } from "../verify";
import type { EvidenceBundle } from "../types";

describe("Verification Runner Pipeline", () => {
  const mockBundle: EvidenceBundle = {
    schemaVersion: 1,
    bundleId: "satnogs-obs-11726893",
    source: {
      network: "satnogs",
      observationId: 11726893,
      stationId: 1428,
      stationName: "SatNOGS Ground Station #1428",
      stationLatMicroDeg: 37983810,
      stationLonMicroDeg: 23727539,
      stationAltM: 120,
      noradId: 43017,
      satelliteName: "AO-91",
      observationUrl: "https://example.com/obs/11726893",
      dbUrl: "https://example.com/sat/43017",
      license: "CC BY-SA 4.0",
      attribution: "SatNOGS Network",
      fetchedAtMs: 1716153000000,
    },
    tle: {
      line1: "1 43017U 17073E   24140.45678912  .00000854  00000-0  85412-4 0  9993",
      line2: "2 43017  97.7412 215.3412 0245123 180.1234 179.8765 14.81234567345678",
      epochMs: 1716116267000,
      sourceNote: "SatNOGS TLE",
    },
    pass: {
      startMs: 1716151500000,
      endMs: 1716152280000,
      aosMs: 1716151616000,
      losMs: 1716152213000,
      reportedMaxElevationCentiDeg: 5644,
    },
    frames: [
      { index: 0, tsMs: 1716151630000, hex: "2e31000102030405" },
      { index: 1, tsMs: 1716151700000, hex: "2e31000102030406" },
      { index: 2, tsMs: 1716152190000, hex: "2e31000102030407" },
    ],
    series: { snr: null },
    scoring: {
      profile: "public-v1",
      version: 1,
      weightsBps: { contactCoverage: 4000, dataVolume: 3000, frameContinuity: 3000 },
      thresholds: { minElevationCentiDeg: 1000, maxGapMs: 30000 },
    },
    booking: {
      bookingId: "0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7",
      requestedDataBytes: 50,
      requestedWindowStartMs: 1716151500000,
      requestedWindowEndMs: 1716152280000,
      provenance: "simulated",
    },
    provenance: {},
  };

  it("yields status 'unconfigured' when NEXT_PUBLIC_ATTESTATION_REGISTRY is not set (never pass)", async () => {
    const res = await runVerification({
      bundle: mockBundle,
      registryAddress: undefined,
    });

    expect(res.steps.chain_attestation.status).toBe("unconfigured");
    expect(res.steps.hash_comparison.status).toBe("blocked");
    expect(res.steps.signatures.status).toBe("blocked");
    expect(res.verdict.status).toBe("unconfigured");
    expect(res.verdict.title).toMatch(/registry unconfigured/);
  });

  it("records elapsed milliseconds and expected/actual on real computed steps", async () => {
    const res = await runVerification({
      bundle: mockBundle,
    });

    expect(res.steps.fetch_bundle.elapsedMs).toBeDefined();
    expect(res.steps.bundle_hash.elapsedMs).toBeDefined();
    expect(res.steps.bundle_hash.expected).toBeDefined();
    expect(res.steps.bundle_hash.actual).toBeDefined();
    expect(res.steps.recompute_score.status).toBe("pass");
    expect(res.steps.geometry.status).toBe("pass");
  });

  it("blocks subsequent dependent steps if bundle fetch fails", async () => {
    const res = await runVerification({
      customFetchBundle: async () => {
        throw new Error("Simulated network timeout connecting to IPFS gateway");
      },
    });

    expect(res.steps.fetch_bundle.status).toBe("fail");
    expect(res.steps.fetch_bundle.error).toMatch(/Simulated network timeout/);
    expect(res.steps.bundle_hash.status).toBe("blocked");
    expect(res.steps.chain_attestation.status).toBe("blocked");
    expect(res.steps.hash_comparison.status).toBe("blocked");
    expect(res.steps.signatures.status).toBe("blocked");
    expect(res.steps.recompute_score.status).toBe("blocked");
    expect(res.steps.geometry.status).toBe("blocked");
    expect(res.verdict.status).toBe("fail");
  });

  it("asserts that a mismatched hash yields fail", async () => {
    const mockOnChainAttestation = {
      bookingId: mockBundle.booking.bookingId,
      bundleHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`, // Mismatched hash
      merkleRoot: "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      dBps: 10000,
      scoringVersion: 1,
      cidHash: "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`,
      cid: "bafybeigtest",
      submittedAt: 1716154000,
      signers: ["0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A" as `0x${string}`],
    };

    const initialRes = await runVerification({ bundle: mockBundle });
    const resWithChain = await runVerification({
      bundle: mockBundle,
      existingState: {
        ...initialRes,
        onChainAttestation: mockOnChainAttestation,
      },
      onlyStepId: "hash_comparison",
    });

    expect(resWithChain.steps.hash_comparison.status).toBe("fail");
    expect(resWithChain.steps.hash_comparison.actual).toMatch(/Tamper detected/);
    expect(resWithChain.steps.hash_comparison.detail).toMatch(/bundleHash: MISMATCH/);
  });

  it("supports single-step re-run via onlyStepId", async () => {
    const fullRes = await runVerification({ bundle: mockBundle });
    expect(fullRes.steps.recompute_score.status).toBe("pass");

    const singleStepRes = await runVerification({
      bundle: mockBundle,
      existingState: fullRes,
      onlyStepId: "recompute_score",
    });

    expect(singleStepRes.steps.recompute_score.status).toBe("pass");
    expect(singleStepRes.steps.recompute_score.elapsedMs).toBeDefined();
  });
});
