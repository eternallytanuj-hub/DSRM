import { type TierCaps } from "@/config/tiers";
import { getOperatorStatus } from "./tierService";

export interface CapCheckResult {
  allowed: boolean;
  operatorAddress: `0x${string}`;
  currentTier: number;
  caps: TierCaps;
  reason?: string;
}

export interface BookingPrepareResult {
  allowed: boolean;
  operatorAddress: `0x${string}`;
  currentTier: number;
  caps: TierCaps;
  payoutHoldHours: number;
  payoutHoldSeconds: number;
  deliveryBoundChallengeRequired: boolean;
  reason?: string;
}

// In-memory active windows counter per operator
const activeWindowsCount = new Map<string, number>();

export function getActiveWindows(operatorAddress: string): number {
  return activeWindowsCount.get(operatorAddress.toLowerCase()) || 0;
}

export function setActiveWindows(operatorAddress: string, count: number) {
  activeWindowsCount.set(operatorAddress.toLowerCase(), Math.max(0, count));
}

export function incrementActiveWindows(operatorAddress: string) {
  const current = getActiveWindows(operatorAddress);
  activeWindowsCount.set(operatorAddress.toLowerCase(), current + 1);
}

/**
 * Enforces listing window creation rules.
 * Rejects window creation above the tier's window cap or without Tier 0.
 */
export async function enforceListingWindowCreation(
  operatorAddress: string,
  isDemo: boolean = false
): Promise<CapCheckResult> {
  const normalized = operatorAddress.toLowerCase() as `0x${string}`;
  const status = await getOperatorStatus(normalized, { isDemo });
  const caps = status.caps;
  const currentActive = getActiveWindows(normalized);

  // Operator must have at least Tier 0 Listed (or above) to create listing windows
  if (status.currentTier < 0 || !status.explanation.registered || !status.explanation.hasMinStakeT0) {
    return {
      allowed: false,
      operatorAddress: normalized,
      currentTier: status.currentTier,
      caps,
      reason: "Operator is not registered or does not meet Tier 0 Listed requirements (minimum 0.01 ETH stake, KYB, and domain binding required).",
    };
  }

  if (currentActive >= caps.maxActiveWindows) {
    return {
      allowed: false,
      operatorAddress: normalized,
      currentTier: status.currentTier,
      caps,
      reason: `Operator has reached the maximum of ${caps.maxActiveWindows} active windows permitted for ${caps.name}. Settle or close existing windows, or upgrade tier.`,
    };
  }

  return {
    allowed: true,
    operatorAddress: normalized,
    currentTier: status.currentTier,
    caps,
  };
}

/**
 * Enforces booking value caps and returns required payout hold duration.
 */
export async function enforceBookingPrepare(
  operatorAddress: string,
  bookingValueWei: bigint,
  isDemo: boolean = false
): Promise<BookingPrepareResult> {
  const normalized = operatorAddress.toLowerCase() as `0x${string}`;
  const status = await getOperatorStatus(normalized, { isDemo });
  const caps = status.caps;

  if (bookingValueWei > caps.maxBookingValueWei) {
    return {
      allowed: false,
      operatorAddress: normalized,
      currentTier: status.currentTier,
      caps,
      payoutHoldHours: caps.payoutHoldHours,
      payoutHoldSeconds: caps.payoutHoldSeconds,
      deliveryBoundChallengeRequired: caps.deliveryBoundChallengeRequired,
      reason: `Booking value exceeds the ${caps.maxBookingValueEth} ETH cap for ${caps.name}. Operator upgrade required for higher capacity bookings.`,
    };
  }

  return {
    allowed: true,
    operatorAddress: normalized,
    currentTier: status.currentTier,
    caps,
    payoutHoldHours: caps.payoutHoldHours,
    payoutHoldSeconds: caps.payoutHoldSeconds,
    deliveryBoundChallengeRequired: caps.deliveryBoundChallengeRequired,
  };
}
