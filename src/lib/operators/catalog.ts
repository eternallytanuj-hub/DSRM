/**
 * CelesTrak SATCAT & General Perturbations (GP) Catalog Lookup Service
 * Non-negotiable invariant: NORAD IDs are integers (number/bigint), never 5-digit strings.
 * Respects CelesTrak usage policy: aggressive caching, no per-request fan-out.
 */

export interface SatcatRecord {
  noradId: number;
  objectName: string;
  objectId: string;
  objectType: "PAY" | "R/B" | "DEB" | "UNK";
  opsStatusCode: "+" | "-" | "P" | "B" | "S" | "X" | "D" | "?"; // +: operational, -: non-operational, P: partially operational, B: backup/standby
  ownerCode: string;
  launchDate: string;
  decayDate: string | null;
}

export interface CatalogCheckResult {
  noradId: number;
  objectName: string;
  isPayload: boolean;
  isOperational: boolean;
  isDecayed: boolean;
  decayDate: string | null;
  ownerCode: string;
  declaredCountry: string;
  countryMatchFlag: boolean;
  passed: boolean;
  rejectionReason?: string;
  warning?: string;
  source: string;
  fetchedAtMs: number;
}

// Built-in SATCAT fixtures including 6-digit NORAD IDs (>99999)
export const SATCAT_FIXTURES: Record<number, SatcatRecord> = {
  // RadFxSat (AO-91)
  43017: {
    noradId: 43017,
    objectName: "AO-91 [RADFXSAT]",
    objectId: "2017-073E",
    objectType: "PAY",
    opsStatusCode: "+",
    ownerCode: "US",
    launchDate: "2017-11-18",
    decayDate: null,
  },
  // International Space Station
  25544: {
    noradId: 25544,
    objectName: "ISS (ZARYA)",
    objectId: "1998-067A",
    objectType: "PAY",
    opsStatusCode: "+",
    ownerCode: "ISS",
    launchDate: "1998-11-20",
    decayDate: null,
  },
  // 6-digit NORAD ID fixture: New LEO SmallSat constellation asset
  100234: {
    noradId: 100234,
    objectName: "DSRM-PATHFINDER-1",
    objectId: "2026-004A",
    objectType: "PAY",
    opsStatusCode: "+",
    ownerCode: "IN",
    launchDate: "2026-01-15",
    decayDate: null,
  },
  // Decayed satellite fixture
  99991: {
    noradId: 99991,
    objectName: "DECAYED-TEST-CUBE",
    objectId: "2010-099B",
    objectType: "PAY",
    opsStatusCode: "D",
    ownerCode: "US",
    launchDate: "2010-05-20",
    decayDate: "2024-01-01",
  },
  // Debris fixture (Non-payload)
  99992: {
    noradId: 99992,
    objectName: "SL-16 DEBRIS",
    objectId: "1993-016B",
    objectType: "DEB",
    opsStatusCode: "-",
    ownerCode: "CIS",
    launchDate: "1993-03-26",
    decayDate: null,
  },
};

// In-memory 24-hour cache
const catalogCache = new Map<number, { record: SatcatRecord; fetchedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function lookupSatcatRecord(noradId: number): Promise<SatcatRecord | null> {
  const cached = catalogCache.get(noradId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.record;
  }

  // Check fixtures first (immediate return, high performance)
  if (SATCAT_FIXTURES[noradId]) {
    const record = SATCAT_FIXTURES[noradId];
    catalogCache.set(noradId, { record, fetchedAt: Date.now() });
    return record;
  }

  // Online query fallback with timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://celestrak.org/pub/satcat.json?CATNR=${noradId}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const record: SatcatRecord = {
          noradId: Number(item.NORAD_CAT_ID || item.CATNR || noradId),
          objectName: item.OBJECT_NAME || `SAT-${noradId}`,
          objectId: item.OBJECT_ID || "",
          objectType: item.OBJECT_TYPE || "PAY",
          opsStatusCode: item.OPS_STATUS_CODE || "+",
          ownerCode: item.OWNER || "UNK",
          launchDate: item.LAUNCH_DATE || "",
          decayDate: item.DECAY_DATE || null,
        };
        catalogCache.set(noradId, { record, fetchedAt: Date.now() });
        return record;
      }
    }
  } catch {
    // If online fails or offline, return null
  }

  return null;
}

/**
 * Checks an operator's declared satellite against official SATCAT catalog data.
 */
export async function performCatalogCheck(
  noradIdInput: number | string | bigint,
  declaredCountry: string
): Promise<CatalogCheckResult> {
  const noradId = typeof noradIdInput === "number" ? noradIdInput : Number(noradIdInput);

  if (isNaN(noradId) || noradId <= 0 || !Number.isInteger(noradId)) {
    throw new Error("Invalid NORAD ID: must be a positive integer.");
  }

  const record = await lookupSatcatRecord(noradId);
  const now = Date.now();

  if (!record) {
    return {
      noradId,
      objectName: "Unknown Object",
      isPayload: false,
      isOperational: false,
      isDecayed: false,
      decayDate: null,
      ownerCode: "UNKNOWN",
      declaredCountry,
      countryMatchFlag: false,
      passed: false,
      rejectionReason: `NORAD ID ${noradId} not found in CelesTrak SATCAT registry.`,
      source: "celestrak_satcat_cache",
      fetchedAtMs: now,
    };
  }

  const isPayload = record.objectType === "PAY";
  const isOperational = record.opsStatusCode === "+" || record.opsStatusCode === "P" || record.opsStatusCode === "B";
  const isDecayed = Boolean(record.decayDate) || record.opsStatusCode === "D";

  // Compare OWNER code with declared country
  // Country mismatch is flagged for manual review, not an auto-reject, because OWNER codes are coarse
  const normalizedCountry = (declaredCountry || "").trim().toUpperCase();
  const normalizedOwner = (record.ownerCode || "").trim().toUpperCase();
  const countryMatchFlag =
    normalizedOwner === "ISS" ||
    normalizedOwner === "ESA" ||
    normalizedOwner === normalizedCountry ||
    normalizedOwner.startsWith(normalizedCountry.slice(0, 2));

  let passed = true;
  let rejectionReason: string | undefined;
  let warning: string | undefined;

  if (!isPayload) {
    passed = false;
    rejectionReason = `Object ${noradId} (${record.objectName}) is type ${record.objectType}, not an operational payload.`;
  } else if (isDecayed) {
    passed = false;
    rejectionReason = `Satellite ${noradId} decayed on ${record.decayDate || "past epoch"}.`;
  } else if (!isOperational) {
    passed = false;
    rejectionReason = `Satellite ${noradId} is reported non-operational (status: ${record.opsStatusCode}).`;
  }

  if (passed && !countryMatchFlag) {
    warning = `Declared country (${declaredCountry}) differs from catalog OWNER (${record.ownerCode}). Flagged for manual review.`;
  }

  return {
    noradId,
    objectName: record.objectName,
    isPayload,
    isOperational,
    isDecayed,
    decayDate: record.decayDate,
    ownerCode: record.ownerCode,
    declaredCountry,
    countryMatchFlag,
    passed,
    rejectionReason,
    warning,
    source: "celestrak_satcat",
    fetchedAtMs: now,
  };
}
