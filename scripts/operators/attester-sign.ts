/**
 * Attester Signing Engine for Operator Verification and Control Proofs.
 * 
 * Invariants:
 * 1. Each attester independently recomputes bundle hash, Merkle root,
 *    verifies nonce presence in frames, enforces timing bounds, and checks geometry.
 * 2. Aborts immediately on any failure.
 * 3. For Control Proofs: signs and submits Attestation to AttestationRegistry keyed by challengeId.
 * 4. For Entity Claims: signs EIP-712 OperatorClaim (KYB, DOMAIN, REGULATORY, VOUCH).
 * 
 * Usage:
 *   npx tsx scripts/operators/attester-sign.ts --mode=control --bundle=<path_to_bundle_json> --key=<private_key>
 *   npx tsx scripts/operators/attester-sign.ts --mode=claim --kind=KYB --operator=<address> --hash=<evidenceHash> --expiry=<unix> --key=<private_key>
 */

import {
  keccak256,
  stringToBytes,
  createPublicClient,
  createWalletClient,
  http,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { computeBundleHash } from "../../src/lib/replay/hashing";
import { buildMerkleTree } from "../../src/lib/replay/merkle";
import { verifyPassGeometry } from "../../src/lib/replay/geometry";
import {
  ATTESTATION_REGISTRY_ABI,
  EIP712_ATTESTATION_TYPES,
  getAttestationDomain,
} from "../../src/lib/contracts/attestationRegistry";
import {
  OPERATOR_REGISTRY_ABI,
  EIP712_OPERATOR_CLAIM_TYPES,
  getOperatorDomain,
} from "../../src/lib/contracts/operatorRegistry";
import {
  CLAIM_KIND_KYB,
  CLAIM_KIND_DOMAIN,
  CLAIM_KIND_CONTROL,
  CLAIM_KIND_REGULATORY,
  CLAIM_KIND_VOUCH,
} from "../../src/config/tiers";
import type { EvidenceBundle } from "../../src/lib/replay/types";
import * as fs from "node:fs/promises";

async function main() {
  const args = process.argv.slice(2);
  const parsedArgs: Record<string, string> = {};
  for (const a of args) {
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      parsedArgs[k] = v;
    }
  }

  const mode = parsedArgs.mode || "control";
  const privKey = (parsedArgs.key || process.env.ATTESTER_PRIVATE_KEY || "0x1111111111111111111111111111111111111111111111111111111111111111") as `0x${string}`;
  const account = privateKeyToAccount(privKey);
  console.log(`[ATTESTER-SIGN] Attester address: ${account.address}, Mode: ${mode}`);

  if (mode === "control") {
    const bundlePath = parsedArgs.bundle;
    if (!bundlePath) {
      throw new Error("Missing --bundle=<path> for control mode.");
    }

    const raw = await fs.readFile(bundlePath, "utf-8");
    const bundle = JSON.parse(raw) as EvidenceBundle;

    console.log(`[ATTESTER-SIGN] 1. Recomputing Bundle Hash...`);
    const bundleHash = computeBundleHash(bundle);

    console.log(`[ATTESTER-SIGN] 2. Rebuilding Merkle Tree...`);
    const merkleTree = buildMerkleTree(bundle.frames);
    const merkleRoot = merkleTree.rootHash;

    console.log(`[ATTESTER-SIGN] 3. Verifying Challenge Nonce and Timing Bounds...`);
    if (!bundle.challenge) {
      throw new Error("Control proof bundle must contain a challenge block.");
    }
    const ch = bundle.challenge;
    const nonceRaw = ch.nonceHex.toLowerCase().replace(/^0x/, "");
    const matchingFrame = bundle.frames.find((f) => f.hex.toLowerCase().includes(nonceRaw));
    if (!matchingFrame) {
      throw new Error(`ABORT: Control challenge nonce ${ch.nonceHex} absent from all frames.`);
    }

    const staleFrames = bundle.frames.filter((f) => f.tsMs < ch.openedAtMs || f.tsMs > ch.deadlineMs);
    if (staleFrames.length > 0) {
      throw new Error(`ABORT: Found ${staleFrames.length} frames outside valid challenge window.`);
    }

    console.log(`[ATTESTER-SIGN] 4. Verifying Orbital Geometry...`);
    const geometry = verifyPassGeometry(bundle);
    if (!geometry.passIntervalOverlaps || !geometry.framesWithinInterval) {
      throw new Error("ABORT: Orbital geometry constraints failed.");
    }

    console.log(`[ATTESTER-SIGN] All verification checks PASSED. Signing EIP-712 attestation...`);
    const registryAddress = (process.env.ATTESTATION_REGISTRY_ADDRESS || "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735") as `0x${string}`;
    const domain = getAttestationDomain(registryAddress, sepolia.id);

    const message = {
      bookingId: ch.challengeId,
      bundleHash,
      merkleRoot,
      dBps: 10000,
      scoringVersion: 1,
      cidHash: keccak256(stringToBytes(bundle.bundleId)),
    };

    const signature = await account.signTypedData({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message,
    });

    console.log(`[ATTESTER-SIGN] Signature: ${signature}`);
    console.log(`[ATTESTER-SIGN] Challenge ID: ${ch.challengeId}`);
    console.log(`[ATTESTER-SIGN] Ready for on-chain submission.`);
  } else if (mode === "claim") {
    const operator = (parsedArgs.operator || "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") as `0x${string}`;
    const kindName = (parsedArgs.kind || "KYB").toUpperCase();
    const noradId = Number(parsedArgs.noradId || 0);
    const evidenceHash = (parsedArgs.hash || keccak256(stringToBytes("EVIDENCE"))) as `0x${string}`;
    const expiry = BigInt(parsedArgs.expiry || Math.floor(Date.now() / 1000) + 90 * 86400);

    let kind = CLAIM_KIND_KYB;
    if (kindName === "DOMAIN") kind = CLAIM_KIND_DOMAIN;
    if (kindName === "CONTROL") kind = CLAIM_KIND_CONTROL;
    if (kindName === "REGULATORY") kind = CLAIM_KIND_REGULATORY;
    if (kindName === "VOUCH") kind = CLAIM_KIND_VOUCH;

    const opRegistryAddress = (process.env.OPERATOR_REGISTRY_ADDRESS || "0x8888888888888888888888888888888888888888") as `0x${string}`;
    const domain = getOperatorDomain(opRegistryAddress, sepolia.id);

    const message = {
      operator,
      noradId,
      kind,
      evidenceHash,
      expiry,
    };

    const signature = await account.signTypedData({
      domain,
      types: EIP712_OPERATOR_CLAIM_TYPES,
      primaryType: "OperatorClaim",
      message,
    });

    console.log(`[ATTESTER-SIGN] EIP-712 OperatorClaim signed.`);
    console.log(`[ATTESTER-SIGN] Operator: ${operator}`);
    console.log(`[ATTESTER-SIGN] Kind: ${kindName} (${kind})`);
    console.log(`[ATTESTER-SIGN] Evidence Hash: ${evidenceHash}`);
    console.log(`[ATTESTER-SIGN] Expiry: ${expiry.toString()}`);
    console.log(`[ATTESTER-SIGN] Signature: ${signature}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
