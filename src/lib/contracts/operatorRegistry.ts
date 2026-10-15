/**
 * OperatorRegistry ABI, EIP-712 Types, and Helper Functions
 */

export const OPERATOR_REGISTRY_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "admin", type: "address", internalType: "address" },
      { name: "arbiter", type: "address", internalType: "address" },
      { name: "_attestationRegistry", type: "address", internalType: "address" },
      { name: "_compensationPool", type: "address", internalType: "address" },
      { name: "initialAttesters", type: "address[]", internalType: "address[]" },
      { name: "initialIndependents", type: "bool[]", internalType: "bool[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "OPERATOR_CLAIM_TYPEHASH",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "register",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stake",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "requestUnstake",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addAttester",
    inputs: [
      { name: "attester", type: "address", internalType: "address" },
      { name: "independent", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeAttester",
    inputs: [{ name: "attester", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setKindThreshold",
    inputs: [
      { name: "kind", type: "uint8", internalType: "uint8" },
      { name: "n", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitOperatorClaim",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "noradId", type: "uint32", internalType: "uint32" },
      { name: "kind", type: "uint8", internalType: "uint8" },
      { name: "evidenceHash", type: "bytes32", internalType: "bytes32" },
      { name: "expiry", type: "uint64", internalType: "uint64" },
      { name: "signatures", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "openControlChallenge",
    inputs: [{ name: "noradId", type: "uint32", internalType: "uint32" }],
    outputs: [
      { name: "challengeId", type: "bytes32", internalType: "bytes32" },
      { name: "nonce", type: "bytes32", internalType: "bytes32" },
      { name: "deadline", type: "uint64", internalType: "uint64" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "confirmControlProof",
    inputs: [{ name: "challengeId", type: "bytes32", internalType: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contestClaim",
    inputs: [
      { name: "noradId", type: "uint32", internalType: "uint32" },
      { name: "challengeId", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveContest",
    inputs: [
      { name: "noradId", type: "uint32", internalType: "uint32" },
      { name: "winner", type: "address", internalType: "address" },
      { name: "clearBoth", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "slash",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "reasonCode", type: "uint8", internalType: "uint8" },
      { name: "evidenceHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tierOf",
    inputs: [{ name: "operator", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "explainTier",
    inputs: [{ name: "operator", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct OperatorRegistry.TierExplanation",
        components: [
          { name: "registered", type: "bool", internalType: "bool" },
          { name: "stakeAmount", type: "uint256", internalType: "uint256" },
          { name: "hasMinStakeT0", type: "bool", internalType: "bool" },
          { name: "hasMinStakeT2", type: "bool", internalType: "bool" },
          { name: "kybMet", type: "bool", internalType: "bool" },
          { name: "kybExpiry", type: "uint64", internalType: "uint64" },
          { name: "kybAttesters", type: "address[]", internalType: "address[]" },
          { name: "domainMet", type: "bool", internalType: "bool" },
          { name: "domainExpiry", type: "uint64", internalType: "uint64" },
          { name: "domainAttesters", type: "address[]", internalType: "address[]" },
          { name: "controlledSatelliteCount", type: "uint32", internalType: "uint32" },
          { name: "activeControlledNoradIds", type: "uint32[]", internalType: "uint32[]" },
          { name: "hasUnresolvedContest", type: "bool", internalType: "bool" },
          { name: "regulatoryMet", type: "bool", internalType: "bool" },
          { name: "regulatoryExpiry", type: "uint64", internalType: "uint64" },
          { name: "regulatoryAttesters", type: "address[]", internalType: "address[]" },
          { name: "vouchCount", type: "uint32", internalType: "uint32" },
          { name: "vouchAttesters", type: "address[]", internalType: "address[]" },
          { name: "currentTier", type: "uint8", internalType: "uint8" },
          { name: "isSuspended", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "capsOf",
    inputs: [{ name: "tier", type: "uint8", internalType: "uint8" }],
    outputs: [
      { name: "maxBookingValueWei", type: "uint256", internalType: "uint256" },
      { name: "maxActiveWindows", type: "uint32", internalType: "uint32" },
      { name: "payoutHoldSeconds", type: "uint32", internalType: "uint32" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "isControlled",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "noradId", type: "uint32", internalType: "uint32" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakes",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalStaked",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRegistered",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "domainSeparator",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
] as const;

export const EIP712_OPERATOR_CLAIM_TYPES = {
  OperatorClaim: [
    { name: "operator", type: "address" },
    { name: "noradId", type: "uint32" },
    { name: "kind", type: "uint8" },
    { name: "evidenceHash", type: "bytes32" },
    { name: "expiry", type: "uint64" },
  ],
} as const;

export function getOperatorDomain(verifyingContract: `0x${string}`, chainId: number = 11155111) {
  return {
    name: "DSRM-OperatorRegistry",
    version: "1",
    chainId: BigInt(chainId),
    verifyingContract,
  } as const;
}
