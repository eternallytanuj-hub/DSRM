import { describe, it, expect, beforeEach } from "vitest";
import { performCatalogCheck } from "../catalog";
import {
  createDomainChallenge,
  verifyDomainTxtRecord,
  setMockDnsTxtRecord,
  clearMockDnsTxtRecord,
} from "../domain";
import {
  ManualReviewProvider,
  MockKybProvider,
} from "../kyb";
import {
  enforceListingWindowCreation,
  enforceBookingPrepare,
  setActiveWindows,
} from "../capsEnforcement";
import {
  setLocalDemoOperatorState,
  getLocalDemoOperatorState,
  resetDemoOperatorStates,
  derivePureTier,
  TierExplanationState,
} from "../tierService";
import { runVerification } from "../../replay/verify";
import type { EvidenceBundle } from "../../replay/types";
import { keccak256, stringToBytes, parseEther } from "viem";

describe("PHASE B: Backend Services, Invariants & Verification Tests", () => {
  beforeEach(() => {
    resetDemoOperatorStates();
  });

  describe("Catalog Check Service", () => {
    it("handles standard 5-digit NORAD ID (AO-91 #43017)", async () => {
      const res = await performCatalogCheck(43017, "US");
      expect(res.passed).toBe(true);
      expect(res.noradId).toBe(43017);
      expect(res.isPayload).toBe(true);
      expect(res.isOperational).toBe(true);
      expect(res.isDecayed).toBe(false);
      expect(res.countryMatchFlag).toBe(true);
    });

    it("handles 6-digit NORAD ID (>99999) without string truncation", async () => {
      const res = await performCatalogCheck(100234, "IN");
      expect(res.passed).toBe(true);
      expect(res.noradId).toBe(100234);
      expect(typeof res.noradId).toBe("number");
      expect(res.objectName).toBe("DSRM-PATHFINDER-1");
      expect(res.countryMatchFlag).toBe(true);
    });

    it("flags owner-country mismatch for manual review without auto-rejecting", async () => {
      // Satcat owner US, but operator declared FR
      const res = await performCatalogCheck(43017, "FR");
      expect(res.passed).toBe(true); // Does not auto-reject
      expect(res.countryMatchFlag).toBe(false);
      expect(res.warning).toMatch(/Flagged for manual review/);
    });

    it("rejects non-payload space objects (debris/rocket body)", async () => {
      const res = await performCatalogCheck(99992, "CIS");
      expect(res.passed).toBe(false);
      expect(res.isPayload).toBe(false);
      expect(res.rejectionReason).toMatch(/not an operational payload/);
    });

    it("rejects decayed satellites", async () => {
      const res = await performCatalogCheck(99991, "US");
      expect(res.passed).toBe(false);
      expect(res.isDecayed).toBe(true);
      expect(res.rejectionReason).toMatch(/decayed/);
    });
  });

  describe("Domain Binding DNS TXT Resolution", () => {
    const operator = "0x1111111111111111111111111111111111111111" as `0x${string}`;
    const domain = "orbitaldynamics.space";

    it("generates valid DNS TXT challenge specification", () => {
      const ch = createDomainChallenge(operator, domain);
      expect(ch.expectedTxtHost).toBe("_dsrm.orbitaldynamics.space");
      expect(ch.expectedTxtValue).toMatch(/^dsrm-verify:0x1111111111111111111111111111111111111111:orbitaldynamics\.space:[a-f0-9]+$/);
      expect(ch.nonce).toBeDefined();
    });

    it("verifies matching DNS TXT record and computes keccak256 evidence hash", async () => {
      const ch = createDomainChallenge(operator, domain);
      setMockDnsTxtRecord(ch.expectedTxtHost, [ch.expectedTxtValue]);

      const res = await verifyDomainTxtRecord(operator, domain);
      expect(res.verified).toBe(true);
      expect(res.evidenceHash).toBe(keccak256(stringToBytes(domain)));

      clearMockDnsTxtRecord(ch.expectedTxtHost);
    });

    it("fails verification when DNS TXT token contains wrong wallet address", async () => {
      const ch = createDomainChallenge(operator, domain);
      const wrongRecord = `dsrm-verify:0x9999999999999999999999999999999999999999:${domain}:${ch.nonce}`;
      setMockDnsTxtRecord(ch.expectedTxtHost, [wrongRecord]);

      const res = await verifyDomainTxtRecord(operator, domain);
      expect(res.verified).toBe(false);
      expect(res.error).toMatch(/No TXT record at _dsrm\.orbitaldynamics\.space matched/);

      clearMockDnsTxtRecord(ch.expectedTxtHost);
    });
  });

  describe("KYB Providers", () => {
    const operator = "0x1111111111111111111111111111111111111111" as `0x${string}`;

    it("ManualReviewProvider queues review and keeps PII off-chain with strict reference hash", async () => {
      const provider = new ManualReviewProvider();
      const res = await provider.submitReview(operator, {
        legalName: "SatSpace Global Inc",
        jurisdiction: "US-DE",
        registrationNumber: "DE-889922",
        declaredCountry: "US",
        contactEmail: "legal@satspace.com",
        documentHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      });

      expect(res.decision).toBe("PENDING");
      expect(res.referenceHash).toMatch(/^0x[a-f0-9]{64}$/);

      // Admin approves
      const approved = await provider.approveReview(res.referenceHash, "admin-officer-1");
      expect(approved.decision).toBe("APPROVED");
      expect(approved.reviewer).toBe("admin-officer-1");
    });

    it("MockKybProvider provides deterministic mock approval for Judge Demo", async () => {
      const mock = new MockKybProvider();
      const res = await mock.submitReview(operator, {
        legalName: "Demo Ground Operator",
        jurisdiction: "US",
        registrationNumber: "DEMO-01",
        declaredCountry: "US",
        contactEmail: "demo@dsrm.io",
        documentHash: "0x00",
      });

      expect(res.decision).toBe("APPROVED");
      expect(res.provider).toBe("mock_kyb");
    });
  });

  describe("Caps Enforcement", () => {
    const operator = "0x3333333333333333333333333333333333333333" as `0x${string}`;

    it("rejects window creation for unregistered or untiered operators", async () => {
      const res = await enforceListingWindowCreation(operator, true);
      expect(res.allowed).toBe(false);
      expect(res.reason).toMatch(/not registered or does not meet Tier 0/);
    });

    it("enforces window cap for Tier 0 Listed (max 3 active windows)", async () => {
      // Set Tier 0 demo state
      setLocalDemoOperatorState(operator, {
        registered: true,
        stakeAmount: "0.01 ETH",
        stakeWei: parseEther("0.01").toString(),
        hasMinStakeT0: true,
        hasMinStakeT2: false,
        kybMet: true,
        kybAttesters: ["0x11"],
        domainMet: true,
        domainAttesters: ["0x22"],
        controlledSatelliteCount: 0,
        activeControlledNoradIds: [],
        hasUnresolvedContest: false,
        regulatoryMet: false,
        regulatoryAttesters: [],
        vouchCount: 0,
        vouchAttesters: [],
        currentTier: 0,
        isSuspended: false,
      });

      setActiveWindows(operator, 3);
      const res = await enforceListingWindowCreation(operator, true);
      expect(res.allowed).toBe(false);
      expect(res.reason).toMatch(/maximum of 3 active windows/);

      // Settle one window
      setActiveWindows(operator, 2);
      const res2 = await enforceListingWindowCreation(operator, true);
      expect(res2.allowed).toBe(true);
    });

    it("enforces booking value cap and determines payout hold", async () => {
      // Tier 0 has 0.05 ETH cap and 72h payout hold
      const resTooHigh = await enforceBookingPrepare(operator, parseEther("0.06"), true);
      expect(resTooHigh.allowed).toBe(false);
      expect(resTooHigh.reason).toMatch(/exceeds the 0.05 ETH cap/);

      const resAllowed = await enforceBookingPrepare(operator, parseEther("0.04"), true);
      expect(resAllowed.allowed).toBe(true);
      expect(resAllowed.payoutHoldHours).toBe(72);
      expect(resAllowed.payoutHoldSeconds).toBe(259200);
      expect(resAllowed.deliveryBoundChallengeRequired).toBe(false);
    });
  });

  describe("Replay Verifier Step 8 & Delivery Challenge", () => {
    const baseBundle: EvidenceBundle = {
      schemaVersion: 1,
      bundleId: "test-verifier-bundle",
      source: {
        network: "satnogs",
        observationId: 11726893,
        stationId: 1428,
        stationName: "SatNOGS Athens",
        stationLatMicroDeg: 37983810,
        stationLonMicroDeg: 23727539,
        stationAltM: 120,
        noradId: 43017,
        satelliteName: "AO-91",
        observationUrl: "https://network.satnogs.org",
        dbUrl: "https://db.satnogs.org",
        license: "CC BY-SA 4.0",
        attribution: "SatNOGS",
        fetchedAtMs: 1716153000000,
      },
      tle: {
        line1: "1 43017U 17073E   24140.45678912  .00000854  00000-0  85412-4 0  9993",
        line2: "2 43017  97.7412 215.3412 0245123 180.1234 179.8765 14.81234567345678",
        epochMs: 1716116267000,
        sourceNote: "SatNOGS TLE",
      },
      pass: {
        startMs: 1716151500000,
        endMs: 1716152280000,
        aosMs: 1716151616000,
        losMs: 1716152213000,
        reportedMaxElevationCentiDeg: 5644,
      },
      frames: [
        { index: 0, tsMs: 1716151630000, hex: "2e31000102030405" },
        { index: 1, tsMs: 1716151700000, hex: "2e31000102030406" },
      ],
      series: { snr: null },
      scoring: {
        profile: "public-v1",
        version: 1,
        weightsBps: { contactCoverage: 4000, dataVolume: 3000, frameContinuity: 3000 },
        thresholds: { minElevationCentiDeg: 1000, maxGapMs: 30000 },
      },
      booking: {
        bookingId: "0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7",
        requestedDataBytes: 50,
        requestedWindowStartMs: 1716151500000,
        requestedWindowEndMs: 1716152280000,
        provenance: "simulated",
      },
      provenance: {},
    };

    it("step 8 passes as not applicable when bundle has no delivery or challenge block", async () => {
      const res = await runVerification({ bundle: baseBundle, onlyStepId: "delivery_challenge" });
      expect(res.steps.delivery_challenge.status).toBe("pass");
      expect(res.steps.delivery_challenge.actual).toMatch(/Not applicable: public replay/);
    });

    it("step 8 fails when bundle has delivery challenge but frames do not contain the nonce (passive replay fraud)", async () => {
      const bookingId = "0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7" as `0x${string}`;
      const buyer = "0x1111111111111111111111111111111111111111" as `0x${string}`;
      const agreementNonce = "42";
      const termsHash = keccak256(stringToBytes("TERMS-V1"));

      const { encodeAbiParameters, parseAbiParameters } = await import("viem");
      const deliveryNonce = keccak256(
        encodeAbiParameters(
          parseAbiParameters("bytes32, address, uint256, bytes32"),
          [bookingId, buyer, BigInt(agreementNonce), termsHash]
        )
      );

      const deliveryBundle: EvidenceBundle = {
        ...baseBundle,
        delivery: {
          bookingId,
          buyer,
          agreementNonce,
          termsHash,
          deliveryNonce,
        },
      };

      const res = await runVerification({ bundle: deliveryBundle, onlyStepId: "delivery_challenge" });
      expect(res.steps.delivery_challenge.status).toBe("fail");
      expect(res.steps.delivery_challenge.error).toMatch(/Passive replay fraud detected/);
    });

    it("step 8 passes when frame embeds the cryptographic delivery challenge nonce", async () => {
      const bookingId = "0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7" as `0x${string}`;
      const buyer = "0x1111111111111111111111111111111111111111" as `0x${string}`;
      const agreementNonce = "42";
      const termsHash = keccak256(stringToBytes("TERMS-V1"));

      const { encodeAbiParameters, parseAbiParameters } = await import("viem");
      const deliveryNonce = keccak256(
        encodeAbiParameters(
          parseAbiParameters("bytes32, address, uint256, bytes32"),
          [bookingId, buyer, BigInt(agreementNonce), termsHash]
        )
      );

      const nonceRaw = deliveryNonce.slice(2).toLowerCase();
      const validDeliveryBundle: EvidenceBundle = {
        ...baseBundle,
        frames: [
          { index: 0, tsMs: 1716151630000, hex: `00aabbcc${nonceRaw}ddeeff` },
        ],
        delivery: {
          bookingId,
          buyer,
          agreementNonce,
          termsHash,
          deliveryNonce,
        },
      };

      const res = await runVerification({ bundle: validDeliveryBundle, onlyStepId: "delivery_challenge" });
      expect(res.steps.delivery_challenge.status).toBe("pass");
      expect(res.steps.delivery_challenge.actual).toMatch(/Delivery challenge nonce confirmed in frame #0/);
    });

    it("step 8 detects stale frames outside challenge window for control proofs", async () => {
      const challengeBundle: EvidenceBundle = {
        ...baseBundle,
        frames: [
          { index: 0, tsMs: 1000, hex: "112233deadbeef445566" }, // Stale!
        ],
        challenge: {
          challengeId: keccak256(stringToBytes("CHALLENGE")),
          nonceHex: "deadbeef",
          openedAtMs: 1716151500000,
          deadlineMs: 1716152280000,
        },
      };

      const res = await runVerification({ bundle: challengeBundle, onlyStepId: "delivery_challenge" });
      expect(res.steps.delivery_challenge.status).toBe("fail");
      expect(res.steps.delivery_challenge.error).toMatch(/Tampered or stale timestamps/);
    });
  });

  describe("Real vs Demo Isolation Invariant", () => {
    it("ensures demo state can never alter real tier of any real operator", () => {
      const realOperator = "0x8888888888888888888888888888888888888888";
      const demoOperator = "0x1111111111111111111111111111111111111111";

      setLocalDemoOperatorState(demoOperator, {
        registered: true,
        stakeAmount: "0.2 ETH",
        stakeWei: parseEther("0.2").toString(),
        hasMinStakeT0: true,
        hasMinStakeT2: true,
        kybMet: true,
        kybAttesters: [],
        domainMet: true,
        domainAttesters: [],
        controlledSatelliteCount: 1,
        activeControlledNoradIds: [43017],
        hasUnresolvedContest: false,
        regulatoryMet: true,
        regulatoryAttesters: [],
        vouchCount: 2,
        vouchAttesters: [],
        currentTier: 2,
        isSuspended: false,
      });

      // Real operator state remains null / untiered in real namespace
      expect(getLocalDemoOperatorState(realOperator)).toBeNull();
      expect(derivePureTier(getLocalDemoOperatorState(demoOperator)!)).toBe(2);
    });
  });
});
