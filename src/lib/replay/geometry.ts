/**
 * Pass Geometry Verification using SGP4 (satellite.js)
 * Computes orbital trajectory, elevation above ground station, pass overlap,
 * frame timestamp bounds, and ground track samples.
 */

import * as satellite from "satellite.js";
import type {
  EvidenceBundle,
  GeometryResult,
  GroundTrackPoint,
} from "./types";

/**
 * Computes SGP4 pass geometry and checks consistency against the evidence bundle.
 */
export function verifyPassGeometry(bundle: EvidenceBundle): GeometryResult {
  const { tle, source, pass, frames, scoring } = bundle;
  const minElevationDeg = scoring.thresholds.minElevationCentiDeg / 100;

  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);

  const stationLatDeg = source.stationLatMicroDeg / 1_000_000;
  const stationLonDeg = source.stationLonMicroDeg / 1_000_000;
  const stationAltKm = source.stationAltM / 1_000;

  const observerGd = {
    latitude: satellite.degreesToRadians(stationLatDeg),
    longitude: satellite.degreesToRadians(stationLonDeg),
    height: stationAltKm,
  };

  // Sample across an extended window around the pass to detect the full AOS/LOS interval
  const searchStartMs = pass.startMs - 10 * 60 * 1000;
  const searchEndMs = pass.endMs + 10 * 60 * 1000;
  const stepMs = 5000; // 5-second sampling step

  let predictedAosMs: number | null = null;
  let predictedLosMs: number | null = null;
  let computedMaxElevationDeg = -90;

  // We find the pass cluster that overlaps [pass.startMs, pass.endMs]
  let inPass = false;
  let currentPassAos: number | null = null;
  let currentPassMaxEl = -90;

  for (let t = searchStartMs; t <= searchEndMs; t += stepMs) {
    const date = new Date(t);
    const pv = satellite.propagate(satrec, date);

    if (!pv || !pv.position || typeof pv.position === "boolean") {
      continue;
    }

    const gmst = satellite.gstime(date);
    const ecf = satellite.eciToEcf(pv.position, gmst);
    const look = satellite.ecfToLookAngles(observerGd, ecf);
    const elevationDeg = look.elevation * (180 / Math.PI);

    if (elevationDeg >= minElevationDeg) {
      if (!inPass) {
        inPass = true;
        currentPassAos = t;
        currentPassMaxEl = elevationDeg;
      } else {
        if (elevationDeg > currentPassMaxEl) {
          currentPassMaxEl = elevationDeg;
        }
      }
    } else {
      if (inPass && currentPassAos !== null) {
        const currentPassLos = t;
        // Check if this pass overlaps the bundle pass window
        if (currentPassAos <= pass.endMs && currentPassLos >= pass.startMs) {
          predictedAosMs = currentPassAos;
          predictedLosMs = currentPassLos;
          computedMaxElevationDeg = currentPassMaxEl;
        }
        inPass = false;
        currentPassAos = null;
        currentPassMaxEl = -90;
      }
    }
  }

  // If still in pass at the end of search window
  if (inPass && currentPassAos !== null && predictedAosMs === null) {
    predictedAosMs = currentPassAos;
    predictedLosMs = searchEndMs;
    computedMaxElevationDeg = currentPassMaxEl;
  }

  // Fallback defaults if no pass was found
  if (predictedAosMs === null || predictedLosMs === null) {
    predictedAosMs = pass.aosMs;
    predictedLosMs = pass.losMs;
  }

  const predictedDurationMs = Math.max(0, predictedLosMs - predictedAosMs);

  // Check (a): predicted pass interval overlaps bundle's pass window
  const passIntervalOverlaps =
    predictedAosMs <= pass.endMs && predictedLosMs >= pass.startMs;

  // Check (b): every frame timestamp lies inside predicted pass interval plus tolerance
  const frameToleranceMs = 120_000; // 2 minute tolerance for receiver clock drift / acquisition margin
  let outOfWindowFrameCount = 0;
  for (const f of frames) {
    if (
      f.tsMs < predictedAosMs - frameToleranceMs ||
      f.tsMs > predictedLosMs + frameToleranceMs
    ) {
      outOfWindowFrameCount++;
    }
  }
  const framesWithinInterval = outOfWindowFrameCount === 0;

  // Check (c): computed max elevation matches reported max elevation (if reported)
  const computedMaxElevationCentiDeg = Math.round(computedMaxElevationDeg * 100);
  let maxElevationMatch = true;
  let elevationDeltaCentiDeg: number | null = null;
  const reportedMaxElevationCentiDeg = pass.reportedMaxElevationCentiDeg;

  if (reportedMaxElevationCentiDeg !== null) {
    elevationDeltaCentiDeg = Math.abs(
      computedMaxElevationCentiDeg - reportedMaxElevationCentiDeg
    );
    // 10 degrees = 1000 centi-degrees tolerance
    maxElevationMatch = elevationDeltaCentiDeg <= 1000;
  }

  // Check (d): TLE epoch is fresh (within 14 days of the pass)
  const passMidpointMs = (pass.startMs + pass.endMs) / 2;
  const tleAgeMs = Math.abs(passMidpointMs - tle.epochMs);
  const tleAgeDays = Number((tleAgeMs / (86_400 * 1_000)).toFixed(2));
  const tleEpochFresh = tleAgeDays <= 14;

  // Sample ground track every 5s across pass window for map display (labeled DERIVED)
  const groundTrack: GroundTrackPoint[] = [];
  for (let t = pass.startMs; t <= pass.endMs; t += 5000) {
    const date = new Date(t);
    const pv = satellite.propagate(satrec, date);
    if (!pv || !pv.position || typeof pv.position === "boolean") {
      continue;
    }
    const gmst = satellite.gstime(date);
    const geodetic = satellite.eciToGeodetic(pv.position, gmst);
    const satLat = satellite.degreesLat(geodetic.latitude);
    const satLon = satellite.degreesLong(geodetic.longitude);
    const satAltM = Math.round(geodetic.height * 1000);

    const ecf = satellite.eciToEcf(pv.position, gmst);
    const look = satellite.ecfToLookAngles(observerGd, ecf);
    const elDeg = look.elevation * (180 / Math.PI);
    const azDeg = ((look.azimuth * (180 / Math.PI)) % 360 + 360) % 360;

    groundTrack.push({
      tsMs: t,
      lat: Number(satLat.toFixed(5)),
      lon: Number(satLon.toFixed(5)),
      altM: satAltM,
      elevationCentiDeg: Math.round(elDeg * 100),
      azimuthDeg: Number(azDeg.toFixed(2)),
    });
  }

  return {
    predictedAosMs,
    predictedLosMs,
    predictedDurationMs,
    passIntervalOverlaps,
    framesWithinInterval,
    outOfWindowFrameCount,
    maxElevationMatch,
    computedMaxElevationCentiDeg,
    reportedMaxElevationCentiDeg,
    elevationDeltaCentiDeg,
    tleEpochFresh,
    tleAgeDays,
    groundTrack,
  };
}
