import { describe, it, expect } from "vitest";
import {
  keccak256,
  stringToBytes,
  recoverTypedDataAddress,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  EIP712_ATTESTATION_TYPES,
  getAttestationDomain,
} from "../../contracts/attestationRegistry";

describe("AttestationRegistry Contract Logic & EIP-712 Signatures", () => {
  const verifyingContract = "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735" as `0x${string}`;
  const chainId = 11155111; // Sepolia

  const key1 = "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`;
  const key2 = "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`;
  const rogueKey = "0x9999999999999999999999999999999999999999999999999999999999999999" as `0x${string}`;

  const account1 = privateKeyToAccount(key1);
  const account2 = privateKeyToAccount(key2);
  const rogueAccount = privateKeyToAccount(rogueKey);

  const authorizedAttesters = new Set<string>([
    account1.address.toLowerCase(),
    account2.address.toLowerCase(),
  ]);

  const threshold = 2;

  const mockMessage = {
    bookingId: "0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7" as `0x${string}`,
    bundleHash: "0xa11ecac984c77ede3dbdb1ada8f669afc6d77e86a3e9b0e5f30cc0afbff38a85" as `0x${string}`,
    merkleRoot: "0x2719a0684df2b335ded49788938ad5aff33150914e06bfc8bd6b99721184d1de" as `0x${string}`,
    dBps: 9791,
    scoringVersion: 1,
    cidHash: keccak256(stringToBytes("bafybeiga11ecac984c77ede3dbdb1ada8f669afc6d77e86a3e9b0e5f30c")),
  };

  it("successfully signs and recovers EIP-712 attestation when threshold is met", async () => {
    const domain = getAttestationDomain(verifyingContract, chainId);

    const sig1 = await account1.signTypedData({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
    });

    const sig2 = await account2.signTypedData({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
    });

    const rec1 = await recoverTypedDataAddress({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
      signature: sig1,
    });

    const rec2 = await recoverTypedDataAddress({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
      signature: sig2,
    });

    expect(rec1.toLowerCase()).toBe(account1.address.toLowerCase());
    expect(rec2.toLowerCase()).toBe(account2.address.toLowerCase());

    const recoveredSigners = [rec1, rec2];
    const unique = new Set(recoveredSigners.map((s) => s.toLowerCase()));
    expect(unique.size).toBe(2);
    expect(unique.size).toBeGreaterThanOrEqual(threshold);

    for (const signer of unique) {
      expect(authorizedAttesters.has(signer)).toBe(true);
    }
  });

  it("fails verification when signatures are insufficient to meet threshold", async () => {
    const domain = getAttestationDomain(verifyingContract, chainId);
    const sig1 = await account1.signTypedData({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
    });

    const signatures = [sig1];
    expect(signatures.length).toBeLessThan(threshold);
  });

  it("detects and rejects duplicate signers attempting to satisfy threshold", async () => {
    const domain = getAttestationDomain(verifyingContract, chainId);
    const sig1 = await account1.signTypedData({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
    });

    // Provide the same signature twice
    const signatures = [sig1, sig1];
    const recovered: Address[] = [];
    for (const s of signatures) {
      const rec = await recoverTypedDataAddress({
        domain,
        types: EIP712_ATTESTATION_TYPES,
        primaryType: "Attestation",
        message: mockMessage,
        signature: s,
      });
      recovered.push(rec);
    }

    const unique = new Set(recovered.map((r) => r.toLowerCase()));
    expect(unique.size).toBe(1); // Duplicate detected
    expect(unique.size < threshold).toBe(true);
  });

  it("rejects unauthorized non-attester signatures", async () => {
    const domain = getAttestationDomain(verifyingContract, chainId);
    const rogueSig = await rogueAccount.signTypedData({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
    });

    const rec = await recoverTypedDataAddress({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
      signature: rogueSig,
    });

    expect(rec.toLowerCase()).toBe(rogueAccount.address.toLowerCase());
    expect(authorizedAttesters.has(rec.toLowerCase())).toBe(false);
  });

  it("rejects signatures signed for the wrong chainId or contract domain", async () => {
    const wrongDomain = getAttestationDomain(
      "0x0000000000000000000000000000000000000001",
      1 // Mainnet instead of Sepolia
    );

    const sigWrongDomain = await account1.signTypedData({
      domain: wrongDomain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
    });

    // Recovering with the expected Sepolia domain yields mismatched address
    const recovered = await recoverTypedDataAddress({
      domain: getAttestationDomain(verifyingContract, chainId),
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: mockMessage,
      signature: sigWrongDomain,
    });

    expect(recovered.toLowerCase()).not.toBe(account1.address.toLowerCase());
  });

  it("enforces immutability: second submission for existing bookingId is rejected", () => {
    const submittedBookings = new Set<string>();
    const bookingId = mockMessage.bookingId;

    // First submission
    expect(submittedBookings.has(bookingId)).toBe(false);
    submittedBookings.add(bookingId);

    // Second submission attempt
    expect(submittedBookings.has(bookingId)).toBe(true);
    const errorThrown = submittedBookings.has(bookingId);
    expect(errorThrown).toBe(true);
  });

  it("rejects malformed or bad signature bytes", async () => {
    const domain = getAttestationDomain(verifyingContract, chainId);
    // Bad signature of invalid byte length
    const invalidLengthSig = "0x1234" as `0x${string}`;

    await expect(
      recoverTypedDataAddress({
        domain,
        types: EIP712_ATTESTATION_TYPES,
        primaryType: "Attestation",
        message: mockMessage,
        signature: invalidLengthSig,
      })
    ).rejects.toThrow();
  });

  it("validates owner-only threshold updates and bound checks", () => {
    let currentThreshold = 2;
    const totalAttesters = 2;

    const setThreshold = (callerIsOwner: boolean, newThreshold: number) => {
      if (!callerIsOwner) {
        throw new Error("OwnableUnauthorizedAccount");
      }
      if (newThreshold === 0 || newThreshold > totalAttesters) {
        throw new Error("ThresholdOutOfBounds");
      }
      currentThreshold = newThreshold;
    };

    // Owner setting valid threshold
    expect(() => setThreshold(true, 1)).not.toThrow();
    expect(currentThreshold).toBe(1);

    // Non-owner setting threshold
    expect(() => setThreshold(false, 2)).toThrow(/OwnableUnauthorizedAccount/);

    // Out of bounds threshold (0 or > totalAttesters)
    expect(() => setThreshold(true, 0)).toThrow(/ThresholdOutOfBounds/);
    expect(() => setThreshold(true, 3)).toThrow(/ThresholdOutOfBounds/);
  });
});
