// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AttestationRegistry
 * @notice On-chain verifiable telemetry attestation registry for DSRM.
 *         Stores cryptographic commitments for completed satellite passes.
 *         Verifies multisig EIP-712 signatures from authorized oracle attesters.
 */
contract AttestationRegistry is EIP712, Ownable {
    using ECDSA for bytes32;

    bytes32 public constant ATTESTATION_TYPEHASH =
        keccak256(
            "Attestation(bytes32 bookingId,bytes32 bundleHash,bytes32 merkleRoot,uint32 dBps,uint16 scoringVersion,bytes32 cidHash)"
        );

    struct AttestationRecord {
        bytes32 bundleHash;
        bytes32 merkleRoot;
        uint32 dBps;
        uint16 scoringVersion;
        bytes32 cidHash;
        string cid;
        uint64 submittedAt;
        address[] signers;
    }

    mapping(bytes32 => AttestationRecord) private _attestations;
    bytes32[] private _bookingIds;

    mapping(address => bool) public isAttester;
    address[] public attesterList;
    uint256 public threshold;

    event AttestationSubmitted(
        bytes32 indexed bookingId,
        bytes32 bundleHash,
        bytes32 merkleRoot,
        uint32 dBps,
        uint16 scoringVersion,
        bytes32 cidHash,
        string cid,
        address[] signers
    );

    event AttesterAdded(address indexed attester);
    event AttesterRemoved(address indexed attester);
    event ThresholdUpdated(uint256 newThreshold);

    error BookingAlreadyAttested(bytes32 bookingId);
    error InsufficientSignatures(uint256 provided, uint256 required);
    error InvalidAttester(address signer);
    error DuplicateSigner(address signer);
    error ThresholdOutOfBounds(uint256 newThreshold, uint256 totalAttesters);
    error ZeroAddress();

    constructor(
        address[] memory initialAttesters,
        uint256 initialThreshold
    ) EIP712("DSRM-AttestationRegistry", "1") Ownable(msg.sender) {
        for (uint256 i = 0; i < initialAttesters.length; i++) {
            address attester = initialAttesters[i];
            if (attester == address(0)) revert ZeroAddress();
            if (!isAttester[attester]) {
                isAttester[attester] = true;
                attesterList.push(attester);
                emit AttesterAdded(attester);
            }
        }

        if (initialThreshold == 0 || initialThreshold > attesterList.length) {
            revert ThresholdOutOfBounds(initialThreshold, attesterList.length);
        }
        threshold = initialThreshold;
        emit ThresholdUpdated(initialThreshold);
    }

    /**
     * @notice Submits an immutable telemetry attestation for a booking.
     */
    function submitAttestation(
        bytes32 bookingId,
        bytes32 bundleHash,
        bytes32 merkleRoot,
        uint32 dBps,
        uint16 scoringVersion,
        string calldata cid,
        bytes[] calldata signatures
    ) external {
        if (_attestations[bookingId].submittedAt != 0) {
            revert BookingAlreadyAttested(bookingId);
        }

        if (signatures.length < threshold) {
            revert InsufficientSignatures(signatures.length, threshold);
        }

        bytes32 cidHash = keccak256(bytes(cid));
        bytes32 structHash = keccak256(
            abi.encode(
                ATTESTATION_TYPEHASH,
                bookingId,
                bundleHash,
                merkleRoot,
                dBps,
                scoringVersion,
                cidHash
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address[] memory recoveredSigners = new address[](signatures.length);

        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ECDSA.recover(digest, signatures[i]);
            if (!isAttester[signer]) {
                revert InvalidAttester(signer);
            }

            for (uint256 j = 0; j < i; j++) {
                if (recoveredSigners[j] == signer) {
                    revert DuplicateSigner(signer);
                }
            }
            recoveredSigners[i] = signer;
        }

        AttestationRecord storage rec = _attestations[bookingId];
        rec.bundleHash = bundleHash;
        rec.merkleRoot = merkleRoot;
        rec.dBps = dBps;
        rec.scoringVersion = scoringVersion;
        rec.cidHash = cidHash;
        rec.cid = cid;
        rec.submittedAt = uint64(block.timestamp);
        rec.signers = recoveredSigners;

        _bookingIds.push(bookingId);

        emit AttestationSubmitted(
            bookingId,
            bundleHash,
            merkleRoot,
            dBps,
            scoringVersion,
            cidHash,
            cid,
            recoveredSigners
        );
    }

    /**
     * @notice Returns the attestation for a given bookingId.
     */
    function getAttestation(bytes32 bookingId)
        external
        view
        returns (
            bytes32 bundleHash,
            bytes32 merkleRoot,
            uint32 dBps,
            uint16 scoringVersion,
            bytes32 cidHash,
            string memory cid,
            uint64 submittedAt,
            address[] memory signers
        )
    {
        AttestationRecord storage rec = _attestations[bookingId];
        return (
            rec.bundleHash,
            rec.merkleRoot,
            rec.dBps,
            rec.scoringVersion,
            rec.cidHash,
            rec.cid,
            rec.submittedAt,
            rec.signers
        );
    }

    /**
     * @notice Returns all authorized attester addresses.
     */
    function getAttesters() external view returns (address[] memory) {
        return attesterList;
    }

    /**
     * @notice Owner function to add an authorized attester.
     */
    function addAttester(address attester) external onlyOwner {
        if (attester == address(0)) revert ZeroAddress();
        if (isAttester[attester]) return;

        isAttester[attester] = true;
        attesterList.push(attester);
        emit AttesterAdded(attester);
    }

    /**
     * @notice Owner function to remove an authorized attester.
     */
    function removeAttester(address attester) external onlyOwner {
        if (!isAttester[attester]) return;

        isAttester[attester] = false;
        uint256 len = attesterList.length;
        for (uint256 i = 0; i < len; i++) {
            if (attesterList[i] == attester) {
                attesterList[i] = attesterList[len - 1];
                attesterList.pop();
                break;
            }
        }

        if (threshold > attesterList.length) {
            threshold = attesterList.length;
            emit ThresholdUpdated(threshold);
        }

        emit AttesterRemoved(attester);
    }

    /**
     * @notice Owner function to set the signature threshold.
     */
    function setThreshold(uint256 newThreshold) external onlyOwner {
        if (newThreshold == 0 || newThreshold > attesterList.length) {
            revert ThresholdOutOfBounds(newThreshold, attesterList.length);
        }
        threshold = newThreshold;
        emit ThresholdUpdated(newThreshold);
    }

    /**
     * @notice Returns the EIP-712 domain separator.
     */
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
