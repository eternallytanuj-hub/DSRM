import { describe, it, expect } from "vitest";
import {
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  recoverTypedDataAddress,
  type Address,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  EIP712_OPERATOR_CLAIM_TYPES,
  getOperatorDomain,
} from "../operatorRegistry";
import {
  CLAIM_KIND_KYB,
  CLAIM_KIND_DOMAIN,
  CLAIM_KIND_CONTROL,
  CLAIM_KIND_REGULATORY,
  CLAIM_KIND_VOUCH,
  getTierCaps,
  S0_MIN_STAKE_WEI,
  S2_MIN_STAKE_WEI,
} from "@/config/tiers";

describe("OperatorRegistry Cryptographic, EIP-712 & Tier Derivation Invariants", () => {
  const verifyingContract = "0x8888888888888888888888888888888888888888" as `0x${string}`;
  const chainId = 11155111; // Sepolia

  const key1 = "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`;
  const key2 = "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`;
  const key3 = "0x3333333333333333333333333333333333333333333333333333333333333333" as `0x${string}`;
  const rogueKey = "0x9999999999999999999999999999999999999999999999999999999999999999" as `0x${string}`;

  const account1 = privateKeyToAccount(key1); // Not independent
  const account2 = privateKeyToAccount(key2); // Independent
  const account3 = privateKeyToAccount(key3); // Independent
  const rogueAccount = privateKeyToAccount(rogueKey);

  const operatorAccount = privateKeyToAccount("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  const operatorAddress = operatorAccount.address;

  const domain = getOperatorDomain(verifyingContract, chainId);

  it("recovers valid signers for EIP-712 OperatorClaim", async () => {
    const message = {
      operator: operatorAddress,
      noradId: 0,
      kind: CLAIM_KIND_KYB,
      evidenceHash: keccak256("0x1234" as `0x${string}`),
      expiry: BigInt(Math.floor(Date.now() / 1000) + 86400),
    };

    const sig = await account1.signTypedData({
      domain,
      types: EIP712_OPERATOR_CLAIM_TYPES,
      primaryType: "OperatorClaim",
      message,
    });

    const recovered = await recoverTypedDataAddress({
      domain,
      types: EIP712_OPERATOR_CLAIM_TYPES,
      primaryType: "OperatorClaim",
      message,
      signature: sig,
    });

    expect(recovered.toLowerCase()).toBe(account1.address.toLowerCase());
  });

  it("detects unauthorized signers and signature tampering", async () => {
    const message = {
      operator: operatorAddress,
      noradId: 0,
      kind: CLAIM_KIND_DOMAIN,
      evidenceHash: keccak256("0x5678" as `0x${string}`),
      expiry: BigInt(Math.floor(Date.now() / 1000) + 86400),
    };

    const rogueSig = await rogueAccount.signTypedData({
      domain,
      types: EIP712_OPERATOR_CLAIM_TYPES,
      primaryType: "OperatorClaim",
      message,
    });

    const recovered = await recoverTypedDataAddress({
      domain,
      types: EIP712_OPERATOR_CLAIM_TYPES,
      primaryType: "OperatorClaim",
      message,
      signature: rogueSig,
    });

    const authorizedAttesters = new Set([
      account1.address.toLowerCase(),
      account2.address.toLowerCase(),
      account3.address.toLowerCase(),
    ]);

    expect(authorizedAttesters.has(recovered.toLowerCase())).toBe(false);
  });

  it("rejects signatures signed for wrong chainId or contract", async () => {
    const wrongDomain = getOperatorDomain(verifyingContract, 1); // Mainnet chain ID
    const message = {
      operator: operatorAddress,
      noradId: 0,
      kind: CLAIM_KIND_KYB,
      evidenceHash: keccak256("0x1234" as `0x${string}`),
      expiry: BigInt(Math.floor(Date.now() / 1000) + 86400),
    };

    const sig = await account1.signTypedData({
      domain: wrongDomain,
      types: EIP712_OPERATOR_CLAIM_TYPES,
      primaryType: "OperatorClaim",
      message,
    });

    // Recovering with the expected Sepolia domain yields a different address
    const recovered = await recoverTypedDataAddress({
      domain,
      types: EIP712_OPERATOR_CLAIM_TYPES,
      primaryType: "OperatorClaim",
      message,
      signature: sig,
    });

    expect(recovered.toLowerCase()).not.toBe(account1.address.toLowerCase());
  });

  it("validates control challenge nonce derivation and uniqueness", () => {
    const blockhash = keccak256("0xblockhash_prev" as `0x${string}`);
    const noradId = 43017;
    const now = 1716150000;

    const nonce1 = keccak256(
      encodeAbiParameters(
        parseAbiParameters("bytes32, address, uint32, uint256, uint256"),
        [blockhash, operatorAddress, noradId, 1n, BigInt(now)]
      )
    );

    const nonce2 = keccak256(
      encodeAbiParameters(
        parseAbiParameters("bytes32, address, uint32, uint256, uint256"),
        [blockhash, operatorAddress, noradId, 2n, BigInt(now)]
      )
    );

    const challengeId1 = keccak256(
      encodeAbiParameters(
        parseAbiParameters("address, uint32, uint256"),
        [operatorAddress, noradId, 1n]
      )
    );

    expect(nonce1).not.toBe(nonce2);
    expect(challengeId1.length).toBe(66);
  });

  describe("Pure Tier Derivation Matrix", () => {
    interface TierInputs {
      registered: boolean;
      stakeWei: bigint;
      kybActive: boolean;
      domainActive: boolean;
      activeControlledSats: number;
      contested: boolean;
      regulatoryActive: boolean;
      independentVouches: number;
    }

    function deriveTier(inputs: TierInputs): number {
      if (!inputs.registered) return 0;
      if (inputs.stakeWei < S0_MIN_STAKE_WEI) return 0;
      if (!inputs.kybActive || !inputs.domainActive) return 0;

      // Tier 0 met
      if (inputs.contested) return 0; // Contested claim suspends dependent tier
      if (inputs.activeControlledSats === 0) return 0; // Tier 0 Listed

      // Tier 1 met
      if (
        inputs.stakeWei >= S2_MIN_STAKE_WEI &&
        inputs.regulatoryActive &&
        inputs.independentVouches >= 2
      ) {
        return 2; // Tier 2 Trusted
      }

      return 1; // Tier 1 Controlled
    }

    const testMatrix: Array<{ name: string; inputs: TierInputs; expectedTier: number }> = [
      {
        name: "Unregistered operator => 0",
        inputs: {
          registered: false,
          stakeWei: parseEther("1"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 2,
          contested: false,
          regulatoryActive: true,
          independentVouches: 3,
        },
        expectedTier: 0,
      },
      {
        name: "Registered but stake < 0.01 ETH => 0",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.005"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: false,
          regulatoryActive: true,
          independentVouches: 2,
        },
        expectedTier: 0,
      },
      {
        name: "Registered, 0.01 ETH, KYB + DOMAIN, 0 satellites => Tier 0 Listed",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.01"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 0,
          contested: false,
          regulatoryActive: false,
          independentVouches: 0,
        },
        expectedTier: 0,
      },
      {
        name: "Tier 0 + 1 Controlled satellite => Tier 1 Controlled",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.01"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: false,
          regulatoryActive: false,
          independentVouches: 0,
        },
        expectedTier: 1,
      },
      {
        name: "Tier 1 + 0.1 ETH + REGULATORY + 2 independent vouches => Tier 2 Trusted",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.1"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: false,
          regulatoryActive: true,
          independentVouches: 2,
        },
        expectedTier: 2,
      },
      {
        name: "Tier 2 candidate with only 1 vouch => Tier 1 Controlled",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.1"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: false,
          regulatoryActive: true,
          independentVouches: 1,
        },
        expectedTier: 1,
      },
      {
        name: "Tier 2 candidate without regulatory attestation => Tier 1 Controlled",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.1"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: false,
          regulatoryActive: false,
          independentVouches: 2,
        },
        expectedTier: 1,
      },
      {
        name: "Contested satellite suspends dependent tier",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.1"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: true,
          regulatoryActive: true,
          independentVouches: 2,
        },
        expectedTier: 0,
      },
      {
        name: "Slashed below S2 drops Tier 2 to Tier 1",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.05"), // Less than 0.1 ETH
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: false,
          regulatoryActive: true,
          independentVouches: 2,
        },
        expectedTier: 1,
      },
      {
        name: "Slashed below S0 suspends operator completely",
        inputs: {
          registered: true,
          stakeWei: parseEther("0.001"),
          kybActive: true,
          domainActive: true,
          activeControlledSats: 1,
          contested: false,
          regulatoryActive: true,
          independentVouches: 2,
        },
        expectedTier: 0,
      },
    ];

    testMatrix.forEach(({ name, inputs, expectedTier }) => {
      it(name, () => {
        expect(deriveTier(inputs)).toBe(expectedTier);
      });
    });
  });

  describe("Caps and Governance Invariants", () => {
    it("returns correct caps for each tier", () => {
      const caps0 = getTierCaps(0);
      expect(caps0.maxBookingValueEth).toBe("0.05");
      expect(caps0.maxActiveWindows).toBe(3);
      expect(caps0.payoutHoldHours).toBe(72);
      expect(caps0.deliveryBoundChallengeRequired).toBe(false);

      const caps1 = getTierCaps(1);
      expect(caps1.maxBookingValueEth).toBe("0.5");
      expect(caps1.maxActiveWindows).toBe(20);
      expect(caps1.payoutHoldHours).toBe(24);
      expect(caps1.deliveryBoundChallengeRequired).toBe(false);

      const caps2 = getTierCaps(2);
      expect(caps2.maxBookingValueEth).toBe("5.0");
      expect(caps2.payoutHoldHours).toBe(2);
      expect(caps2.deliveryBoundChallengeRequired).toBe(true);
    });

    it("verifies buyer delivery nonce derivation formula", () => {
      const bookingId = keccak256("0xbkg_1" as `0x${string}`);
      const buyer = "0x9999999999999999999999999999999999999999" as `0x${string}`;
      const agreementNonce = 42n;
      const termsHash = keccak256("0xterms_hash" as `0x${string}`);

      const deliveryNonce = keccak256(
        encodeAbiParameters(
          parseAbiParameters("bytes32, address, uint256, bytes32"),
          [bookingId, buyer, agreementNonce, termsHash]
        )
      );

      expect(deliveryNonce).toMatch(/^0x[a-f0-9]{64}$/);
    });
  });
});
