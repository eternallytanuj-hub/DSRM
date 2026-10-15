import { describe, it, expect, beforeEach } from 'vitest';
import {
  derivePureTier,
  getLocalDemoOperatorState,
  setLocalDemoOperatorState,
  resetDemoOperatorStates,
  TierExplanationState,
} from '../tierService';
import { TIER_CONFIG } from '@/config/tiers';

describe('Frontend & Demo Mode Operator Verification Tests', () => {
  beforeEach(() => {
    resetDemoOperatorStates();
  });

  it('correctly derives pure tier progression from on-chain facts', () => {
    const state: TierExplanationState = {
      registered: true,
      stakeAmount: '0.01 ETH',
      stakeWei: '10000000000000000',
      hasMinStakeT0: true,
      hasMinStakeT2: false,
      kybMet: true,
      kybAttesters: ['0x111'],
      domainMet: true,
      domainAttesters: ['0x111'],
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

    // Tier 0 Listed (registered + S0 stake + KYB + DOMAIN)
    expect(derivePureTier(state)).toBe(0);

    // Tier 1 Controlled (adds at least 1 controlled satellite)
    state.controlledSatelliteCount = 1;
    state.activeControlledNoradIds = [43017];
    expect(derivePureTier(state)).toBe(1);

    // If claim becomes contested, downgrades to Tier 0
    state.hasUnresolvedContest = true;
    expect(derivePureTier(state)).toBe(0);
    state.hasUnresolvedContest = false;

    // Tier 2 Trusted (S2 stake + Regulatory + >=2 independent vouches)
    state.hasMinStakeT2 = true;
    state.regulatoryMet = true;
    state.vouchCount = 2;
    expect(derivePureTier(state)).toBe(2);

    // If stake is slashed below S0, operator is suspended / tier 0
    state.hasMinStakeT0 = false;
    expect(derivePureTier(state)).toBe(0);
  });

  it('guarantees isolated demo namespace with no leakage to real operators', () => {
    const demoOp = '0x1111111111111111111111111111111111111111';
    const realOp = '0x2222222222222222222222222222222222222222';

    const demoState: TierExplanationState = {
      registered: true,
      stakeAmount: '0.10 ETH',
      stakeWei: '100000000000000000',
      hasMinStakeT0: true,
      hasMinStakeT2: true,
      kybMet: true,
      kybAttesters: ['0xdemo'],
      domainMet: true,
      domainAttesters: ['0xdemo'],
      controlledSatelliteCount: 1,
      activeControlledNoradIds: [43017],
      hasUnresolvedContest: false,
      regulatoryMet: true,
      regulatoryAttesters: ['0xdemo'],
      vouchCount: 2,
      vouchAttesters: ['0xdemo1', '0xdemo2'],
      currentTier: 2,
      isSuspended: false,
    };

    setLocalDemoOperatorState(demoOp, demoState);

    expect(getLocalDemoOperatorState(demoOp)).not.toBeNull();
    expect(getLocalDemoOperatorState(demoOp)?.currentTier).toBe(2);

    // Real operator is completely unpolluted
    expect(getLocalDemoOperatorState(realOp)).toBeNull();

    resetDemoOperatorStates();
    expect(getLocalDemoOperatorState(demoOp)).toBeNull();
  });

  it('validates caps and settlement hold rules per tier', () => {
    const tier0 = TIER_CONFIG[0];
    const tier1 = TIER_CONFIG[1];
    const tier2 = TIER_CONFIG[2];

    expect(tier0.maxBookingValueEth).toBe('0.05');
    expect(tier0.maxActiveWindows).toBe(3);
    expect(tier0.payoutHoldHours).toBe(72);
    expect(tier0.deliveryBoundChallengeRequired).toBe(false);

    expect(tier1.maxBookingValueEth).toBe('0.5');
    expect(tier1.maxActiveWindows).toBe(20);
    expect(tier1.payoutHoldHours).toBe(24);
    expect(tier1.deliveryBoundChallengeRequired).toBe(false);

    expect(tier2.maxBookingValueEth).toBe('5.0');
    expect(tier2.maxActiveWindows).toBe(100);
    expect(tier2.payoutHoldHours).toBe(2);
    expect(tier2.deliveryBoundChallengeRequired).toBe(true);
  });
});
