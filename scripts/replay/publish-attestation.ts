/**
 * Publish Telemetry Attestation on Sepolia AttestationRegistry
 * 
 * Usage:
 *   export NEXT_PUBLIC_ATTESTATION_REGISTRY="0x..."
 *   export SEPOLIA_RPC="https://..."
 *   export ATTESTER_KEY_1="0x..."
 *   export ATTESTER_KEY_2="0x..."
 *   npx tsx scripts/replay/publish-attestation.ts <observationId>
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  stringToBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import {
  ATTESTATION_REGISTRY_ABI,
  EIP712_ATTESTATION_TYPES,
  getAttestationDomain,
} from "../../src/lib/contracts/attestationRegistry";
import { computeBundleHash } from "../../src/lib/replay/hashing";
import { buildMerkleTree } from "../../src/lib/replay/merkle";
import { computeScoring } from "../../src/lib/replay/scoring";
import { verifyPassGeometry } from "../../src/lib/replay/geometry";
import type { EvidenceBundle } from "../../src/lib/replay/types";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx scripts/replay/publish-attestation.ts <observationId>");
    process.exit(1);
  }

  const obsId = args[0];
  const registryAddress = (process.env.NEXT_PUBLIC_ATTESTATION_REGISTRY ||
    process.env.ATTESTATION_REGISTRY_ADDRESS) as `0x${string}`;
  const rpcUrl =
    process.env.SEPOLIA_RPC ||
    process.env.NEXT_PUBLIC_SEPOLIA_RPC ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  if (!registryAddress) {
    throw new Error("Missing NEXT_PUBLIC_ATTESTATION_REGISTRY environment variable.");
  }

  // Load bundle from public/replay/<obsId>/bundle.json
  const bundleFilePath = path.resolve(process.cwd(), `public/replay/${obsId}/bundle.json`);
  const raw = await fs.readFile(bundleFilePath, "utf-8");
  const bundle: EvidenceBundle = JSON.parse(raw);

  console.log(`[PUBLISH] Independently re-verifying bundle ${bundle.bundleId}...`);

  // 1. Recompute bundleHash
  const bundleHash = await computeBundleHash(bundle);

  // 2. Recompute Merkle root
  const tree = await buildMerkleTree(bundle.frames);
  const merkleRoot = tree.rootHex;

  // 3. Recompute geometry and duration
  const geom = verifyPassGeometry(bundle);
  if (!geom.passIntervalOverlaps || !geom.framesWithinInterval || !geom.maxElevationMatch) {
    throw new Error("Pass geometry verification failed. Aborting on-chain attestation.");
  }

  // 4. Recompute score
  const scoring = computeScoring(bundle, geom.predictedDurationMs);

  console.log(`[PUBLISH] Recomputed bundleHash: ${bundleHash}`);
  console.log(`[PUBLISH] Recomputed merkleRoot: ${merkleRoot}`);
  console.log(`[PUBLISH] Recomputed D: ${scoring.dBps} bps (tier: ${scoring.tier})`);

  // Simulated CID or IPFS CID
  const cid = `bafybeig${bundleHash.slice(2, 54)}`;
  const cidHash = keccak256(stringToBytes(cid));

  // Collect attester keys
  const attesterKeys: `0x${string}`[] = [];
  let i = 1;
  while (process.env[`ATTESTER_KEY_${i}`]) {
    attesterKeys.push(process.env[`ATTESTER_KEY_${i}`] as `0x${string}`);
    i++;
  }

  if (attesterKeys.length === 0) {
    throw new Error("No attester private keys provided in environment (ATTESTER_KEY_1..N).");
  }

  console.log(`[PUBLISH] Signing with ${attesterKeys.length} attester key(s)...`);

  const domain = getAttestationDomain(registryAddress, sepolia.id);
  const message = {
    bookingId: bundle.booking.bookingId,
    bundleHash,
    merkleRoot,
    dBps: scoring.dBps,
    scoringVersion: scoring.version,
    cidHash,
  };

  const signatures: `0x${string}`[] = [];
  const signerAccounts = [];

  for (const privKey of attesterKeys) {
    const account = privateKeyToAccount(privKey);
    signerAccounts.push(account);
    const sig = await account.signTypedData({
      domain,
      types: EIP712_ATTESTATION_TYPES,
      primaryType: "Attestation",
      message,
    });
    signatures.push(sig);
    console.log(`  Signed by attester: ${account.address}`);
  }

  // Submit on-chain via wallet client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });
  console.log(`[PUBLISH] Connected to chain ${publicClient.chain.id}`);

  const walletClient = createWalletClient({
    account: signerAccounts[0],
    chain: sepolia,
    transport: http(rpcUrl),
  });

  console.log(`[PUBLISH] Submitting attestation to contract ${registryAddress}...`);

  const txHash = await walletClient.writeContract({
    address: registryAddress,
    abi: ATTESTATION_REGISTRY_ABI,
    functionName: "submitAttestation",
    args: [
      bundle.booking.bookingId,
      bundleHash,
      merkleRoot,
      scoring.dBps,
      scoring.version,
      cid,
      signatures,
    ],
  });

  console.log(`\n==================================================`);
  console.log(`[SUCCESS] Attestation submitted on Sepolia!`);
  console.log(`Tx Hash: ${txHash}`);
  console.log(`Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);
  console.log(`==================================================`);

  console.log(`\n--- PIN-THIS-CID INSTRUCTIONS ---`);
  console.log(`CID: ${cid}`);
  console.log(`To pin this evidence bundle to IPFS:`);
  console.log(`1. Using any IPFS pinning provider (e.g. Pinata, Web3.Storage, or local ipfs node):`);
  console.log(`   ipfs add public/replay/${obsId}/bundle.json`);
  console.log(`2. Verify the gateway URL:`);
  console.log(`   https://ipfs.io/ipfs/${cid}`);
}

main().catch((err) => {
  console.error("[PUBLISH ERROR]", err);
  process.exit(1);
});
