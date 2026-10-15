# DSRM Telemetry Oracle — Verifiable Satellite Pass Replay

## 1. Overview & Architecture

The DSRM Telemetry Oracle system replaces trust-in-operator claims with cryptographic and physical proofs. It takes raw public RF observation frames from real satellite passes, packages them into deterministic canonical evidence bundles, computes Merkle trees over every decoded frame, validates orbital physics with SGP4 propagation, and checks live browser verification against on-chain consensus in `AttestationRegistry.sol` on Sepolia.

```
  +-------------------------------------------------------------------------+
  |                             SatNOGS Network                             |
  |             (Public Ground Station Observation & Demod Frames)          |
  +------------------------------------+------------------------------------+
                                       |
                                       v
  +-------------------------------------------------------------------------+
  |              Isomorphic Replay Module (src/lib/replay/)                 |
  |  - canonical.ts: Deterministic key-sorted JSON, integer-only            |
  |  - hashing.ts:   WebCrypto SHA-256 digests                              |
  |  - merkle.ts:    Deterministic frame Merkle tree & inclusion proofs     |
  |  - scoring.ts:   Schedule B integer arithmetic profile "public-v1"      |
  |  - geometry.ts:  SGP4 orbital trajectory & elevation verification       |
  |  - verify.ts:    7-step sequential pipeline runner                      |
  +--------------------+-------------------------------+--------------------+
                       |                               |
                       v                               v
  +-----------------------------+     +-------------------------------------+
  |      IPFS / Fixture Mirror  |     |     AttestationRegistry.sol         |
  |   public/replay/<id>/bundle |     |   - EIP-712 multisig quorum         |
  |   CID: bafybeig...          |     |   - Immutable per bookingId         |
  +--------------+--------------+     +------------------+------------------+
                 |                                       |
                 +-------------------+-------------------+
                                     |
                                     v
  +-------------------------------------------------------------------------+
  |                        Browser Client Verification                      |
  |                     (/telemetry-oracle Route UI)                        |
  |  1. Fetch Evidence Bundle                                               |
  |  2. Recompute Bundle Hash (SHA-256 via WebCrypto)                      |
  |  3. Read On-Chain Attestation Record (Sepolia RPC)                     |
  |  4. Compare Cryptographic Commitments (bundleHash, merkleRoot, cidHash) |
  |  5. Multisig EIP-712 Signatures & Quorum                                |
  |  6. Recompute Settlement Score (Schedule B integer math)               |
  |  7. Orbital Pass Geometry & Elevation Check (SGP4 propagation)          |
  +-------------------------------------------------------------------------+
```

---

## 2. How to Pick a Satellite Pass

To select a vetted public satellite observation with demodulated RF frames:

```bash
# Query recent vetted passes for candidate telemetry satellites (e.g. AO-91 RadFxSat NORAD 43017, NO-44 PCSAT NORAD 26931)
npx tsx scripts/replay/find-candidates.ts 43017 26931 43137
```

The script queries the SatNOGS Network API for observations marked `vetted_status=good` that contain non-empty `demoddata` payload arrays. It prints observation IDs, time windows, and station numbers.

---

## 3. How to Build the Evidence Bundle

Once an observation ID is chosen:

```bash
# Build canonical evidence bundle for observation ID 11726893
npx tsx scripts/replay/build-bundle.ts 11726893 --requested-bytes 6000
```

The builder script:
1. Fetches metadata from `https://network.satnogs.org/api/observations/<id>/`.
2. Fetches ground station geodetic coordinates from `https://network.satnogs.org/api/stations/<stationId>/`.
3. Normalises all demodulated frames to lowercase hex strings with strict millisecond timestamps.
4. Normalises all numbers to integers (times in ms, lat/lon in micro-degrees, altitude in meters, centi-degrees).
5. Canonicalises JSON (recursively sorted keys, no whitespace, zero floats).
6. Computes SHA-256 `bundleHash` and builds the frame Merkle tree (`merkleRoot`).
7. Evaluates SGP4 pass geometry and Schedule B settlement scoring.
8. Writes `public/replay/<observationId>/bundle.json` and `public/replay/<observationId>/summary.json`.

---

## 4. How to Pin the Evidence Bundle to IPFS

The bundle can be pinned using any IPFS provider (Pinata, Web3.Storage, or a local go-ipfs/kubo node):

```bash
# Using IPFS CLI
ipfs add -Q --cid-version 1 public/replay/11726893/bundle.json
# Outputs CID: bafybeiga11ecac984c77ede3dbdb1ada8f669afc6d77e86a3e9b0e5f30c
```

Configure your gateway URL in `.env.local`:
```bash
NEXT_PUBLIC_IPFS_GATEWAYS="https://ipfs.io/ipfs/,https://gateway.pinata.cloud/ipfs/"
```

---

## 5. How to Deploy the AttestationRegistry Contract

`contracts/AttestationRegistry.sol` is an immutable, EIP-712-compliant smart contract that stores consensus commitments.

### Contract Parameters
- **Name**: `DSRM-AttestationRegistry`
- **Version**: `1`
- **EIP-712 TypeHash**: `keccak256("Attestation(bytes32 bookingId,bytes32 bundleHash,bytes32 merkleRoot,uint32 dBps,uint16 scoringVersion,bytes32 cidHash)")`

