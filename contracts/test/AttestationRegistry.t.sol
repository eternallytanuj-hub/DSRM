// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface Vm {
    function sign(uint256 privateKey, bytes32 digest) external returns (uint8 v, bytes32 r, bytes32 s);
    function prank(address) external;
}

abstract contract Test {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}

import "../AttestationRegistry.sol";

contract AttestationRegistryTest is Test {
    AttestationRegistry public registry;

    uint256 internal key1 = 0x1010101010101010101010101010101010101010101010101010101010101010;
    uint256 internal key2 = 0x2020202020202020202020202020202020202020202020202020202020202020;
    uint256 internal rogueKey = 0x9999999999999999999999999999999999999999999999999999999999999999;

    address internal attester1 = 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf; // Matches key1
    address internal attester2 = 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF; // Matches key2
    address internal rogueUser = 0x6CA6d50D329480C53026743654b4838de61935B1;

    bytes32 internal constant BOOKING_ID = keccak256("BKG-001");
    bytes32 internal constant BUNDLE_HASH = keccak256("BUNDLE_HASH");
    bytes32 internal constant MERKLE_ROOT = keccak256("MERKLE_ROOT");
    uint32 internal constant D_BPS = 9800;
    uint16 internal constant SCORING_VER = 1;
    string internal constant CID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

    function setUp() public {
        address[] memory initialAttesters = new address[](2);
        initialAttesters[0] = attester1;
        initialAttesters[1] = attester2;

        registry = new AttestationRegistry(initialAttesters, 2);
    }

    function _signAttestation(uint256 privKey, address verifyingContract) internal returns (bytes memory) {
        bytes32 cidHash = keccak256(bytes(CID));
        bytes32 structHash = keccak256(
            abi.encode(
                registry.ATTESTATION_TYPEHASH(),
                BOOKING_ID,
                BUNDLE_HASH,
                MERKLE_ROOT,
                D_BPS,
                SCORING_VER,
                cidHash
            )
        );

        bytes32 domainSep;
        if (verifyingContract == address(registry)) {
            domainSep = registry.domainSeparator();
        } else {
            domainSep = keccak256(
                abi.encode(
                    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                    keccak256(bytes("DSRM-AttestationRegistry")),
                    keccak256(bytes("1")),
                    block.chainid,
                    verifyingContract
                )
            );
        }

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSep, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privKey, digest);
        return abi.encodePacked(r, s, v);
    }

    function test_ThresholdMetSuccess() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _signAttestation(key1, address(registry));
        sigs[1] = _signAttestation(key2, address(registry));

        registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs);

        (bytes32 bHash, bytes32 mRoot, uint32 dBps, uint16 scVer, , string memory recCid, uint64 submittedAt, address[] memory signers) = registry.getAttestation(BOOKING_ID);
        require(bHash == BUNDLE_HASH, "bundleHash mismatch");
        require(mRoot == MERKLE_ROOT, "merkleRoot mismatch");
        require(dBps == D_BPS, "dBps mismatch");
        require(scVer == SCORING_VER, "scoringVersion mismatch");
        require(keccak256(bytes(recCid)) == keccak256(bytes(CID)), "cid mismatch");
        require(submittedAt > 0, "not submitted");
        require(signers.length == 2, "signers len mismatch");
    }

    function test_ThresholdUnmetReverts() public {
        bytes[] memory sigs = new bytes[](1);
        sigs[0] = _signAttestation(key1, address(registry));

        try registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs) {
            revert("Expected revert");
        } catch {}
    }

    function test_DuplicateSignerReverts() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _signAttestation(key1, address(registry));
        sigs[1] = _signAttestation(key1, address(registry));

        try registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs) {
            revert("Expected revert");
        } catch {}
    }

    function test_NonAttesterSignerReverts() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _signAttestation(key1, address(registry));
        sigs[1] = _signAttestation(rogueKey, address(registry));

        try registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs) {
            revert("Expected revert");
        } catch {}
    }

    function test_SecondSubmissionReverts() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _signAttestation(key1, address(registry));
        sigs[1] = _signAttestation(key2, address(registry));

        registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs);

        try registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs) {
            revert("Expected revert");
        } catch {}
    }

    function test_WrongDomainReverts() public {
        bytes[] memory sigs = new bytes[](2);
        // Sign with a different contract address domain
        sigs[0] = _signAttestation(key1, address(0x1234567890123456789012345678901234567890));
        sigs[1] = _signAttestation(key2, address(registry));

        try registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs) {
            revert("Expected revert");
        } catch {}
    }

    function test_BadSignatureReverts() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _signAttestation(key1, address(registry));
        // Corrupted 65-byte signature
        sigs[1] = hex"112233445566778899001122334455667788990011223344556677889900112233445566778899001122334455667788990011223344556677889900112233441b";

        try registry.submitAttestation(BOOKING_ID, BUNDLE_HASH, MERKLE_ROOT, D_BPS, SCORING_VER, CID, sigs) {
            revert("Expected revert");
        } catch {}
    }

    function test_OwnerOnlyFunctions() public {
        vm.prank(rogueUser);
        try registry.addAttester(rogueUser) {
            revert("Expected revert");
        } catch {}

        vm.prank(rogueUser);
        try registry.setThreshold(1) {
            revert("Expected revert");
        } catch {}
    }
}
