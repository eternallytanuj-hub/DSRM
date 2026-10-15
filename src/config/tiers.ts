import { parseEther } from "viem";

export const CLAIM_KIND_KYB = 1 as const;
export const CLAIM_KIND_DOMAIN = 2 as const;
export const CLAIM_KIND_CONTROL = 3 as const;
export const CLAIM_KIND_REGULATORY = 4 as const;
export const CLAIM_KIND_VOUCH = 5 as const;

export type ClaimKind =
  | typeof CLAIM_KIND_KYB
  | typeof CLAIM_KIND_DOMAIN
  | typeof CLAIM_KIND_CONTROL
  | typeof CLAIM_KIND_REGULATORY
  | typeof CLAIM_KIND_VOUCH;

export const CLAIM_KIND_NAMES: Record<number, string> = {
  [CLAIM_KIND_KYB]: "KYB",
  [CLAIM_KIND_DOMAIN]: "DOMAIN",
  [CLAIM_KIND_CONTROL]: "CONTROL",
  [CLAIM_KIND_REGULATORY]: "REGULATORY",
  [CLAIM_KIND_VOUCH]: "VOUCH",
};

/**
 * Stake requirements (testnet scale defaults)
 */
export const S0_MIN_STAKE_WEI = parseEther("0.01"); // 0.01 ETH
export const S2_MIN_STAKE_WEI = parseEther("0.1");  // 0.1 ETH

/**
 * Time constants in seconds
 */
export const UNSTAKE_DELAY_SECONDS = 7 * 24 * 3600;       // 7 days
export const CHALLENGE_DEADLINE_SECONDS = 7 * 24 * 3600;   // 7 days
export const CONTROL_GRACE_PERIOD_SECONDS = 1 * 24 * 3600; // 1 day
export const CONTROL_TTL_SECONDS = 90 * 24 * 3600;         // 90 days

/**
 * Thresholds for operator claims
 */
export const CLAIM_KIND_THRESHOLDS: Record<number, number> = {
  [CLAIM_KIND_KYB]: 1,
  [CLAIM_KIND_DOMAIN]: 1,
  [CLAIM_KIND_CONTROL]: 1,
  [CLAIM_KIND_REGULATORY]: 1,
  [CLAIM_KIND_VOUCH]: 2, // At least 2 independent attesters
};

export const MIN_INDEPENDENT_CONTROL_SIGNERS = 1;
export const MIN_INDEPENDENT_VOUCH_SIGNERS = 2;

export interface TierCaps {
  tier: number;
  name: string;
  badge: string;
  maxBookingValueEth: string;
  maxBookingValueWei: bigint;
  maxActiveWindows: number;
  payoutHoldHours: number;
  payoutHoldSeconds: number;
  deliveryBoundChallengeRequired: boolean;
  description: string;
}

export const TIER_CONFIG: Record<number, TierCaps> = {
  0: {
    tier: 0,
    name: "Tier 0 Listed",
    badge: "Listed",
    maxBookingValueEth: "0.05",
    maxBookingValueWei: parseEther("0.05"),
    maxActiveWindows: 3,
    payoutHoldHours: 72,
    payoutHoldSeconds: 72 * 3600,
    deliveryBoundChallengeRequired: false,
    description: "Registered operator with verified KYB, DNS domain binding, valid catalog registration, and 0.01 ETH stake.",
  },
  1: {
    tier: 1,
    name: "Tier 1 Controlled",
    badge: "Controlled",
    maxBookingValueEth: "0.5",
    maxBookingValueWei: parseEther("0.5"),
    maxActiveWindows: 20,
    payoutHoldHours: 24,
    payoutHoldSeconds: 24 * 3600,
    deliveryBoundChallengeRequired: false,
    description: "Tier 0 plus at least one satellite verified via cryptographic challenge-response control proof.",
  },
  2: {
    tier: 2,
    name: "Tier 2 Trusted",
    badge: "Trusted",
    maxBookingValueEth: "5.0",
    maxBookingValueWei: parseEther("5.0"),
    maxActiveWindows: 100,
    payoutHoldHours: 2,
    payoutHoldSeconds: 2 * 3600,
    deliveryBoundChallengeRequired: true,
    description: "Tier 1 plus 0.1 ETH stake, regulatory licensing attestation, and 2 independent peer vouches. Requires buyer-bound delivery challenge on every booking.",
  },
};

/**
 * Returns tier caps for a given tier number.
 */
export function getTierCaps(tier: number): TierCaps {
  return (
    TIER_CONFIG[tier] || {
      tier: -1,
      name: "Untiered / Suspended",
      badge: "Suspended",
      maxBookingValueEth: "0",
      maxBookingValueWei: 0n,
      maxActiveWindows: 0,
      payoutHoldHours: 0,
      payoutHoldSeconds: 0,
      deliveryBoundChallengeRequired: false,
      description: "Operator stake below threshold or contested claim unresolved.",
    }
  );
}
