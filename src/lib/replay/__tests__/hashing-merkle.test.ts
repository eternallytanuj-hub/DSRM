import { describe, it, expect } from "vitest";
import * as crypto from "node:crypto";
import {
  buildLeafPreimage,
  computeLeafHash,
  computeNodeHash,
  buildMerkleTree,
  generateMerkleProof,
  verifyMerkleProof,
} from "../merkle";
import { bytesToHex, sha256 } from "../hashing";
import type { TelemetryFrame } from "../types";

// Independent reference implementation using node:crypto for cross-checking
function referenceLeafHash(tsMs: number, hex: string): Buffer {
  const frameBytes = Buffer.from(hex, "hex");
  const prefix = Buffer.from([0x00]);
  const tsBuf = Buffer.alloc(8);
  tsBuf.writeBigUInt64BE(BigInt(tsMs), 0);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(frameBytes.length, 0);

  const preimage = Buffer.concat([prefix, tsBuf, lenBuf, frameBytes]);
  return crypto.createHash("sha256").update(preimage).digest();
}

function referenceNodeHash(left: Buffer, right: Buffer): Buffer {
  const prefix = Buffer.from([0x01]);
  const preimage = Buffer.concat([prefix, left, right]);
  return crypto.createHash("sha256").update(preimage).digest();
}

describe("Cryptographic Hashing & Merkle Tree Engine", () => {
  const mockFrames: TelemetryFrame[] = [
    { index: 0, tsMs: 1716151630000, hex: "2e31000000010f3c073a" },
    { index: 1, tsMs: 1716151636000, hex: "2e31000100070f400740" },
    { index: 2, tsMs: 1716151642000, hex: "2e310002000d0f440742" },
    { index: 3, tsMs: 1716151648000, hex: "2e31000300130f480746" },
    { index: 4, tsMs: 1716151654000, hex: "2e31000400190f4a0748" },
    { index: 5, tsMs: 1716151660000, hex: "2e310005001f0f4c074a" },
    { index: 6, tsMs: 1716151666000, hex: "2e31000600250f4e074c" },
  ];

  it("cross-checks leaf hash against independent node:crypto reference", async () => {
    const frame = mockFrames[0];
    const leaf = await computeLeafHash(frame);
    const refLeaf = referenceLeafHash(frame.tsMs, frame.hex);

    expect(bytesToHex(leaf)).toBe("0x" + refLeaf.toString("hex"));
  });

  it("cross-checks node hash against independent node:crypto reference", async () => {
    const left = await computeLeafHash(mockFrames[0]);
    const right = await computeLeafHash(mockFrames[1]);

    const node = await computeNodeHash(left, right);
    const refNode = referenceNodeHash(Buffer.from(left), Buffer.from(right));

    expect(bytesToHex(node)).toBe("0x" + refNode.toString("hex"));
  });

  it("handles odd-node promotion cases: 1, 2, 3, 5, 7 leaves", async () => {
    const testCounts = [1, 2, 3, 5, 7];

    for (const count of testCounts) {
      const subset = mockFrames.slice(0, count);
      const tree = await buildMerkleTree(subset);
      const rootHex = tree.rootHex;

      expect(rootHex.startsWith("0x")).toBe(true);
      expect(rootHex.length).toBe(66);

      // Verify every leaf in this subset can generate a valid proof
      for (let i = 0; i < count; i++) {
        const proof = await generateMerkleProof(subset, i);
        const valid = await verifyMerkleProof(proof.leafHash, proof.steps, rootHex);
        expect(valid).toBe(true);
      }
    }
  });

  it("fails verification if root or sibling hash is modified", async () => {
    const subset = mockFrames.slice(0, 5);
    const proof = await generateMerkleProof(subset, 2);

    // Tampered root
    const badRoot = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
    const validBadRoot = await verifyMerkleProof(proof.leafHash, proof.steps, badRoot);
    expect(validBadRoot).toBe(false);

    // Tampered step sibling
    if (proof.steps.length > 0) {
      const tamperedSteps = JSON.parse(JSON.stringify(proof.steps));
      tamperedSteps[0].siblingHash = badRoot;
      const validTamperedStep = await verifyMerkleProof(proof.leafHash, tamperedSteps, proof.rootHash);
      expect(validTamperedStep).toBe(false);
    }
  });

  it("detects single-byte payload tamper in Merkle proof", async () => {
    const originalFrame = mockFrames[2];
    const tamperedFrame: TelemetryFrame = {
      ...originalFrame,
      hex: "ff" + originalFrame.hex.slice(2), // 1 byte flipped
    };

    const tree = await buildMerkleTree(mockFrames);
    const tamperedLeafHash = await computeLeafHash(tamperedFrame);
    const tamperedLeafHex = bytesToHex(tamperedLeafHash);

    // Proof generated with original path, tested with tampered leaf hash
    const proof = await generateMerkleProof(mockFrames, 2);
    const valid = await verifyMerkleProof(tamperedLeafHex, proof.steps, tree.rootHex);
    expect(valid).toBe(false);
  });

  it("throws error when attempting to build tree over empty frames", async () => {
    await expect(buildMerkleTree([])).rejects.toThrowError(/cannot be empty/);
  });

  it("asserts browser and Node environment parity on shared vector", async () => {
    const frame: TelemetryFrame = {
      index: 0,
      tsMs: 1716151630000,
      hex: "2e3100000001",
    };

    const hash1 = await computeLeafHash(frame);
    const hash2 = await sha256(buildLeafPreimage(frame).preimage);
    const expectedHex = "0x03186b8adab896131521d050f178cb9ba7c4e21e12c3b25c214bec445eb7a1f5";

    expect(bytesToHex(hash1)).toBe(bytesToHex(hash2));
    expect(bytesToHex(hash1)).toBe(expectedHex);
  });
});
