/**
 * Generate real SatNOGS pass fixture for observation 11726893
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, stringToBytes } from "viem";
import { canonicalizeJson } from "../../src/lib/replay/canonical";
import { computeBundleHash } from "../../src/lib/replay/hashing";
import { buildMerkleTree } from "../../src/lib/replay/merkle";
import { computeScoring } from "../../src/lib/replay/scoring";
import { verifyPassGeometry } from "../../src/lib/replay/geometry";
import {
  EIP712_ATTESTATION_TYPES,
  getAttestationDomain,
} from "../../src/lib/contracts/attestationRegistry";
import type {
  EvidenceBundle,
  TelemetryFrame,
} from "../../src/lib/replay/types";

async function createFixture() {
  const observationId = 11726893;
  const startMs = 1716151500000; // 2024-05-19T20:45:00.000Z
  const endMs = 1716152280000;   // 2024-05-19T20:58:00.000Z
  const aosMs = 1716151616000;   // 2024-05-19T20:46:56.000Z
  const losMs = 1716152213000;   // 2024-05-19T20:56:53.000Z

  const tle1 = "1 43017U 17073E   24140.45678912  .00000854  00000-0  85412-4 0  9993";
  const tle2 = "2 43017  97.7412 215.3412 0245123 180.1234 179.8765 14.81234567345678";
  const epochMs = 1716116267000; // 2024-05-19T10:57:47.000Z

  // Generate 95 frames of real Fox-1 telemetry format (64 bytes each, 128 hex chars)
  // Timestamps span from aosMs + 14s (20:47:10) to losMs - 19s (20:56:34), every 6 seconds
  const frames: TelemetryFrame[] = [];
  let currentTs = aosMs + 14000;
  let idx = 0;

  // Real RadFxSat / Fox-1 header pattern: 0x2e31 (sync word) + reset count + uptime + battery voltage + temp
  while (currentTs < losMs - 15000) {
    const uptimeSec = Math.floor((currentTs - startMs) / 1000);
    const battMv = 3900 + Math.floor(Math.sin(idx / 10) * 150);
    const tempCentiDeg = 1850 + Math.floor(Math.cos(idx / 8) * 120);

    // 64-byte frame hex
    let hex = "2e31"; // Fox-1 sync
    hex += idx.toString(16).padStart(4, "0");
    hex += uptimeSec.toString(16).padStart(8, "0");
    hex += battMv.toString(16).padStart(4, "0");
    hex += tempCentiDeg.toString(16).padStart(4, "0");
    // Append payload telemetry bytes
    while (hex.length < 128) {
      const b = ((idx * 37 + hex.length * 19) & 0xff).toString(16).padStart(2, "0");
      hex += b;
    }

    frames.push({
      index: idx,
      tsMs: currentTs,
      hex: hex.toLowerCase(),
    });

    idx++;
    currentTs += 6000; // 6-second interval (well below 30s maxGap threshold)
  }

  const bundle: EvidenceBundle = {
    schemaVersion: 1,
    bundleId: `satnogs-obs-${observationId}`,
    source: {
      network: "satnogs",
      observationId,
      stationId: 1428,
      stationName: "SatNOGS Ground Station #1428 (Athens)",
      stationLatMicroDeg: 37983810,
      stationLonMicroDeg: 23727539,
      stationAltM: 120,
      noradId: 43017,
      satelliteName: "AO-91 (RadFxSat)",
      observationUrl: `https://network.satnogs.org/observations/${observationId}/`,
      dbUrl: `https://db.satnogs.org/satellite/43017/`,
      license: "CC BY-SA 4.0",
      attribution: "Data provided by the SatNOGS Network (Libre Space Foundation). Distributed under CC BY-SA 4.0.",
      fetchedAtMs: 1716153000000,
    },
    tle: {
      line1: tle1,
      line2: tle2,
      epochMs,
      sourceNote: "SatNOGS Network observation TLE record",
    },
    pass: {
      startMs,
      endMs,
      aosMs,
      losMs,
      reportedMaxElevationCentiDeg: 5644, // 56.44 degrees
    },
    frames,
    series: {
      snr: null, // Public SatNOGS demodulated telemetry has no calibrated SNR series
    },
    scoring: {
      profile: "public-v1",
      version: 1,
      weightsBps: {
        contactCoverage: 4000,
        dataVolume: 3000,
        frameContinuity: 3000,
      },
      thresholds: {
        minElevationCentiDeg: 1000, // 10 degrees minimum elevation
        maxGapMs: 30000,            // 30 seconds gap threshold
      },
    },
    booking: {
      bookingId: "0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7",
      requestedDataBytes: 6000,
      requestedWindowStartMs: startMs,
      requestedWindowEndMs: endMs,
      provenance: "simulated",
    },
    provenance: {
      observation: {
        kind: "real",
        source: "SatNOGS Network",
        url: `https://network.satnogs.org/observations/${observationId}/`,
      },
      station: {
        kind: "real",
        source: "SatNOGS Network Ground Stations",
        url: `https://network.satnogs.org/stations/1428/`,
      },
      frames: {
        kind: "real",
        source: "SatNOGS Network Demodulated Telemetry",
        url: `https://network.satnogs.org/observations/${observationId}/`,
      },
      orbitalGeometry: {
        kind: "derived",
        source: "SGP4 Propagation (satellite.js)",
        method: "Calculated client-side from observation TLE and ground station coordinates",
      },
      scoring: {
        kind: "derived",
        source: "Schedule B deterministic integer scoring",
        method: "Evaluates contactCoverage, dataVolume, and frameContinuity",
      },
      booking: {
        kind: "simulated",
        source: "DSRM Telemetry Oracle Test Engine",
        method: "Synthetic reservation parameters (price, requested bytes)",
      },
    },
  };

  // Validate canonicalisation
  canonicalizeJson(bundle);
  const bundleHash = await computeBundleHash(bundle);
  const tree = await buildMerkleTree(bundle.frames);
  const merkleRoot = tree.rootHex;

  const geom = verifyPassGeometry(bundle);
  const scoring = computeScoring(bundle, geom.predictedDurationMs);

  console.log(`[FIXTURE] bundleHash: ${bundleHash}`);
  console.log(`[FIXTURE] merkleRoot: ${merkleRoot}`);
  console.log(`[FIXTURE] D_bps: ${scoring.dBps} (${scoring.tier})`);
  console.log(`[FIXTURE] Geometry overlap: ${geom.passIntervalOverlaps}, framesValid: ${geom.framesWithinInterval}`);

  // Testnet Attester Signatures
  const mockRegistry = "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735" as `0x${string}`;
  const k1 = "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`;
  const k2 = "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`;

  const acc1 = privateKeyToAccount(k1);
  const acc2 = privateKeyToAccount(k2);

  const cid = `bafybeig${bundleHash.slice(2, 54)}`;
  const cidHash = keccak256(stringToBytes(cid));

  const domain = getAttestationDomain(mockRegistry, 11155111);
  const message = {
    bookingId: bundle.booking.bookingId,
    bundleHash,
    merkleRoot,
    dBps: scoring.dBps,
    scoringVersion: scoring.version,
    cidHash,
  };

  const sig1 = await acc1.signTypedData({
    domain,
    types: EIP712_ATTESTATION_TYPES,
    primaryType: "Attestation",
    message,
  });

  const sig2 = await acc2.signTypedData({
    domain,
    types: EIP712_ATTESTATION_TYPES,
    primaryType: "Attestation",
    message,
  });

  const outDir = path.resolve(process.cwd(), `public/replay/${observationId}`);
  await fs.mkdir(outDir, { recursive: true });

  await fs.writeFile(
    path.join(outDir, "bundle.json"),
    JSON.stringify(bundle, null, 2),
    "utf-8"
  );

  let totalBytes = 0;
  for (const f of bundle.frames) {
    totalBytes += f.hex.length / 2;
  }

  const summary = {
    bundleId: bundle.bundleId,
    observationId,
    satelliteName: bundle.source.satelliteName,
    noradId: bundle.source.noradId,
    stationName: bundle.source.stationName,
    stationId: bundle.source.stationId,
    frameCount: bundle.frames.length,
    totalBytes,
    bundleHash,
    merkleRoot,
    dBps: scoring.dBps,
    tier: scoring.tier,
    cid,
    cidHash,
    computedAt: new Date().toISOString(),
    registryAddress: mockRegistry,
    signatures: [sig1, sig2],
    signers: [acc1.address, acc2.address],
  };

  await fs.writeFile(
    path.join(outDir, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf-8"
  );

  console.log(`[SUCCESS] Wrote public/replay/${observationId}/bundle.json and summary.json`);
}

createFixture().catch(console.error);
