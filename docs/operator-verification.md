# DSRM Operator Verification Tier System & Judge Demo Specification

## 1. Overview & Architecture

The DSRM Operator Verification System establishes a trust hierarchy for satellite ground station operators and space assets. The system enforces:
- **Pure on-chain derivation** via `tierOf(address)` and `explainTier(address)`. No administrator or oracle can arbitrarily set an operator's tier; it is recomputed at read time directly from verifiable on-chain facts and non-expired attestations.
- **Strict isolation between real and simulated demo data**: Demo actions and fraud simulations execute in an isolated namespace (`is_demo = true`) using real verifier algorithms (SHA-256 canonical hashing, Merkle proofs, SGP4 orbital propagation, Viem EIP-712 signature recovery) without polluting real operator profiles.
- **6-digit NORAD catalog integer support**: Full support for catalog numbers beyond 99,999 (e.g., `#100412`), avoiding legacy 5-digit TLE truncation.

---

## 2. Threat Model & Mitigations

| Threat Vector | Attack Scenario | Protocol Mitigation |
| :--- | :--- | :--- |
| **Identity Spoofing** | Rogue actor claims an active satellite owned by another company | Satellite claims require on-chain challenge nonce broadcasted in downlink telemetry. Conflicting claims trigger an immediate `Contested` lock, dropping capability back to Tier 0 until Arbiter resolution. |
| **Phantom Capacity** | Operator lists capacity on decayed, non-operational, or debris objects | CelesTrak SATCAT integration verifies the NORAD ID corresponds to an active payload with non-decayed status. Country code mismatches trigger manual review flags. |
| **Passive-Replay Fraud** | Operator replays historical, demodulated frames from a past pass to claim escrow | Step 8 delivery verifier mandates that frames contain the cryptographic `deliveryNonce = keccak256(abi.encode(bookingId, buyer, nonce, termsHash))`. Frames without the nonce or with timestamps outside the pass window fail immediately. |
| **Unlicensed Actors** | Operator operates without legal spectrum transmission rights | Tier 2 requires a validated `REGULATORY` attestation cross-checked against sovereign telecommunications commission filings (e.g., ITU, FCC). |
| **Malicious Attester Collusion** | Compromised attester attempts to falsely upgrade an operator | `VOUCH` claims and Tier 2 proofs require at least 2 distinct attesters explicitly flagged `independent: true` in contract storage. |

---

## 3. Tier Model & Derivation Matrix

Tiers are derived dynamically at read time via `OperatorRegistry.sol:tierOf(address)`:

### Tier 0: Listed
- **Requirements**:
  - Registered wallet in `OperatorRegistry`.
  - Non-custodial staking deposit $\ge 0.01\text{ ETH}$ ($S_0$).
  - Valid, unexpired `KYB` claim (business entity clearance).
  - Valid, unexpired `DOMAIN` claim (`_dsrm.<domain>` DNS TXT record binding).
  - CelesTrak SATCAT check passed off-chain.
- **Caps & Holds**:
  - Max Booking Value: **0.05 ETH**
  - Max Active Windows: **3**
  - Payout Escrow Hold: **72 hours**
  - Delivery Nonce: Optional

### Tier 1: Controlled
- **Requirements**:
  - All Tier 0 requirements met.
  - At least one active satellite with a confirmed, non-expired `CONTROL` claim.
  - Ephemeris control challenge nonce verified inside downlink frames via `AttestationRegistry`.
  - No open unresolved contest for that satellite.
- **Caps & Holds**:
  - Max Booking Value: **0.5 ETH**
  - Max Active Windows: **20**
  - Payout Escrow Hold: **24 hours**
  - Delivery Nonce: Optional

### Tier 2: Trusted
- **Requirements**:
  - All Tier 1 requirements met.
  - Staking deposit $\ge 0.10\text{ ETH}$ ($S_2$).
  - Valid, unexpired `REGULATORY` spectrum licensing claim.
  - At least 2 independent peer `VOUCH` claims from distinct authorized attesters.
- **Caps & Holds**:
  - Max Booking Value: **5.0 ETH**
  - Max Active Windows: **100**
  - Payout Escrow Hold: **2 hours**
  - Delivery Nonce: **Mandatory on every booking** (settlement blocked without it).

### Suspended / Contested
- If stake is slashed below $S_0$, status is **Suspended** and all caps drop to zero.
- If a satellite claim is contested by another operator with conflicting proof, Tier 1 is disabled until Arbiter resolution.

---

## 4. What Each Tier Proves and Does NOT Prove

> [!IMPORTANT]
> The system enforces cryptographic and administrative constraints, but physical space operations carry intrinsic limits that must remain transparent.

### What Tiers Prove:
1. **Tier 0** proves that an identified legal entity controls the operator wallet and official domain name, and has posted a financial bond.
2. **Tier 1** proves that within the past 90 days, the operator successfully commanded the satellite to broadcast a specific, unpredictable on-chain nonce during an orbital pass.
3. **Tier 2** proves that the operator has regulatory operating authorization, a substantial security bond, peer network endorsement, and binds each booking to a buyer-specific cryptographic delivery challenge.

### What Tiers Do NOT Prove:
1. **Does NOT guarantee 100% nominal delivery**: RF fading, atmospheric interference, ground station tracking errors, or hardware faults may still degrade a specific pass. Settlement is determined post-pass by the Telemetry Oracle.
2. **Does NOT insure against space weather**: Geomagnetic storms and solar flares can disrupt downlink regardless of tier.
3. **Does NOT substitute for sovereign operating authorization in the buyer's jurisdiction**: Buyers must ensure their reception and use of satellite data complies with local sovereign regulations.

---

## 5. Real vs. Simulated Matrix

