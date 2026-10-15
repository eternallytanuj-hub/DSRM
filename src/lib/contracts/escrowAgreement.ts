/**
 * PROPOSED - Escrow Agreement Contract ABI (v2 Mode)
 *
 * This interface represents the planned SatelliteEscrow v2 upgrade supporting
 * on-chain EIP-712 agreement verification, replay protection via nonces,
 * deadline enforcement, and termsHash logging on-chain.
 */

export const ESCROW_AGREEMENT_MODE: "legacy" | "v2" =
  (process.env.NEXT_PUBLIC_ESCROW_AGREEMENT_MODE as "legacy" | "v2") || "legacy";

export const PROPOSED_ESCROW_AGREEMENT_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "bookingId", type: "bytes32" },
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "uint64", name: "windowStart", type: "uint64" },
      { internalType: "uint64", name: "windowEnd", type: "uint64" },
      { internalType: "bytes32", name: "termsHash", type: "bytes32" },
      { internalType: "bytes32", name: "useDeclarationHash", type: "bytes32" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint64", name: "deadline", type: "uint64" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "depositEscrowWithAgreement",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
