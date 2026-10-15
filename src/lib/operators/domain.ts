import { promises as dns } from "node:dns";
import { keccak256, stringToBytes, isAddress } from "viem";
import crypto from "node:crypto";

export interface DomainChallenge {
  domain: string;
  operatorAddress: `0x${string}`;
  nonce: string;
  expectedTxtHost: string;
  expectedTxtValue: string;
  expiresAt: number;
}

export interface DomainVerificationResult {
  verified: boolean;
  domain: string;
  operatorAddress: `0x${string}`;
  evidenceHash: `0x${string}`;
  resolvedRecords: string[];
  error?: string;
}

// In-memory active domain challenges
const domainChallenges = new Map<string, DomainChallenge>();
// Mock DNS table for vitest & demo mode simulations
const mockDnsTxtRecords = new Map<string, string[]>();

export function setMockDnsTxtRecord(host: string, records: string[]) {
  mockDnsTxtRecords.set(host.toLowerCase(), records);
}

export function clearMockDnsTxtRecord(host: string) {
  mockDnsTxtRecords.delete(host.toLowerCase());
}

export function createDomainChallenge(
  operatorAddress: string,
  domainInput: string
): DomainChallenge {
  if (!isAddress(operatorAddress)) {
    throw new Error("Invalid operator wallet address.");
  }

  const normalizedDomain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!normalizedDomain || !normalizedDomain.includes(".")) {
    throw new Error("Invalid domain name.");
  }

  const normalizedAddress = operatorAddress.toLowerCase() as `0x${string}`;
  const nonce = crypto.randomBytes(12).toString("hex");
  const expectedTxtHost = `_dsrm.${normalizedDomain}`;
  const expectedTxtValue = `dsrm-verify:${normalizedAddress}:${normalizedDomain}:${nonce}`;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const challenge: DomainChallenge = {
    domain: normalizedDomain,
    operatorAddress: normalizedAddress,
    nonce,
    expectedTxtHost,
    expectedTxtValue,
    expiresAt,
  };

  domainChallenges.set(`${normalizedAddress}:${normalizedDomain}`, challenge);
  return challenge;
}

export async function verifyDomainTxtRecord(
  operatorAddress: string,
  domainInput: string,
  customResolver?: (host: string) => Promise<string[][]>
): Promise<DomainVerificationResult> {
  const normalizedAddress = operatorAddress.toLowerCase() as `0x${string}`;
  const normalizedDomain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const challengeKey = `${normalizedAddress}:${normalizedDomain}`;
  const challenge = domainChallenges.get(challengeKey);

  const evidenceHash = keccak256(stringToBytes(normalizedDomain));
  const expectedHost = `_dsrm.${normalizedDomain}`;

  let txtChunks: string[][] = [];

  // Check mock DNS first (for tests and judge demo)
  if (mockDnsTxtRecords.has(expectedHost.toLowerCase())) {
    const raw = mockDnsTxtRecords.get(expectedHost.toLowerCase())!;
    txtChunks = raw.map((r) => [r]);
  } else if (customResolver) {
    try {
      txtChunks = await customResolver(expectedHost);
    } catch (err) {
      return {
        verified: false,
        domain: normalizedDomain,
        operatorAddress: normalizedAddress,
        evidenceHash,
        resolvedRecords: [],
        error: `DNS resolution failed: ${(err as Error).message}`,
      };
    }
  } else {
    try {
      txtChunks = await dns.resolveTxt(expectedHost);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      return {
        verified: false,
        domain: normalizedDomain,
        operatorAddress: normalizedAddress,
        evidenceHash,
        resolvedRecords: [],
        error: `DNS TXT record not found at ${expectedHost} (${code || (err as Error).message})`,
      };
    }
  }

  const flatRecords = txtChunks.map((chunk) => chunk.join(""));

  // Check if any TXT record matches the required pattern:
  // dsrm-verify:<address>:<domain>:<nonce>
  const matching = flatRecords.find((rec) => {
    const parts = rec.trim().split(":");
    if (parts.length < 4) return false;
    if (parts[0] !== "dsrm-verify") return false;
    const addr = parts[1].toLowerCase();
    const dom = parts[2].toLowerCase();
    const nonce = parts[3];

    if (addr !== normalizedAddress || dom !== normalizedDomain) {
      return false;
    }

    if (challenge && challenge.nonce !== nonce) {
      return false;
    }

    return true;
  });

  if (!matching) {
    return {
      verified: false,
      domain: normalizedDomain,
      operatorAddress: normalizedAddress,
      evidenceHash,
      resolvedRecords: flatRecords,
      error: `No TXT record at ${expectedHost} matched required token 'dsrm-verify:${normalizedAddress}:${normalizedDomain}:<nonce>'. Found: ${flatRecords.join("; ")}`,
    };
  }

  return {
    verified: true,
    domain: normalizedDomain,
    operatorAddress: normalizedAddress,
    evidenceHash,
    resolvedRecords: flatRecords,
  };
}
