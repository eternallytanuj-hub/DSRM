import { keccak256, stringToBytes } from "viem";

export interface BusinessInfo {
  legalName: string;
  jurisdiction: string;
  registrationNumber: string;
  declaredCountry: string;
  contactEmail: string;
  documentHash: string;
}

export type KybDecision = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";

export interface KybReviewResult {
  provider: "manual_review" | "mock_kyb" | "sumsub" | "jumio" | "trulioo";
  decision: KybDecision;
  referenceHash: `0x${string}`;
  operatorWallet: `0x${string}`;
  reviewer?: string;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface KybProvider {
  providerName: string;
  submitReview(
    operatorWallet: `0x${string}`,
    info: BusinessInfo,
    isDemo?: boolean
  ): Promise<KybReviewResult>;
  checkStatus(referenceHash: `0x${string}`): Promise<KybReviewResult | null>;
}

// In-memory queue for review records (persisted via Supabase operator_kyb table in production)
const kybRecords = new Map<string, KybReviewResult>();

/**
 * ManualReviewProvider: Internal compliance queue.
 * Personal and corporate identifying data is kept private off-chain;
 * only the cryptographic referenceHash is published on-chain.
 */
export class ManualReviewProvider implements KybProvider {
  providerName = "manual_review";

  async submitReview(
    operatorWallet: `0x${string}`,
    info: BusinessInfo,
    isDemo: boolean = false
  ): Promise<KybReviewResult> {
    const referenceHash = keccak256(
      stringToBytes(
        `DSRM-KYB:${operatorWallet.toLowerCase()}:${info.registrationNumber}:${info.jurisdiction}:${info.documentHash}`
      )
    );

    const record: KybReviewResult = {
      provider: "manual_review",
      decision: isDemo ? "APPROVED" : "PENDING",
      referenceHash,
      operatorWallet: operatorWallet.toLowerCase() as `0x${string}`,
      reviewer: isDemo ? "Automated Demo Approver" : undefined,
      notes: isDemo
        ? "Simulated instant approval for judge demonstration."
        : "Queued for administrative compliance officer manual document audit.",
      submittedAt: new Date().toISOString(),
      reviewedAt: isDemo ? new Date().toISOString() : undefined,
    };

    kybRecords.set(referenceHash, record);
    return record;
  }

  async checkStatus(referenceHash: `0x${string}`): Promise<KybReviewResult | null> {
    return kybRecords.get(referenceHash) || null;
  }

  async approveReview(referenceHash: `0x${string}`, reviewer: string, notes?: string): Promise<KybReviewResult> {
    const rec = kybRecords.get(referenceHash);
    if (!rec) throw new Error("KYB reference not found");

    rec.decision = "APPROVED";
    rec.reviewer = reviewer;
    rec.notes = notes || "Corporate entity documentation verified against regulatory database.";
    rec.reviewedAt = new Date().toISOString();

    kybRecords.set(referenceHash, rec);
    return rec;
  }
}

/**
 * MockKybProvider: Demo mode provider.
 * Allows simulated instant approvals for Judge demo scenarios.
 */
export class MockKybProvider implements KybProvider {
  providerName = "mock_kyb";

  async submitReview(
    operatorWallet: `0x${string}`,
    info: BusinessInfo
  ): Promise<KybReviewResult> {
    const referenceHash = keccak256(
      stringToBytes(`DEMO-KYB:${operatorWallet.toLowerCase()}:${info.legalName}`)
    );

    const result: KybReviewResult = {
      provider: "mock_kyb",
      decision: "APPROVED",
      referenceHash,
      operatorWallet: operatorWallet.toLowerCase() as `0x${string}`,
      reviewer: "Judge Demo Oracle Engine",
      notes: "Mock simulated KYB approval for evaluation purposes.",
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
    };

    kybRecords.set(referenceHash, result);
    return result;
  }

  async checkStatus(referenceHash: `0x${string}`): Promise<KybReviewResult | null> {
    return kybRecords.get(referenceHash) || null;
  }
}

export const defaultManualReviewProvider = new ManualReviewProvider();
export const defaultMockKybProvider = new MockKybProvider();
