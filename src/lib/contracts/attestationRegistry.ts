/**
 * AttestationRegistry ABI and EIP-712 Domain Definitions
 */

export const ATTESTATION_REGISTRY_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "initialAttesters", type: "address[]", internalType: "address[]" },
      { name: "initialThreshold", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ATTESTATION_TYPEHASH",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "submitAttestation",
    inputs: [
      { name: "bookingId", type: "bytes32", internalType: "bytes32" },
      { name: "bundleHash", type: "bytes32", internalType: "bytes32" },
      { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
      { name: "dBps", type: "uint32", internalType: "uint32" },
      { name: "scoringVersion", type: "uint16", internalType: "uint16" },
      { name: "cid", type: "string", internalType: "string" },
      { name: "signatures", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAttestation",
    inputs: [{ name: "bookingId", type: "bytes32", internalType: "bytes32" }],
    outputs: [
      { name: "bundleHash", type: "bytes32", internalType: "bytes32" },
      { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
      { name: "dBps", type: "uint32", internalType: "uint32" },
      { name: "scoringVersion", type: "uint16", internalType: "uint16" },
      { name: "cidHash", type: "bytes32", internalType: "bytes32" },
      { name: "cid", type: "string", internalType: "string" },
      { name: "submittedAt", type: "uint64", internalType: "uint64" },
      { name: "signers", type: "address[]", internalType: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAttester",
    inputs: [{ name: "attester", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAttesters",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "attesterList",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "threshold",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "domainSeparator",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addAttester",
    inputs: [{ name: "attester", type: "address", internalType: "address" }],
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
    name: "setThreshold",
    inputs: [{ name: "newThreshold", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AttestationSubmitted",
    inputs: [
      { name: "bookingId", type: "bytes32", indexed: true, internalType: "bytes32" },
      { name: "bundleHash", type: "bytes32", indexed: false, internalType: "bytes32" },
      { name: "merkleRoot", type: "bytes32", indexed: false, internalType: "bytes32" },
      { name: "dBps", type: "uint32", indexed: false, internalType: "uint32" },
      { name: "scoringVersion", type: "uint16", indexed: false, internalType: "uint16" },
      { name: "cidHash", type: "bytes32", indexed: false, internalType: "bytes32" },
      { name: "cid", type: "string", indexed: false, internalType: "string" },
      { name: "signers", type: "address[]", indexed: false, internalType: "address[]" },
    ],
    anonymous: false,
  },
] as const;

export const EIP712_ATTESTATION_TYPES = {
  Attestation: [
    { name: "bookingId", type: "bytes32" },
    { name: "bundleHash", type: "bytes32" },
    { name: "merkleRoot", type: "bytes32" },
    { name: "dBps", type: "uint32" },
    { name: "scoringVersion", type: "uint16" },
    { name: "cidHash", type: "bytes32" },
  ],
} as const;

export function getAttestationDomain(
  verifyingContract: `0x${string}`,
  chainId = 11155111
) {
  return {
    name: "DSRM-AttestationRegistry",
    version: "1",
    chainId,
    verifyingContract,
  } as const;
}