### Deployment Options
```bash
# Using Foundry
forge create contracts/AttestationRegistry.sol:AttestationRegistry \
  --rpc-url "$SEPOLIA_RPC" \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --constructor-args "['0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A','0x1563915e194D8CfBA1943570603F7606A3115508']" 2

# Using the TypeScript deployment script
export SEPOLIA_RPC="https://ethereum-sepolia-rpc.publicnode.com"
export DEPLOYER_PRIVATE_KEY="0x..."
npx tsx scripts/deploy-registry.ts
```

After deployment, set `NEXT_PUBLIC_ATTESTATION_REGISTRY="0x<deployed_address>"` in `.env.local`.

---

## 6. How to Publish the Attestation On-Chain

To independently re-verify the bundle and submit multi-attester EIP-712 signatures:

```bash
export NEXT_PUBLIC_ATTESTATION_REGISTRY="0x5CDcB7F47De1aE89A24Adb55b0876C765C437735"
export SEPOLIA_RPC="https://ethereum-sepolia-rpc.publicnode.com"
export ATTESTER_KEY_1="0x1111111111111111111111111111111111111111111111111111111111111111"
export ATTESTER_KEY_2="0x2222222222222222222222222222222222222222222222222222222222222222"

npx tsx scripts/replay/publish-attestation.ts 11726893
```

The script:
1. Recomputes `bundleHash`, `merkleRoot`, SGP4 geometry, and score D. Aborts if any check fails.
2. Formats the EIP-712 `Attestation` typed data structure.
3. Signs with each private key in `ATTESTER_KEY_1..N`.
4. Calls `registry.submitAttestation(...)`.
5. Prints the Sepolia transaction hash and IPFS pinning instructions.

---

## 7. Environment Variables Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# On-Chain Attestation Registry Address (Sepolia)
NEXT_PUBLIC_ATTESTATION_REGISTRY=0x5CDcB7F47De1aE89A24Adb55b0876C765C437735

# Sepolia Ethereum RPC
NEXT_PUBLIC_SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com

# Default observation bundle to replay
NEXT_PUBLIC_REPLAY_DEFAULT_OBSERVATION=11726893

# IPFS Gateways fallback list
NEXT_PUBLIC_IPFS_GATEWAYS=https://ipfs.io/ipfs/,https://gateway.pinata.cloud/ipfs/

# Optional SatNOGS DB API token for telemetry fallback queries
SATNOGS_DB_TOKEN=your_satnogs_db_token_here

# Script-only Testnet Attester Private Keys (Never commit!)
ATTESTER_KEY_1=0x1111111111111111111111111111111111111111111111111111111111111111
ATTESTER_KEY_2=0x2222222222222222222222222222222222222222222222222222222222222222
```

---

## 8. Running the Demo in the Browser

Start the development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000/telemetry-oracle`.

### Interactive Features
1. **Persistent Invariant Banner**: Unconditionally reminds the viewer that the pass is a retroactive replay of real public RF data with simulated booking terms.
2. **Timeline Scrubber**: Drag from AOS to LOS or press Play at 1x, 10x, or 60x. Observe the ground track map update the satellite position, elevation, azimuth, and line-of-sight status.
3. **Cumulative Frame Arrival**: Watch decoded frames accumulate against the requested booking quota.
4. **Interactive Merkle Inspector**: Click any frame row in the telemetry log. View the exact byte-level preimage formula, running sibling hashes, and test live in-browser proof verification with WebCrypto.
5. **Local In-Memory Tamper Test**:
   - **Mode 1 (Flip 1 payload byte)**: Instantly breaks the canonical SHA-256 bundle hash, Merkle root, and frame proof.
   - **Mode 2 (Shift timestamps +2 hours)**: Instantly breaks the SGP4 pass geometry check and hash.
   - Click **Restore Original** to return to authentic evidence.

---

## 9. What This Proves and Does Not Prove

### What This PROVES:
1. **Payload Authenticity**: The raw demodulated telemetry frames match the exact bytes publicised by the SatNOGS ground station network.
2. **Commitment Integrity**: Neither the operator nor the buyer modified or omitted a single frame without breaking the on-chain Merkle root (`0x2719a0...`) and bundle SHA-256 hash (`0xa11eca...`).
3. **Orbital Physical Plausibility**: Frame arrival timestamps mathematically coincide with when satellite AO-91 was physically elevated above 10° horizon at Ground Station #1428 (Athens).
4. **Deterministic Settlement Arithmetic**: Score $D = 9791\text{ bps}$ was derived via integer math conforming to Schedule B contract rules ($40\%$ contact coverage, $30\%$ volume, $30\%$ continuity), placing the booking in the `FULL_RELEASE` tier ($100\%$ operator release, $0\%$ buyer refund).
5. **EIP-712 Multisig Consensus**: Authorized oracle node keys signed the exact tuple `(bookingId, bundleHash, merkleRoot, dBps, scoringVersion, cidHash)` under domain `DSRM-AttestationRegistry`.

### What This DOES NOT Prove:
1. **Commercial Capacity Sale**: No commercial satellite operator sold capacity for this booking; the reservation terms ($6,000$ requested bytes, settlement pricing) are simulated demonstration terms.
2. **RF Signal Quality (SNR)**: Public SatNOGS demodulated telemetry does not include calibrated receiver IQ signal-to-noise ratio measurements. Per Non-negotiable Invariant 5, SNR is not fabricated.
3. **Attester Independence on Testnet**: The testnet attester keys are operated by the DSRM team (`independent: false`). True mainnet independence requires geographically separate third-party oracle operators.
4. **Ground Station Hardware Integrity**: The system trusts that SatNOGS station receiver clocks and SDR demodulation pipelines were uncompromised at the time of reception.
