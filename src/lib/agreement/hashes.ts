import { keccak256, toBytes, toHex } from "viem";

/**
 * Generates a random 32-byte bookingId as keccak256 of 32 cryptographically random bytes.
 */
export function generateBookingId(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return keccak256(toHex(bytes));
}

/**
 * Canonicalises agreement text per Section 2:
 * 1. Normalise line endings to LF (\n)
 * 2. Strip trailing whitespace per line
 * 3. Trim document (leading/trailing whitespace)
 * 4. UTF-8 encode before hashing
 */
export function canonicalizeText(raw: string): string {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").map((line) => line.replace(/[ \t]+$/, ""));
  return lines.join("\n").trim();
}

/**
 * Computes termsHash = keccak256(toBytes(canonicalText))
 */
export function computeTermsHash(canonicalText: string): `0x${string}` {
  return keccak256(toBytes(canonicalText));
}

/**
 * Serializes an object to deterministic JSON with recursively sorted keys and no extraneous whitespace.
 */
export function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalJson(item)).join(",")}]`;
  }
  const record = obj as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const pairs = sortedKeys.map((key) => {
    return `${JSON.stringify(key)}:${canonicalJson(record[key])}`;
  });
  return `{${pairs.join(",")}}`;
}

export interface UseDeclarationParams {
  category: string;
  otherDescription?: string;
  targetRegion: string;
  declarationVersion: string;
}

/**
 * Computes useDeclarationHash:
 * useDeclarationHash = keccak256(toBytes(canonicalJson({ category, otherDescription, targetRegion, declarationVersion })))
 */
export function computeUseDeclarationHash(params: UseDeclarationParams): `0x${string}` {
  const payload: Record<string, string> = {
    category: params.category || "",
    declarationVersion: params.declarationVersion || "1.0",
    otherDescription: params.otherDescription || "",
    targetRegion: params.targetRegion || "",
  };
  const jsonStr = canonicalJson(payload);
  return keccak256(toBytes(jsonStr));
}
