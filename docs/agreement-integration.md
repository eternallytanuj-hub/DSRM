# DSRM Escrow Agreement Integration (v2 Mode Specification)

## 1. Overview

This document specifies the Solidity smart contract upgrade required to transition `SatelliteEscrow.sol` from **legacy mode** (where agreement terms and EIP-712 signatures are verified off-chain only) to **v2 mode** (where cryptographic termsHash binding, EIP-712 signature verification, replay protection, and tiered settlement are enforced natively on-chain).

---

## 2. EIP-712 Signature Verification Specification

### 2.1 Domain Separator
Compliant with EIP-712:
```solidity
bytes32 public constant DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

bytes32 public immutable DOMAIN_SEPARATOR;
```
Initialized in constructor:
```solidity
DOMAIN_SEPARATOR = keccak256(
    abi.encode(
        DOMAIN_TYPEHASH,
        keccak256(bytes("DSRM")),
        keccak256(bytes("1")),
        block.chainid,
        address(this)
    )
);
```

### 2.2 Primary Type: BookingAgreement
Matches Schedule D of `booking-agreement-v1.0.md` exactly:
```solidity
bytes32 public constant BOOKING_AGREEMENT_TYPEHASH = keccak256(
    "BookingAgreement(bytes32 bookingId,address buyer,address operator,uint64 windowStart,uint64 windowEnd,uint256 amountWei,bytes32 termsHash,bytes32 useDeclarationHash,uint256 nonce,uint64 deadline)"
);
```

### 2.3 On-Chain Deposit Function (`depositEscrowWithAgreement`)
```solidity
/**
 * @notice Deposits escrow while cryptographically verifying the buyer's EIP-712 booking agreement.
 * @param bookingId Unique 32-byte identifier for the pass booking.
 * @param operator Designated recipient operator address.
 * @param windowStart Pass start timestamp (UTC unix seconds).
 * @param windowEnd Pass end timestamp (UTC unix seconds).
 * @param termsHash keccak256 of canonical legal agreement text.
 * @param useDeclarationHash keccak256 of canonical JSON intended-use declaration.
 * @param nonce Nonce issued by server to prevent signature replay attacks.
 * @param deadline Unix timestamp after which signature is invalid.
 * @param signature 65-byte ECDSA signature from the buyer.
 */
function depositEscrowWithAgreement(
    bytes32 bookingId,
    address payable operator,
    uint64 windowStart,
    uint64 windowEnd,
    bytes32 termsHash,
    bytes32 useDeclarationHash,
    uint256 nonce,
    uint64 deadline,
    bytes calldata signature
) external payable nonReentrant {
    require(msg.value > 0, "Zero deposit");
    require(block.timestamp <= deadline, "Agreement signature expired");
    require(windowStart < windowEnd, "Invalid pass window");
    require(!usedNonces[msg.sender][nonce], "Nonce already used");
    require(escrows[bookingId].depositAmount == 0, "Booking ID already exists");

    // Mark nonce as consumed
    usedNonces[msg.sender][nonce] = true;

    // Verify EIP-712 typed-data hash
    bytes32 structHash = keccak256(
        abi.encode(
            BOOKING_AGREEMENT_TYPEHASH,
            bookingId,
            msg.sender,
            operator,
            windowStart,
            windowEnd,
            msg.value,
            termsHash,
            useDeclarationHash,
            nonce,
            deadline
        )
    );

    bytes32 digest = keccak256(
        abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
    );

    address signer = ECDSA.recover(digest, signature);
    require(signer == msg.sender, "Invalid EIP-712 agreement signature");

    // Record escrow with binding termsHash
    escrows[bookingId] = Escrow({
        bookingId: bookingId,
        buyer: payable(msg.sender),
        operator: operator,
        depositAmount: msg.value,
        windowStart: windowStart,
        windowEnd: windowEnd,
        termsHash: termsHash,
        useDeclarationHash: useDeclarationHash,
        status: EscrowStatus.Locked
    });

    emit EscrowAgreementDeposited(
        bookingId,
        msg.sender,
        operator,
        termsHash,
        useDeclarationHash,
        nonce,
        msg.value
    );
}
```

---

