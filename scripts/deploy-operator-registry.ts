/**
 * Deploy Script for OperatorRegistry on Sepolia
 * Supports both REAL deployment and DEMO deployment with separate attester keys.
 * 
 * Usage for Real Deployment:
 *   export SEPOLIA_RPC="https://ethereum-sepolia-rpc.publicnode.com"
 *   export DEPLOYER_PRIVATE_KEY="0x..."
 *   export ATTESTATION_REGISTRY_ADDRESS="0x..."
 *   export ARBITER_ADDRESS="0x..."
 *   export COMPENSATION_POOL_ADDRESS="0x..."
 *   export INITIAL_ATTESTER_1="0x..."
 *   export INITIAL_ATTESTER_1_INDEPENDENT="false"
 *   export INITIAL_ATTESTER_2="0x..."
 *   export INITIAL_ATTESTER_2_INDEPENDENT="true"
 *   npx tsx scripts/deploy-operator-registry.ts
 * 
 * Usage for Demo Deployment (DEMO_MODE=true):
 *   export IS_DEMO_DEPLOYMENT="true"
 *   export SEPOLIA_RPC="https://ethereum-sepolia-rpc.publicnode.com"
 *   export DEPLOYER_PRIVATE_KEY="0x..."
 *   export DEMO_ATTESTATION_REGISTRY_ADDRESS="0x..."
 *   npx tsx scripts/deploy-operator-registry.ts
 */

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { OPERATOR_REGISTRY_ABI } from "../src/lib/contracts/operatorRegistry";

async function main() {
  const isDemo = process.env.IS_DEMO_DEPLOYMENT === "true";
  const rpcUrl = process.env.SEPOLIA_RPC || process.env.NEXT_PUBLIC_SEPOLIA_RPC;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;

  if (!rpcUrl) {
    throw new Error("Missing SEPOLIA_RPC environment variable.");
  }
  if (!privateKey) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY environment variable.");
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`[DEPLOY] Mode: ${isDemo ? "DEMO DEPLOYMENT" : "REAL PRODUCTION/STAGING"}`);
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

  const adminAddress = account.address;
  const arbiterAddress = (process.env.ARBITER_ADDRESS || account.address) as `0x${string}`;
  const attestationRegistry = (
    isDemo
      ? process.env.DEMO_ATTESTATION_REGISTRY_ADDRESS || "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735"
      : process.env.ATTESTATION_REGISTRY_ADDRESS || "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735"
  ) as `0x${string}`;

  const compensationPool = (process.env.COMPENSATION_POOL_ADDRESS || account.address) as `0x${string}`;

  // Attesters configuration
  let attesters: `0x${string}`[] = [];
  let independents: boolean[] = [];

  if (isDemo) {
    // Demo deployment attesters (clearly labeled simulated nodes)
    attesters = [
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
      "0x3333333333333333333333333333333333333333",
    ];
    independents = [false, true, true];
  } else {
    const a1 = (process.env.INITIAL_ATTESTER_1 || "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176") as `0x${string}`;
    const a2 = (process.env.INITIAL_ATTESTER_2 || "0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7") as `0x${string}`;
    attesters = [a1, a2];
    independents = [
      process.env.INITIAL_ATTESTER_1_INDEPENDENT === "true",
      process.env.INITIAL_ATTESTER_2_INDEPENDENT === "true",
    ];
  }

  console.log(`[DEPLOY] Admin: ${adminAddress}`);
  console.log(`[DEPLOY] Arbiter: ${arbiterAddress}`);
  console.log(`[DEPLOY] AttestationRegistry: ${attestationRegistry}`);
  console.log(`[DEPLOY] CompensationPool: ${compensationPool}`);
  console.log(`[DEPLOY] Initial Attesters:`, attesters);
  console.log(`[DEPLOY] Independents flags:`, independents);
  console.log(`[DEPLOY] Target Network: Sepolia (chainId: ${sepolia.id})`);

  console.log("\n=======================================================");
  console.log("To deploy with Foundry CLI:");
  console.log(`forge create contracts/OperatorRegistry.sol:OperatorRegistry \\
  --rpc-url "${rpcUrl}" \\
  --private-key "${privateKey}" \\
  --constructor-args "${adminAddress}" "${arbiterAddress}" "${attestationRegistry}" "${compensationPool}" "[${attesters.map((a) => `\\"${a}\\"`).join(",")}]" "[${independents.join(",")}]"`);
  console.log("=======================================================\n");

  console.log("NOTE: When deployed, update environment variable:");
  if (isDemo) {
    console.log("NEXT_PUBLIC_DEMO_OPERATOR_REGISTRY=<deployed_address>");
  } else {
    console.log("NEXT_PUBLIC_OPERATOR_REGISTRY=<deployed_address>");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
