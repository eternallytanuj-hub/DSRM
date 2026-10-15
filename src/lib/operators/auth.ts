import { verifyMessage, isAddress } from "viem";
import crypto from "node:crypto";

interface SessionData {
  address: `0x${string}`;
  expiresAt: number;
}

// In-memory nonce and session storage (production uses Redis/database)
const nonces = new Map<string, { nonce: string; expiresAt: number }>();
const sessions = new Map<string, SessionData>();

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const NONCE_TTL_MS = 5 * 60 * 1000;         // 5 minutes

export function generateOperatorChallenge(address: string): { challenge: string; nonce: string } {
  if (!isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  const normalized = address.toLowerCase() as `0x${string}`;
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + NONCE_TTL_MS;

  nonces.set(normalized, { nonce, expiresAt });

  const challenge = [
    "DSRM Operator Authentication",
    `Address: ${normalized}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
    "Sign this message to authenticate as a registered DSRM operator.",
  ].join("\n");

  return { challenge, nonce };
}

export async function verifyOperatorLogin(
  address: string,
  signature: `0x${string}`,
  providedNonce: string
): Promise<{ token: string; expiresAt: number }> {
  if (!isAddress(address)) {
    throw new Error("Invalid address format");
  }

  const normalized = address.toLowerCase() as `0x${string}`;
  const stored = nonces.get(normalized);

  if (!stored || stored.nonce !== providedNonce || Date.now() > stored.expiresAt) {
    throw new Error("Challenge expired or invalid nonce. Request a new login challenge.");
  }

  // Clear nonce immediately to prevent replay
  nonces.delete(normalized);

  const message = [
    "DSRM Operator Authentication",
    `Address: ${normalized}`,
    `Nonce: ${providedNonce}`,
  ].join("\n");

  // Re-verify signature against prefix message
  let isValid = false;
  try {
    isValid = await verifyMessage({
      address: normalized,
      message,
      signature,
    });
  } catch {
    // Also try full challenge format
    const fullMessage = [
      "DSRM Operator Authentication",
      `Address: ${normalized}`,
      `Nonce: ${providedNonce}`,
      `Issued At: `,
    ];
    isValid = false;
  }

  if (!isValid) {
    // Verify standard challenge string if provided directly
    const validWithDirect = await verifyMessage({
      address: normalized,
      message: `dsrm-operator-login:${normalized}:${providedNonce}`,
      signature,
    }).catch(() => false);

    if (!validWithDirect) {
      throw new Error("Cryptographic signature verification failed.");
    }
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;

  sessions.set(token, { address: normalized, expiresAt });

  return { token, expiresAt };
}

export function validateSessionToken(token: string): `0x${string}` | null {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s || Date.now() > s.expiresAt) {
    if (s) sessions.delete(token);
    return null;
  }
  return s.address;
}

// Simple sliding window rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const item = rateLimits.get(key);

  if (!item || now > item.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (item.count >= maxRequests) {
    return false;
  }

  item.count++;
  return true;
}