## 3. Tiered Settlement Implementation (Article 8 & Schedule B)

Under Article 8 and Schedule B, settlement is not binary. The Delivery Ratio $D$ (0 to 10000 basis points) determines payout tiers:

1. **$D \ge 95\%$ (Nominal Delivery)**:
   - Operator receives 100% of deposit (minus platform fee).
   - Buyer receives 0%.
2. **$70\% \le D < 95\%$ (Partial Delivery)**:
   - Operator receives $P \times D$.
   - Buyer receives remaining balance $(P - (P \times D))$.
3. **$D < 70\%$ (Failed Delivery)**:
   - Operator receives 0%.
   - Buyer receives 100% refund (less gas).

### Solidity Implementation Fragment:
```solidity
function settlePass(bytes32 bookingId, uint256 deliveryRatioBps) external onlyOracle {
    Escrow storage e = escrows[bookingId];
    require(e.status == EscrowStatus.Locked, "Escrow not locked");
    require(block.timestamp >= e.windowEnd, "Pass window not completed");

    uint256 amount = e.depositAmount;
    e.status = EscrowStatus.Settled;

    if (deliveryRatioBps >= 9500) {
        // Full operator payout less fee
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 payout = amount - fee;
        (bool s1, ) = e.operator.call{value: payout}("");
        (bool s2, ) = treasury.call{value: fee}("");
        require(s1 && s2, "Payout failed");
    } else if (deliveryRatioBps >= 7000) {
        // Proportional settlement
        uint256 operatorGross = (amount * deliveryRatioBps) / 10000;
        uint256 fee = (operatorGross * platformFeeBps) / 10000;
        uint256 operatorNet = operatorGross - fee;
        uint256 buyerRefund = amount - operatorGross;

        (bool s1, ) = e.operator.call{value: operatorNet}("");
        (bool s2, ) = e.buyer.call{value: buyerRefund}("");
        (bool s3, ) = treasury.call{value: fee}("");
        require(s1 && s2 && s3, "Settlement split failed");
    } else {
        // Full refund to buyer
        (bool s, ) = e.buyer.call{value: amount}("");
        require(s, "Refund failed");
    }

    emit PassSettled(bookingId, deliveryRatioBps, amount);
}
```

---

## 4. Oracle Silence Fallback (Article 8.3)

If the Telemetry Oracle fails to submit an attestation within the Fallback Deadline (48 hours after `windowEnd`):
```solidity
function claimOracleSilenceRefund(bytes32 bookingId) external nonReentrant {
    Escrow storage e = escrows[bookingId];
    require(e.status == EscrowStatus.Locked, "Escrow not locked");
    require(block.timestamp > e.windowEnd + 48 hours, "Fallback deadline not elapsed");
    require(msg.sender == e.buyer, "Only buyer may claim silence refund");

    e.status = EscrowStatus.Refunded;
    uint256 amount = e.depositAmount;

    (bool success, ) = e.buyer.call{value: amount}("");
    require(success, "Refund failed");

    emit OracleSilenceRefundClaimed(bookingId, e.buyer, amount);
}
```

---

## 5. Dispute Raising and Challenge Windows (Article 9)

Within the 12-hour Challenge Window following an attestation:
```solidity
function raiseDispute(bytes32 bookingId) external payable nonReentrant {
    Escrow storage e = escrows[bookingId];
    require(e.status == EscrowStatus.Attested, "No attestation to challenge");
    require(block.timestamp <= attestationTimestamp[bookingId] + 12 hours, "Challenge window closed");
    require(msg.value >= disputeBondAmount, "Insufficient dispute bond");

    e.status = EscrowStatus.Disputed;
    disputeBonds[bookingId] = msg.value;

    emit PassDisputed(bookingId, msg.sender, msg.value);
}
```

---

## 6. Migration and Compatibility

- **Current Deployment (Sepolia)**: `0x5CDcB7F47De1aE89A24Adb55b0876C765C437735` operates in **legacy mode**.
- **v2 Mode**: Configured via environment variable `NEXT_PUBLIC_ESCROW_AGREEMENT_MODE=v2`. When enabled, the frontend and backend switch contract calls to `depositEscrowWithAgreement` matching the above specification.
