/**
 * Isomorphic cryptographic hashing utilities (WebCrypto with Node fallback).
 */

import { canonicalizeToBytes } from "./canonical";
import type { EvidenceBundle } from "./types";

/**
 * Converts a hex string (with or without 0x prefix) to Uint8Array.
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error(`Invalid hex length: ${clean.length}`);
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.substring(i, i + 2), 16);
    if (Number.isNaN(byte)) {
      throw new Error(`Invalid hex byte at index ${i}: ${clean.substring(i, i + 2)}`);
    }
    bytes[i / 2] = byte;
  }
  return bytes;
}

/**
 * Converts a Uint8Array to a 0x-prefixed lowercase hex string.
 */
export function bytesToHex(bytes: Uint8Array): `0x${string}` {
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex as `0x${string}`;
}

/**
 * Converts a Uint8Array to a lowercase hex string without 0x prefix.
 */
export function bytesToRawHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Computes SHA-256 digest of data as Uint8Array.
 */
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle && typeof subtle.digest === "function") {
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    const buffer = await subtle.digest("SHA-256", copy);
    return new Uint8Array(buffer);
  }

  throw new Error("No cryptographic SHA-256 provider (WebCrypto) available.");
}

/**
 * Computes SHA-256 digest of data as 0x-prefixed lowercase hex string.
 */
export async function sha256Hex(data: Uint8Array): Promise<`0x${string}`> {
  const digest = await sha256(data);
  return bytesToHex(digest);
}

/**
 * Computes the bundleHash of an evidence bundle by canonicalising and computing SHA-256.
 */
export async function computeBundleHash(bundle: EvidenceBundle): Promise<`0x${string}`> {
  const canonicalBytes = canonicalizeToBytes(bundle);
  return await sha256Hex(canonicalBytes);
}
