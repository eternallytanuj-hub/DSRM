import {
  createPublicClient,
  http,
  formatEther,
} from "viem";
import { sepolia } from "viem/chains";
import { OPERATOR_REGISTRY_ABI } from "../contracts/operatorRegistry";
import {
  getTierCaps,
  type TierCaps,
} from "@/config/tiers";
import { type CatalogCheckResult } from "./catalog";

export interface TierExplanationState {
  registered: boolean;
  stakeAmount: string;
  stakeWei: string;
  hasMinStakeT0: boolean;
  hasMinStakeT2: boolean;
  kybMet: boolean;
  kybExpiry?: number;
  kybAttesters: string[];
  domainMet: boolean;
  domainExpiry?: number;
  domainAttesters: string[];
  controlledSatelliteCount: number;
  activeControlledNoradIds: number[];
  hasUnresolvedContest: boolean;
  regulatoryMet: boolean;
  regulatoryExpiry?: number;
  regulatoryAttesters: string[];
  vouchCount: number;
  vouchAttesters: string[];
  currentTier: number;
  isSuspended: boolean;
}

export interface OperatorStatusResponse {
  address: `0x${string}`;
  currentTier: number;
  caps: TierCaps;
  explanation: TierExplanationState;
  isDemo: boolean;
  provenance: "real" | "simulated";
  onChainSynced: boolean;
  catalogCheck?: CatalogCheckResult;
  updatedAt: string;
}

// In-memory demo operator states for Judge Demo Mode
export const demoOperatorStates = new Map<string, TierExplanationState>();

export function getLocalDemoOperatorState(address: string): TierExplanationState | null {
  return demoOperatorStates.get(address.toLowerCase()) || null;
}

export function setLocalDemoOperatorState(address: string, state: TierExplanationState) {
  demoOperatorStates.set(address.toLowerCase(), state);
}

export function resetDemoOperatorStates() {
  demoOperatorStates.clear();
}

/**
 * Derives pure tier from a TierExplanationState.
 * Guarantees Invariant 5: Tier is a pure, recomputable function of on-chain facts.
 */
export function derivePureTier(state: TierExplanationState): number {
  if (!state.registered) return 0;
  if (!state.hasMinStakeT0 || !state.kybMet || !state.domainMet) return 0;

  // If contested, Tier 1 and above is suspended
  if (state.hasUnresolvedContest) return 0;
  if (state.controlledSatelliteCount === 0) return 0; // Tier 0 Listed

  // Tier 2 requires 0.1 ETH, regulatory license attestation, and >=2 independent vouches
  if (state.hasMinStakeT2 && state.regulatoryMet && state.vouchCount >= 2) {
    return 2;
  }

  return 1;
}

/**
 * Fetch and aggregate complete operator tier status.
 */
export async function getOperatorStatus(
  address: string,
  options: {
    isDemo?: boolean;
    registryAddress?: `0x${string}`;
    rpcUrl?: string;
  } = {}
): Promise<OperatorStatusResponse> {
  const normalized = address.toLowerCase() as `0x${string}`;
  const isDemo = Boolean(options.isDemo);

  // If demo mode and local demo state exists, return simulated derivation
  if (isDemo && demoOperatorStates.has(normalized)) {
    const exp = demoOperatorStates.get(normalized)!;
    const currentTier = derivePureTier(exp);
    exp.currentTier = currentTier;
    const caps = getTierCaps(currentTier);

    return {
      address: normalized,
      currentTier,
      caps,
      explanation: exp,
      isDemo: true,
      provenance: "simulated",
      onChainSynced: false,
      updatedAt: new Date().toISOString(),
    };
  }

  const contractAddress =
    options.registryAddress ||
    (process.env.NEXT_PUBLIC_OPERATOR_REGISTRY as `0x${string}` | undefined);

  const rpcUrl =
    options.rpcUrl ||
    process.env.NEXT_PUBLIC_SEPOLIA_RPC ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  if (contractAddress && contractAddress.startsWith("0x")) {
    try {
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl),
      });

      const explanationData = (await publicClient.readContract({
        address: contractAddress,
        abi: OPERATOR_REGISTRY_ABI,
        functionName: "explainTier",
        args: [normalized],
      })) as {
        registered: boolean;
        stakeAmount: bigint;
        hasMinStakeT0: boolean;
        hasMinStakeT2: boolean;
        kybMet: boolean;
        kybExpiry: bigint;
        kybAttesters: readonly `0x${string}`[];
        domainMet: boolean;
        domainExpiry: bigint;
        domainAttesters: readonly `0x${string}`[];
        controlledSatelliteCount: number;
        activeControlledNoradIds: readonly number[];
        hasUnresolvedContest: boolean;
        regulatoryMet: boolean;
        regulatoryExpiry: bigint;
        regulatoryAttesters: readonly `0x${string}`[];
        vouchCount: number;
        vouchAttesters: readonly `0x${string}`[];
        currentTier: number;
        isSuspended: boolean;
      };

      const explanation: TierExplanationState = {
        registered: explanationData.registered,
        stakeAmount: `${formatEther(explanationData.stakeAmount)} ETH`,
        stakeWei: explanationData.stakeAmount.toString(),
        hasMinStakeT0: explanationData.hasMinStakeT0,
        hasMinStakeT2: explanationData.hasMinStakeT2,
        kybMet: explanationData.kybMet,
        kybExpiry: Number(explanationData.kybExpiry),
        kybAttesters: [...explanationData.kybAttesters],
        domainMet: explanationData.domainMet,
        domainExpiry: Number(explanationData.domainExpiry),
        domainAttesters: [...explanationData.domainAttesters],
        controlledSatelliteCount: explanationData.controlledSatelliteCount,
        activeControlledNoradIds: [...explanationData.activeControlledNoradIds],
        hasUnresolvedContest: explanationData.hasUnresolvedContest,
        regulatoryMet: explanationData.regulatoryMet,
        regulatoryExpiry: Number(explanationData.regulatoryExpiry),
        regulatoryAttesters: [...explanationData.regulatoryAttesters],
        vouchCount: explanationData.vouchCount,
        vouchAttesters: [...explanationData.vouchAttesters],
        currentTier: explanationData.currentTier,
        isSuspended: explanationData.isSuspended,
      };

      return {
        address: normalized,
        currentTier: explanation.currentTier,
        caps: getTierCaps(explanation.currentTier),
        explanation,
        isDemo: false,
        provenance: "real",
        onChainSynced: true,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      // Contract unconfigured or RPC unreachable, fallback to default untiered
    }
  }

  // Fallback default for unconfigured on-chain state
  const fallbackExplanation: TierExplanationState = {
    registered: false,
    stakeAmount: "0 ETH",
    stakeWei: "0",
    hasMinStakeT0: false,
    hasMinStakeT2: false,
    kybMet: false,
    kybAttesters: [],
    domainMet: false,
    domainAttesters: [],
    controlledSatelliteCount: 0,
    activeControlledNoradIds: [],
    hasUnresolvedContest: false,
    regulatoryMet: false,
    regulatoryAttesters: [],
    vouchCount: 0,
    vouchAttesters: [],
    currentTier: 0,
    isSuspended: false,
  };

  return {
    address: normalized,
    currentTier: 0,
    caps: getTierCaps(0),
    explanation: fallbackExplanation,
    isDemo: false,
    provenance: "real",
    onChainSynced: false,
    updatedAt: new Date().toISOString(),
  };
}
