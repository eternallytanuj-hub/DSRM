/**
 * Deploy Script for AttestationRegistry on Sepolia
 * 
 * Usage:
 *   export SEPOLIA_RPC="https://ethereum-sepolia-rpc.publicnode.com"
 *   export DEPLOYER_PRIVATE_KEY="0x..."
 *   export INITIAL_ATTESTER_1="0xc25f9F0Ce27A2D248c43563a32cDC4886D069176"
 *   export INITIAL_ATTESTER_2="0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7"
 *   npx tsx scripts/deploy-registry.ts
 */

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { ATTESTATION_REGISTRY_ABI } from "../src/lib/contracts/attestationRegistry";

// Bytecode for AttestationRegistry compiled with solc 0.8.20 + OpenZeppelin 5.6
// For manual deploy with foundry: `forge create AttestationRegistry --rpc-url $SEPOLIA_RPC --private-key $DEPLOYER_PRIVATE_KEY --constructor-args "['0x...']" 2`
async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC || process.env.NEXT_PUBLIC_SEPOLIA_RPC;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;

  if (!rpcUrl) {
    throw new Error("Missing SEPOLIA_RPC environment variable.");
  }
  if (!privateKey) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY environment variable.");
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`[DEPLOY] Deployer address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  });
  console.log(`[DEPLOY] Chain ID: ${publicClient.chain.id}, Wallet account: ${walletClient.account.address}, ABI definitions: ${ATTESTATION_REGISTRY_ABI.length}`);

  const attester1 = (process.env.INITIAL_ATTESTER_1 || account.address) as `0x${string}`;
  const attester2 = (process.env.INITIAL_ATTESTER_2 || "0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7") as `0x${string}`;
  const initialAttesters = [attester1, attester2];
  const initialThreshold = BigInt(2);

  console.log(`[DEPLOY] Initial attesters:`, initialAttesters);
  console.log(`[DEPLOY] Threshold:`, initialThreshold.toString());
  console.log(`[DEPLOY] Target Network: Sepolia (chainId: ${sepolia.id})`);
  console.log("\nNOTE: To deploy with Foundry run:");
  console.log(`forge create contracts/AttestationRegistry.sol:AttestationRegistry \\
  --rpc-url "${rpcUrl}" \\
  --private-key "${privateKey}" \\
  --constructor-args "[${initialAttesters.map(a => `"${a}"`).join(",")}]" ${initialThreshold}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
