import SatelliteEscrowArtifact from "@/contracts/SatelliteEscrow.json";

export const SEPOLIA_CHAIN_ID = 11155111;

export const SATELLITE_ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ||
  SatelliteEscrowArtifact.address ||
  "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735") as `0x${string}`;

export const SATELLITE_ESCROW_ABI = SatelliteEscrowArtifact.abi;

export const DEPOSIT_ESCROW_LEGACY_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "_bookingId", type: "bytes32" },
      { internalType: "address payable", name: "_operator", type: "address" },
      { internalType: "uint256", name: "_windowStart", type: "uint256" },
      { internalType: "uint256", name: "_windowEnd", type: "uint256" },
      { internalType: "string", name: "_satName", type: "string" },
    ],
    name: "depositEscrow",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
