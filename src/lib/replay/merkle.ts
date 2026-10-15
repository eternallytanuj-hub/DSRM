/**
 * Telemetry Merkle Tree Implementation
 * Exact schema:
 * - leaf = SHA-256(0x00 || uint64_be(tsMs) || uint32_be(frameByteLength) || frameBytes)
 * - node = SHA-256(0x01 || left || right)
 * - levels are built left to right; an odd last node is PROMOTED unchanged to the next level
 * - proof = ordered list of { siblingHash, side: "left" | "right" }
 * - root over frames in sorted order; an empty frame list is an error
 */

import { bytesToHex, hexToBytes, sha256 } from "./hashing";
import type {
  MerkleLeafInfo,
  MerkleProof,
  MerkleProofStep,
  TelemetryFrame,
} from "./types";

/**
 * Builds the byte preimage for a leaf node.
 */
export function buildLeafPreimage(frame: TelemetryFrame): {
  preimage: Uint8Array;
  frameBytes: Uint8Array;
} {
  const frameBytes = hexToBytes(frame.hex);
  // 1 byte prefix (0x00) + 8 bytes uint64_be + 4 bytes uint32_be + frameBytes
  const preimage = new Uint8Array(1 + 8 + 4 + frameBytes.length);
  const view = new DataView(preimage.buffer, preimage.byteOffset, preimage.byteLength);

  view.setUint8(0, 0x00);
  view.setBigUint64(1, BigInt(frame.tsMs), false);
  view.setUint32(9, frameBytes.length, false);
  preimage.set(frameBytes, 13);

  return { preimage, frameBytes };
}

/**
 * Computes the hash of a single frame leaf.
 */
export async function computeLeafHash(frame: TelemetryFrame): Promise<Uint8Array> {
  const { preimage } = buildLeafPreimage(frame);
  return await sha256(preimage);
}

/**
 * Computes internal node hash: SHA-256(0x01 || left || right).
 */
export async function computeNodeHash(
  left: Uint8Array,
  right: Uint8Array
): Promise<Uint8Array> {
  const nodePreimage = new Uint8Array(1 + 32 + 32);
  nodePreimage[0] = 0x01;
  nodePreimage.set(left, 1);
  nodePreimage.set(right, 33);
  return await sha256(nodePreimage);
}

export interface MerkleTreeData {
  leaves: Uint8Array[];
  levels: Uint8Array[][];
  root: Uint8Array;
  rootHex: `0x${string}`;
}

/**
 * Constructs the complete Merkle tree over sorted telemetry frames.
 * Throws if frames array is empty.
 */
export async function buildMerkleTree(
  frames: TelemetryFrame[]
): Promise<MerkleTreeData> {
  if (!frames || frames.length === 0) {
    throw new Error("Merkle tree error: frames array cannot be empty.");
  }

  // Compute leaf hashes in order
  const leaves: Uint8Array[] = [];
  for (let i = 0; i < frames.length; i++) {
    const leaf = await computeLeafHash(frames[i]);
    leaves.push(leaf);
  }

  const levels: Uint8Array[][] = [leaves];
  let currentLevel = leaves;

  while (currentLevel.length > 1) {
    const nextLevel: Uint8Array[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const parent = await computeNodeHash(currentLevel[i], currentLevel[i + 1]);
        nextLevel.push(parent);
      } else {
        // Odd node promoted unchanged
        nextLevel.push(currentLevel[i]);
      }
    }
    levels.push(nextLevel);
    currentLevel = nextLevel;
  }

  const root = currentLevel[0];
  const rootHex = bytesToHex(root);

  return {
    leaves,
    levels,
    root,
    rootHex,
  };
}

/**
 * Computes the root hash of the Merkle tree for a list of frames.
 */
export async function computeMerkleRoot(
  frames: TelemetryFrame[]
): Promise<`0x${string}`> {
  const tree = await buildMerkleTree(frames);
  return tree.rootHex;
}

/**
 * Generates an inclusion proof for a frame at targetIndex.
 */
export async function generateMerkleProof(
  frames: TelemetryFrame[],
  targetIndex: number
): Promise<MerkleProof> {
  if (targetIndex < 0 || targetIndex >= frames.length) {
    throw new Error(
      `Index out of bounds: requested ${targetIndex}, total frames ${frames.length}`
    );
  }

  const tree = await buildMerkleTree(frames);
  const steps: MerkleProofStep[] = [];
  let idx = targetIndex;

  for (let levelIdx = 0; levelIdx < tree.levels.length - 1; levelIdx++) {
    const level = tree.levels[levelIdx];
    if (idx % 2 === 0) {
      // Current node is on the left
      if (idx + 1 < level.length) {
        steps.push({
          siblingHash: bytesToHex(level[idx + 1]),
          side: "right",
        });
      }
      // If idx + 1 >= level.length, node was odd and promoted without sibling
    } else {
      // Current node is on the right
      steps.push({
        siblingHash: bytesToHex(level[idx - 1]),
        side: "left",
      });
    }
    idx = Math.floor(idx / 2);
  }

  const leafHash = bytesToHex(tree.leaves[targetIndex]);

  return {
    frameIndex: targetIndex,
    leafHash,
    rootHash: tree.rootHex,
    steps,
  };
}

/**
 * Verifies a Merkle proof in browser or Node using WebCrypto.
 * Returns true if the recomputed root matches expectedRoot.
 */
export async function verifyMerkleProof(
  leafHashHex: `0x${string}`,
  steps: MerkleProofStep[],
  expectedRootHex: `0x${string}`
): Promise<boolean> {
  let current = hexToBytes(leafHashHex);

  for (const step of steps) {
    const sibling = hexToBytes(step.siblingHash);
    if (step.side === "left") {
      current = await computeNodeHash(sibling, current);
    } else {
      current = await computeNodeHash(current, sibling);
    }
  }

  const computedRoot = bytesToHex(current).toLowerCase();
  return computedRoot === expectedRootHex.toLowerCase();
}

/**
 * Extracts leaf details for inspector display.
 */
export function getMerkleLeafInfo(frame: TelemetryFrame): MerkleLeafInfo {
  const { preimage, frameBytes } = buildLeafPreimage(frame);
  const prefixHex = bytesToHex(preimage.slice(0, 13));
  return {
    index: frame.index,
    tsMs: frame.tsMs,
    byteLength: frameBytes.length,
    leafHash: "0x", // Populated asynchronously when inspected
    prefixHex,
  };
}
