import type { AttesterConfig } from "@/lib/replay/types";

/**
 * Known Telemetry Oracle Attester registry.
 * Invariant: Every attester must be labeled honestly.
 * On testnet, all attesters are operated by the DSRM team and are not independent.
 */
export const KNOWN_ATTESTERS: Record<string, AttesterConfig> = {
  // Attester 1 (Primary DSRM Oracle Node)
  "0xc25f9f0ce27a2d248c43563a32cdc4886d069176": {
    address: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176",
    label: "DSRM-Oracle-Node-Alpha",
    operator: "DSRM Core Infrastructure",
    independent: false,
    note: "Testnet: operated by the DSRM team",
  },
  // Attester 2 (Secondary DSRM Oracle Node)
  "0x89205a3e3b2a69de6dbf7f01ed13b2108b2c43e7": {
    address: "0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7",
    label: "DSRM-Oracle-Node-Beta",
    operator: "DSRM Core Infrastructure",
    independent: false,
    note: "Testnet: operated by the DSRM team",
  },
  // Attester 3 (Observer Sentinel Node)
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906": {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    label: "DSRM-Oracle-Sentinel-1",
    operator: "DSRM Protocol Labs",
    independent: false,
    note: "Testnet: operated by the DSRM team",
  },
  // Attester 4 (Testnet Signer Alpha)
  "0x19e7e376e7c213b7e7e7e46cc70a5dd086daff2a": {
    address: "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A",
    label: "DSRM-Attester-Alpha",
    operator: "DSRM Core Infrastructure",
    independent: false,
    note: "Testnet: operated by the DSRM team",
  },
  // Attester 5 (Testnet Signer Beta)
  "0x1563915e194d8cfba1943570603f7606a3115508": {
    address: "0x1563915e194D8CfBA1943570603F7606A3115508",
    label: "DSRM-Attester-Beta",
    operator: "DSRM Core Infrastructure",
    independent: false,
    note: "Testnet: operated by the DSRM team",
  },
};

export const DEFAULT_REQUIRED_THRESHOLD = 2;

export function getAttesterInfo(address: string): AttesterConfig {
  const normalized = address.toLowerCase();
  return (
    KNOWN_ATTESTERS[normalized] || {
      address: address as `0x${string}`,
      label: `Attester-${address.slice(0, 6)}...${address.slice(-4)}`,
      operator: "Unknown Operator",
      independent: false,
      note: "Unrecognized external attester key",
    }
  );
}
