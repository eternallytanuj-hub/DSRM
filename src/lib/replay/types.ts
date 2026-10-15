/**
 * Evidence Bundle and Telemetry Replay Type Definitions
 * Schema Version: 1
 * Non-negotiable: All numeric fields in hashed bundles must be integers.
 */

export interface BundleSource {
  network: "satnogs";
  observationId: number;
  stationId: number;
  stationName: string;
  stationLatMicroDeg: number; // Lat in microdegrees (1 deg = 1,000,000 microdeg)
  stationLonMicroDeg: number; // Lon in microdegrees
  stationAltM: number;        // Altitude in meters
  noradId: number;
  satelliteName: string;
  observationUrl: string;
  dbUrl: string;
  license: string;
  attribution: string;
  fetchedAtMs: number;
}

export interface BundleTLE {
  line1: string;
  line2: string;
  epochMs: number;
  sourceNote: string;
}

export interface BundlePass {
  startMs: number;
  endMs: number;
  aosMs: number;
  losMs: number;
  reportedMaxElevationCentiDeg: number | null; // Centi-degrees (1 deg = 100 centideg)
}

export interface TelemetryFrame {
  index: number;
  tsMs: number;
  hex: string; // Lowercase raw frame bytes in hex
}

export interface BundleSeries {
  snr: Array<{ tsMs: number; snrCentiDb: number }> | null;
}

export interface BundleScoringConfig {
  profile: "public-v1";
  version: 1;
  weightsBps: {
    contactCoverage: number; // 4000
    dataVolume: number;      // 3000
    frameContinuity: number;  // 3000
  };
  thresholds: {
    minElevationCentiDeg: number; // e.g. 1000 = 10 degrees
    maxGapMs: number;             // e.g. 30000 = 30 seconds
  };
}

export interface BundleBooking {
  bookingId: `0x${string}`;
  requestedDataBytes: number;
  requestedWindowStartMs: number;
  requestedWindowEndMs: number;
  provenance: "simulated";
}

export interface ProvenanceEntry {
  kind: "real" | "derived" | "simulated";
  source: string;
  url?: string;
  method?: string;
}

export interface EvidenceBundle {
  schemaVersion: 1;
  bundleId: string;
  source: BundleSource;
  tle: BundleTLE;
  pass: BundlePass;
  frames: TelemetryFrame[];
  series: BundleSeries;
  scoring: BundleScoringConfig;
  booking: BundleBooking;
  provenance: Record<string, ProvenanceEntry>;
}

export interface BundleSummary {
  bundleId: string;
  observationId: number;
  satelliteName: string;
  noradId: number;
  stationName: string;
  stationId: number;
  frameCount: number;
  totalBytes: number;
  bundleHash: `0x${string}`;
  merkleRoot: `0x${string}`;
  dBps: number;
  tier: "FULL_RELEASE" | "PRO_RATA" | "FULL_REFUND";
  computedAt: string;
}

export interface MerkleProofStep {
  siblingHash: `0x${string}`;
  side: "left" | "right";
}

export interface MerkleProof {
  frameIndex: number;
  leafHash: `0x${string}`;
  rootHash: `0x${string}`;
  steps: MerkleProofStep[];
}

export interface MerkleLeafInfo {
  index: number;
  tsMs: number;
  byteLength: number;
  leafHash: `0x${string}`;
  prefixHex: string;
}

export interface ScoringArithmetic {
  observedSpanMs: number;
  predictedDurationMs: number;
  totalFrameBytes: number;
  requestedDataBytes: number;
  gapDurationMs: number;
  gapShareBps: number;
  weights: {
    contactCoverage: number;
    dataVolume: number;
    frameContinuity: number;
  };
  computation: string;
}

export interface ScoringResult {
  profile: "public-v1";
  version: number;
  contactCoverageBps: number;
  dataVolumeBps: number;
  frameContinuityBps: number;
  dBps: number;
  tier: "FULL_RELEASE" | "PRO_RATA" | "FULL_REFUND";
  operatorShareBps: number;
  buyerRefundBps: number;
  arithmetic: ScoringArithmetic;
}

export interface GroundTrackPoint {
  tsMs: number;
  lat: number;
  lon: number;
  altM: number;
  elevationCentiDeg: number;
  azimuthDeg: number;
}

export interface GeometryResult {
  predictedAosMs: number;
  predictedLosMs: number;
  predictedDurationMs: number;
  passIntervalOverlaps: boolean;
  framesWithinInterval: boolean;
  outOfWindowFrameCount: number;
  maxElevationMatch: boolean;
  computedMaxElevationCentiDeg: number;
  reportedMaxElevationCentiDeg: number | null;
  elevationDeltaCentiDeg: number | null;
  tleEpochFresh: boolean;
  tleAgeDays: number;
  groundTrack: GroundTrackPoint[];
}

export interface OnChainAttestation {
  bookingId: `0x${string}`;
  bundleHash: `0x${string}`;
  merkleRoot: `0x${string}`;
  dBps: number;
  scoringVersion: number;
  cidHash: `0x${string}`;
  cid: string;
  submittedAt: number;
  signers: readonly `0x${string}`[];
  txHash?: `0x${string}`;
  blockNumber?: number;
}

export type VerificationStepId =
  | "fetch_bundle"
  | "bundle_hash"
  | "chain_attestation"
  | "hash_comparison"
  | "signatures"
  | "recompute_score"
  | "geometry";

export type VerificationStepStatus =
  | "idle"
  | "running"
  | "pass"
  | "fail"
  | "warn"
  | "blocked"
  | "unconfigured";

export interface VerificationStep {
  id: VerificationStepId;
  label: string;
  status: VerificationStepStatus;
  startedAt?: number;
  elapsedMs?: number;
  expected?: string;
  actual?: string;
  detail?: string;
  error?: string;
}

export interface AttesterConfig {
  address: `0x${string}`;
  label: string;
  operator: string;
  independent: boolean;
  note: string;
}
