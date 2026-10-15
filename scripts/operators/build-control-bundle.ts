/**
 * Generates an Evidence Bundle for an Operator Control Proof Challenge.
 * Embeds the on-chain derived challenge nonce into telemetry frames,
 * enforces timestamp bounds within challenge window, builds Merkle tree,
 * and outputs deterministic bundle JSON.
 * 
 * Usage:
 *   npx tsx scripts/operators/build-control-bundle.ts <challengeId> [noradId] [nonceHex]
 */

import { keccak256, stringToBytes } from "viem";
import { computeBundleHash } from "../../src/lib/replay/hashing";
import { buildMerkleTree } from "../../src/lib/replay/merkle";
import type { EvidenceBundle } from "../../src/lib/replay/types";
import * as fs from "node:fs/promises";
import * as path from "node:path";

async function main() {
  const args = process.argv.slice(2);
  const challengeId = (args[0] || keccak256(stringToBytes("CHALLENGE-001"))) as `0x${string}`;
  const noradId = Number(args[1] || 43017);
  const nonceHex = args[2] || keccak256(stringToBytes(`NONCE-FOR-${challengeId}`)).slice(2);

  console.log(`[BUILD-CONTROL-BUNDLE] Challenge ID: ${challengeId}`);
  console.log(`[BUILD-CONTROL-BUNDLE] Satellite NORAD ID: ${noradId}`);
  console.log(`[BUILD-CONTROL-BUNDLE] Target Nonce (hex): ${nonceHex}`);

  const nowMs = Date.now();
  const openedAtMs = nowMs - 60000;
  const deadlineMs = nowMs + 7 * 24 * 3600 * 1000;

  // Frame with embedded nonce
  const frames = [
    { index: 0, tsMs: nowMs - 30000, hex: `aa112233${nonceHex}ff4455` },
    { index: 1, tsMs: nowMs - 20000, hex: `bb223344${nonceHex.slice(0, 32)}cc5566` },
    { index: 2, tsMs: nowMs - 10000, hex: `cc334455${nonceHex.slice(32)}dd6677` },
  ];

  const bundle: EvidenceBundle = {
    schemaVersion: 1,
    bundleId: `control-bundle-${challengeId.slice(0, 10)}`,
    source: {
      network: "satnogs",
      observationId: 11726893,
      stationId: 1428,
      stationName: "SatNOGS Ground Station #1428",
      stationLatMicroDeg: 37983810,
      stationLonMicroDeg: 23727539,
      stationAltM: 120,
      noradId,
      satelliteName: "AO-91",
      observationUrl: "https://network.satnogs.org/observations/11726893/",
      dbUrl: `https://db.satnogs.org/satellite/${noradId}/`,
      license: "CC BY-SA 4.0",
      attribution: "SatNOGS Network",
      fetchedAtMs: nowMs,
    },
    tle: {
      line1: "1 43017U 17073E   24140.45678912  .00000854  00000-0  85412-4 0  9993",
      line2: "2 43017  97.7412 215.3412 0245123 180.1234 179.8765 14.81234567345678",
      epochMs: nowMs - 86400000,
      sourceNote: "SatNOGS Fresh TLE",
    },
    pass: {
      startMs: nowMs - 45000,
      endMs: nowMs - 5000,
      aosMs: nowMs - 40000,
      losMs: nowMs - 6000,
      reportedMaxElevationCentiDeg: 5400,
    },
    frames,
    series: { snr: null },
    scoring: {
      profile: "public-v1",
      version: 1,
      weightsBps: { contactCoverage: 4000, dataVolume: 3000, frameContinuity: 3000 },
      thresholds: { minElevationCentiDeg: 1000, maxGapMs: 30000 },
    },
    booking: {
      bookingId: challengeId,
      requestedDataBytes: 100,
      requestedWindowStartMs: nowMs - 45000,
      requestedWindowEndMs: nowMs - 5000,
      provenance: "simulated",
    },
    challenge: {
      challengeId,
      nonceHex,
      openedAtMs,
      deadlineMs,
    },
    provenance: {
      controlChallenge: {
        kind: "simulated",
        source: "scripts/operators/build-control-bundle.ts",
      },
    },
  };

  const bundleHash = computeBundleHash(bundle);
  const merkleTree = buildMerkleTree(bundle.frames);

  console.log(`[BUILD-CONTROL-BUNDLE] Bundle Hash: ${bundleHash}`);
  console.log(`[BUILD-CONTROL-BUNDLE] Merkle Root: ${merkleTree.rootHash}`);

  const outDir = path.resolve(process.cwd(), "public/replay/control-proof");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${challengeId}.json`);
  await fs.writeFile(outPath, JSON.stringify(bundle, null, 2), "utf-8");

  console.log(`[BUILD-CONTROL-BUNDLE] Saved bundle to: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