To prevent misleading demonstrations while maintaining complete verifiability, DSRM strictly separates real computations from demo fixtures:

| Component | Real Implementation | Simulated Demo Environment |
| :--- | :--- | :--- |
| **Merkle Tree Proofs** | Node/browser isomorphic SHA-256 tree builder (`src/lib/replay/merkle.ts`) | Same real algorithm executed on demo frame payloads. |
| **Evidence Canonicalisation** | Recursive sorted-key UTF-8 byte serialization (`src/lib/replay/canonical.ts`) | Same real algorithm. |
| **Orbital Propagation** | SGP4 satellite propagation using `satellite.js` against official TLEs | Same real algorithm running against demo pass timing. |
| **EIP-712 Signatures** | Viem `recoverTypedDataAddress` checking against on-chain attester quorum | Same real recovery executed with demo testnet keypairs. |
| **Tier Derivation** | Pure Solidity / TypeScript function `tierOf()` | Same pure logic derived from isolated demo state. |
| **Attester Keys** | Production attester nodes in HSM / KMS | Local deterministic testnet keypairs (never committed). |
| **Downlink Telemetry** | SatNOGS Network & DB demodulated observation frames | Synthetic demodulated frames embedding challenge nonces. |
| **Data Namespace** | Supabase `operators` and `satellite_claims` tables | `demo_*` views with strict `is_demo = true` isolation. |

---

## 6. Smart Contracts & Deployment

### Contracts Overview
1. `contracts/OperatorRegistry.sol`:
   - OpenZeppelin `AccessControl`, `EIP712`, `ECDSA`, `ReentrancyGuard`.
   - Non-custodial staking with 7-day unstaking delay (`requestUnstake`, `withdraw`).
   - Claim verification for `KYB`, `DOMAIN`, `REGULATORY`, and `VOUCH`.
   - Control challenge opening and confirmation via `AttestationRegistry`.
   - Arbiter slashing (`slash`) and contest resolution (`resolveContest`).
   - Pure view functions: `tierOf(address)`, `explainTier(address)`, `capsOf(uint8)`, `isControlled(address, uint32)`.

2. Deployment Script: `scripts/deploy-operator-registry.ts`
   ```bash
   # Deploy Real OperatorRegistry to Sepolia
   npx tsx scripts/deploy-operator-registry.ts --network sepolia

   # Deploy Isolated DEMO OperatorRegistry to Sepolia (optional)
   npx tsx scripts/deploy-operator-registry.ts --network sepolia --demo
   ```

3. Environment Variables (`.env.local` / `.env`):
   ```env
   # Contract Addresses
   NEXT_PUBLIC_OPERATOR_REGISTRY=0x...
   NEXT_PUBLIC_ATTESTATION_REGISTRY=0x...
   NEXT_PUBLIC_ESCROW_CONTRACT=0x5CDcB7F47De1aE89A24Adb55b0876C765C437735

   # Demo Mode Flags (testnet only)
   NEXT_PUBLIC_DEMO_MODE=true
   DEMO_MODE=true
   NEXT_PUBLIC_DEMO_OPERATOR_REGISTRY=0x...
   ```

---

## 7. Escrow v2 Specification

Currently, `SatelliteEscrow.sol` (v1) executes legacy escrow deposits. The proposed **Escrow v2** interfaces with `OperatorRegistry.sol` to enforce caps and delivery nonces on-chain:

```solidity
// Proposed Escrow v2 interface extensions
interface IOperatorRegistry {
    function tierOf(address operator) external view returns (uint8);
    function capsOf(uint8 tier) external view returns (
        uint256 maxBookingValue,
        uint32 maxActiveWindows,
        uint32 payoutHoldSeconds,
        bool deliveryBoundChallengeRequired
    );
}

// In depositEscrowWithAgreement():
(uint256 maxVal, uint32 maxWindows, uint32 holdSecs, bool reqChallenge) = 
    operatorRegistry.capsOf(operatorRegistry.tierOf(operator));

require(msg.value <= maxVal, "Escrow: booking exceeds operator tier cap");
require(activeWindows[operator] < maxWindows, "Escrow: operator max active windows exceeded");

if (reqChallenge) {
    bytes32 deliveryNonce = keccak256(abi.encode(bookingId, msg.sender, nonce, termsHash));
    // Telemetry Oracle settlement must assert deliveryNonce presence in frames
}
```

---

## 8. Manual Testing Checklist

| Scenario | Steps to Verify | Expected Outcome |
| :--- | :--- | :--- |
| **Honest Climb** | Open Judge Demo Sheet → Scenario 1 → Execute Step 1 to 4 | Operator progresses Tier 0 → Tier 1 → Tier 2. Caps and derivation matrix update live. |
| **Identity Spoofer** | Execute Scenario 2 (Rogue claim on controlled satellite) | Rejection with `Contested claim` error; Tier 1 capability suspended. |
| **Passive-Replay Fraud** | Execute Scenario 3 | Step 8 Telemetry Verifier fails with `Passive replay fraud detected: nonce absent`. |
| **Unauthorized Attester** | Execute Scenario 4 | Signature rejected: `Signer is not an authorized attester`. |
| **Dispute & Slashing** | Execute Scenario 5 | Stake slashed; operator status collapses to `Suspended`. |
| **Demo Flag Disabled** | Set `NEXT_PUBLIC_DEMO_MODE=false` and reload | Judge Demo button and banner disappear; `/api/demo/*` returns 404. |
| **Mainnet Protection** | Switch wallet to Ethereum Mainnet (Chain #1) | Demo controls are permanently disabled; warning alert displayed. |
| **Catalog Check (6-digit NORAD)** | In `/operator-registry`, enter NORAD ID `100412` | Successfully queries SATCAT; flags country mismatch if owner code differs from declared country. |
