/**
 * Build Telemetry Evidence Bundle from SatNOGS Observation
 * 
 * Usage:
 *   npx tsx scripts/replay/build-bundle.ts <observationId> [--requested-bytes N]
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { canonicalizeJson } from "../../src/lib/replay/canonical";
import { computeBundleHash } from "../../src/lib/replay/hashing";
import { buildMerkleTree } from "../../src/lib/replay/merkle";
import { computeScoring } from "../../src/lib/replay/scoring";
import { verifyPassGeometry } from "../../src/lib/replay/geometry";
import type {
  EvidenceBundle,
  BundleSummary,
  TelemetryFrame,
} from "../../src/lib/replay/types";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx scripts/replay/build-bundle.ts <observationId> [--requested-bytes N]");
    process.exit(1);
  }

  const observationId = parseInt(args[0], 10);
  if (Number.isNaN(observationId)) {
    console.error("Invalid observationId:", args[0]);
    process.exit(1);
  }

  let requestedDataBytes = 25000;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--requested-bytes" && args[i + 1]) {
      requestedDataBytes = parseInt(args[i + 1], 10);
      i++;
    }
  }

  console.log(`[BUILD] Fetching SatNOGS observation ${observationId}...`);
  const obsUrl = `https://network.satnogs.org/api/observations/${observationId}/`;
  const obsResp = await fetch(obsUrl, { headers: { Accept: "application/json" } });

  if (!obsResp.ok) {
    throw new Error(`Failed to fetch observation ${observationId}: HTTP ${obsResp.status}`);
  }

  const obsData = await obsResp.json();
  const stationId = obsData.ground_station;

  console.log(`[BUILD] Fetching station ${stationId} details...`);
  const stationUrl = `https://network.satnogs.org/api/stations/${stationId}/`;
  const stationResp = await fetch(stationUrl, { headers: { Accept: "application/json" } });
  if (!stationResp.ok) {
    throw new Error(`Failed to fetch station ${stationId}: HTTP ${stationResp.status}`);
  }
  const stationData = await stationResp.json();

  // Parse timestamps
  const startMs = Math.round(new Date(obsData.start).getTime());
  const endMs = Math.round(new Date(obsData.end).getTime());
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    throw new Error(`Invalid pass observation timing: start=${obsData.start}, end=${obsData.end}`);
  }

  // Parse station coordinates to micro-degrees and altitude in meters
  const stationLatMicroDeg = Math.round(parseFloat(stationData.lat) * 1_000_000);
  const stationLonMicroDeg = Math.round(parseFloat(stationData.lng) * 1_000_000);
  const stationAltM = Math.round(parseFloat(stationData.altitude || "0"));

  // Parse TLE
  const tle1 = obsData.tle1?.trim();
  const tle2 = obsData.tle2?.trim();
  if (!tle1 || !tle2) {
    throw new Error("Observation is missing required TLE lines (tle1, tle2).");
  }

  // Determine TLE epoch
  const epochYear2Digits = parseInt(tle1.substring(18, 20), 10);
  const fullYear = epochYear2Digits < 57 ? 2000 + epochYear2Digits : 1900 + epochYear2Digits;
  const epochDayFraction = parseFloat(tle1.substring(20, 32));
  const epochDate = new Date(Date.UTC(fullYear, 0, 1));
  epochDate.setUTCDate(epochDate.getUTCDate() + (epochDayFraction - 1));
  const epochMs = Math.round(epochDate.getTime());

  // Parse frames
  const demodList = obsData.demoddata || [];
  console.log(`[BUILD] Observation has ${demodList.length} demodulated data entries.`);

  const rawFrames: TelemetryFrame[] = [];

  for (let i = 0; i < demodList.length; i++) {
    const entry = demodList[i];
    let hex = "";
    let tsMs = 0;

    if (entry.payload_demod) {
      hex = entry.payload_demod.toLowerCase().trim();
    }
    if (entry.timestamp) {
      tsMs = Math.round(new Date(entry.timestamp).getTime());
    }

    if (!hex || Number.isNaN(tsMs) || tsMs === 0) {
      throw new Error(`Unreliable frame metadata at index ${i}: timestamp=${entry.timestamp}, hex length=${hex.length}`);
    }

    rawFrames.push({
      index: i,
      tsMs,
      hex,
    });
  }

  // Sort frames by tsMs, then index
  rawFrames.sort((a, b) => {
    if (a.tsMs !== b.tsMs) return a.tsMs - b.tsMs;
    return a.index - b.index;
  });

  // Re-index frames sequentially
  const frames: TelemetryFrame[] = rawFrames.map((f, idx) => ({
    index: idx,
    tsMs: f.tsMs,
    hex: f.hex,
  }));

  const bundle: EvidenceBundle = {
    schemaVersion: 1,
    bundleId: `satnogs-obs-${observationId}`,
    source: {
      network: "satnogs",
      observationId,
      stationId,
      stationName: stationData.name || `SatNOGS Station #${stationId}`,
      stationLatMicroDeg,
      stationLonMicroDeg,
      stationAltM,
      noradId: obsData.norad_cat_id,
      satelliteName: obsData.vetted_satellite_name || `NORAD-${obsData.norad_cat_id}`,
      observationUrl: `https://network.satnogs.org/observations/${observationId}/`,
      dbUrl: `https://db.satnogs.org/satellite/${obsData.norad_cat_id}/`,
      license: "CC BY-SA 4.0",
      attribution: "Data provided by the SatNOGS Network (Libre Space Foundation). Distributed under CC BY-SA 4.0.",
      fetchedAtMs: Math.round(Date.now()),
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
      aosMs: startMs,
      losMs: endMs,
      reportedMaxElevationCentiDeg: null,
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
      bookingId: `0x${Buffer.from(`BKG-${observationId}`).toString("hex").padEnd(64, "0")}` as `0x${string}`,
      requestedDataBytes,
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
        url: `https://network.satnogs.org/stations/${stationId}/`,
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

  // Run validation and checks
  console.log(`[BUILD] Validating canonicalisation and computing hashes...`);
  canonicalizeJson(bundle); // throws on float
  const bundleHash = await computeBundleHash(bundle);
  const tree = await buildMerkleTree(bundle.frames);
  const merkleRoot = tree.rootHex;

  const geom = verifyPassGeometry(bundle);
  const scoring = computeScoring(bundle, geom.predictedDurationMs);

  console.log(`[BUILD] Computed bundleHash: ${bundleHash}`);
  console.log(`[BUILD] Computed merkleRoot: ${merkleRoot}`);
  console.log(`[BUILD] Settlement Score D: ${scoring.dBps} bps (${scoring.tier})`);
  console.log(`[BUILD] Geometry: overlap=${geom.passIntervalOverlaps}, framesValid=${geom.framesWithinInterval}, maxEl=${(geom.computedMaxElevationCentiDeg / 100).toFixed(1)} deg`);

  // Write files
  const outDir = path.resolve(process.cwd(), `public/replay/${observationId}`);
  await fs.mkdir(outDir, { recursive: true });

  const bundlePath = path.join(outDir, "bundle.json");
  await fs.writeFile(bundlePath, JSON.stringify(bundle, null, 2), "utf-8");
  console.log(`[BUILD] Wrote ${bundlePath}`);

  let totalBytes = 0;
  for (const f of bundle.frames) {
    totalBytes += f.hex.length / 2;
  }

  const summary: BundleSummary = {
    bundleId: bundle.bundleId,
    observationId,
    satelliteName: bundle.source.satelliteName,
    noradId: bundle.source.noradId,
    stationName: bundle.source.stationName,
    stationId,
    frameCount: bundle.frames.length,
    totalBytes,
    bundleHash,
    merkleRoot,
    dBps: scoring.dBps,
    tier: scoring.tier,
    computedAt: new Date().toISOString(),
  };

  const summaryPath = path.join(outDir, "summary.json");
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
  console.log(`[BUILD] Wrote ${summaryPath}`);

  console.log(`\n--- ATTRIBUTION & LICENSE ---`);
  console.log(bundle.source.attribution);
  console.log(`License: ${bundle.source.license}`);
}

main().catch((err) => {
  console.error("[ERROR]", err);
  process.exit(1);
});
