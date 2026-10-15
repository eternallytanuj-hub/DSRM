import { type TypedDataDomain } from "viem";

export const EIP712_DOMAIN_NAME = "DSRM";
export const EIP712_DOMAIN_VERSION = "1";

export const BOOKING_AGREEMENT_TYPES = {
  BookingAgreement: [
    { name: "bookingId", type: "bytes32" },
    { name: "buyer", type: "address" },
    { name: "operator", type: "address" },
    { name: "windowStart", type: "uint64" },
    { name: "windowEnd", type: "uint64" },
    { name: "amountWei", type: "uint256" },
    { name: "termsHash", type: "bytes32" },
    { name: "useDeclarationHash", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint64" },
  ],
} as const;

export function getAgreementDomain(
  chainId: number,
  verifyingContract: `0x${string}`
): TypedDataDomain {
  return {
    name: EIP712_DOMAIN_NAME,
    version: EIP712_DOMAIN_VERSION,
    chainId: BigInt(chainId),
    verifyingContract,
  };
}

export interface BookingAgreementMessage {
  bookingId: `0x${string}`;
  buyer: `0x${string}`;
  operator: `0x${string}`;
  windowStart: bigint;
  windowEnd: bigint;
  amountWei: bigint;
  termsHash: `0x${string}`;
  useDeclarationHash: `0x${string}`;
  nonce: bigint;
  deadline: bigint;
}

/**
 * Formats typed-data message for clean UI display with bigints serialized as decimal strings.
 */
export function formatMessageForDisplay(message: BookingAgreementMessage) {
  return {
    bookingId: message.bookingId,
    buyer: message.buyer,
    operator: message.operator,
    windowStart: message.windowStart.toString(),
    windowEnd: message.windowEnd.toString(),
    amountWei: message.amountWei.toString(),
    termsHash: message.termsHash,
    useDeclarationHash: message.useDeclarationHash,
    nonce: message.nonce.toString(),
    deadline: message.deadline.toString(),
  };
}
