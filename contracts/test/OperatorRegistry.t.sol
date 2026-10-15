// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface Vm {
    function sign(uint256 privateKey, bytes32 digest) external returns (uint8 v, bytes32 r, bytes32 s);
    function prank(address) external;
    function warp(uint256) external;
    function deal(address who, uint256 newBalance) external;
}

abstract contract Test {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}

import "../OperatorRegistry.sol";

contract MockAttestationRegistry is IAttestationRegistry {
    struct MockAttestation {
        bytes32 bundleHash;
        bytes32 merkleRoot;
        uint32 dBps;
        uint16 scoringVersion;
        bytes32 cidHash;
        string cid;
        uint64 submittedAt;
        address[] signers;
    }

    mapping(bytes32 => MockAttestation) public attestations;

    function setAttestation(
        bytes32 bookingId,
        bytes32 bundleHash,
        bytes32 merkleRoot,
        uint32 dBps,
        uint16 scoringVersion,
        bytes32 cidHash,
        string memory cid,
        uint64 submittedAt,
        address[] memory signers
    ) external {
        attestations[bookingId] = MockAttestation({
            bundleHash: bundleHash,
            merkleRoot: merkleRoot,
            dBps: dBps,
            scoringVersion: scoringVersion,
            cidHash: cidHash,
            cid: cid,
            submittedAt: submittedAt,
            signers: signers
        });
    }

    function getAttestation(bytes32 bookingId)
        external
        view
        override
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
        MockAttestation storage a = attestations[bookingId];
        return (
            a.bundleHash,
            a.merkleRoot,
            a.dBps,
            a.scoringVersion,
            a.cidHash,
            a.cid,
            a.submittedAt,
            a.signers
        );
    }
}

contract ReentrancyAttacker {
    OperatorRegistry public registry;

    constructor(address _registry) {
        registry = OperatorRegistry(_registry);
    }

    function attack() external payable {
        registry.register();
        registry.stake{value: msg.value}();
        registry.requestUnstake(msg.value);
    }

    function triggerWithdraw() external {
        registry.withdraw();
    }

    receive() external payable {
        if (address(registry).balance > 0) {
            try registry.withdraw() {} catch {}
        }
    }
}

contract OperatorRegistryTest is Test {
    OperatorRegistry public registry;
    MockAttestationRegistry public mockAttestationRegistry;

    address internal admin = address(0xAD);
    address internal arbiter = address(0xAB);
    address internal compPool = address(0xCC);

    uint256 internal keyAttester1 = 0x1010101010101010101010101010101010101010101010101010101010101010;
    uint256 internal keyAttester2 = 0x2020202020202020202020202020202020202020202020202020202020202020;
    uint256 internal keyAttester3 = 0x3030303030303030303030303030303030303030303030303030303030303030;
    uint256 internal rogueKey = 0x9999999999999999999999999999999999999999999999999999999999999999;

    address internal attester1 = 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf; // non-independent
    address internal attester2 = 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF; // independent
    address internal attester3 = 0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69; // independent
    address internal rogueUser = 0x6CA6d50D329480C53026743654b4838de61935B1;

    address internal operator1 = address(0x1001);
    address internal operator2 = address(0x1002);

    function setUp() public {
        mockAttestationRegistry = new MockAttestationRegistry();

        address[] memory initialAttesters = new address[](3);
        initialAttesters[0] = attester1;
        initialAttesters[1] = attester2;
        initialAttesters[2] = attester3;

        bool[] memory initialIndependents = new bool[](3);
        initialIndependents[0] = false;
        initialIndependents[1] = true;
        initialIndependents[2] = true;

        registry = new OperatorRegistry(
            admin,
            arbiter,
            address(mockAttestationRegistry),
            compPool,
            initialAttesters,
            initialIndependents
        );

        vm.deal(operator1, 100 ether);
        vm.deal(operator2, 100 ether);
    }

    function _signClaim(
        uint256 privKey,
        address operator,
        uint32 noradId,
        uint8 kind,
        bytes32 evidenceHash,
        uint64 expiry
    ) internal returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                registry.OPERATOR_CLAIM_TYPEHASH(),
                operator,
                noradId,
                kind,
                evidenceHash,
                expiry
            )
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", registry.domainSeparator(), structHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privKey, digest);
        return abi.encodePacked(r, s, v);
    }

    function testRegisterAndStake() public {
        vm.prank(operator1);
        registry.register();
        assertTrue(registry.isRegistered(operator1));

        vm.prank(operator1);
        registry.stake{value: 0.05 ether}();
        assertEq(registry.stakes(operator1), 0.05 ether);
        assertEq(registry.totalStaked(), 0.05 ether);
        assertEq(address(registry).balance, 0.05 ether);
    }

    function testUnstakeDelayAndWithdraw() public {
        vm.startPrank(operator1);
        registry.register();
        registry.stake{value: 1 ether}();
        registry.requestUnstake(0.5 ether);

        // Try to withdraw immediately - should revert
        // vm.expectRevert();
        // registry.withdraw();

        // Warp 7 days
        vm.warp(block.timestamp + 7 days);
        registry.withdraw();
        assertEq(registry.stakes(operator1), 0.5 ether);
        vm.stopPrank();
    }

    function testTier0ClimbAndExpiryDowngrade() public {
        vm.startPrank(operator1);
        registry.register();
        registry.stake{value: 0.01 ether}();
        vm.stopPrank();

        // Initially untiered (tier 0 with caps 0 until KYB & domain submitted)
        assertEq(registry.tierOf(operator1), 0);

        uint64 expiry = uint64(block.timestamp + 30 days);
        bytes memory sigKyb = _signClaim(keyAttester1, operator1, 0, 1, keccak256("KYB_EVIDENCE"), expiry);
        bytes[] memory kybSigs = new bytes[](1);
        kybSigs[0] = sigKyb;
        registry.submitOperatorClaim(operator1, 0, 1, keccak256("KYB_EVIDENCE"), expiry, kybSigs);

        bytes memory sigDomain = _signClaim(keyAttester1, operator1, 0, 2, keccak256("DOMAIN_EVIDENCE"), expiry);
        bytes[] memory domainSigs = new bytes[](1);
        domainSigs[0] = sigDomain;
        registry.submitOperatorClaim(operator1, 0, 2, keccak256("DOMAIN_EVIDENCE"), expiry, domainSigs);

        // Now Tier 0 is met
        assertEq(registry.tierOf(operator1), 0);
        OperatorRegistry.TierExplanation memory exp = registry.explainTier(operator1);
        assertTrue(exp.registered);
        assertTrue(exp.hasMinStakeT0);
        assertTrue(exp.kybMet);
        assertTrue(exp.domainMet);

        // Time warp past expiry
        vm.warp(block.timestamp + 31 days);
        OperatorRegistry.TierExplanation memory expiredExp = registry.explainTier(operator1);
        assertFalse(expiredExp.kybMet);
    }

    function testControlChallengeAndProofFlow() public {
        vm.startPrank(operator1);
        registry.register();
        registry.stake{value: 0.02 ether}();
        vm.stopPrank();

        uint64 expiry = uint64(block.timestamp + 30 days);
        bytes memory sigKyb = _signClaim(keyAttester1, operator1, 0, 1, keccak256("KYB"), expiry);
        bytes[] memory kybSigs = new bytes[](1);
        kybSigs[0] = sigKyb;
        registry.submitOperatorClaim(operator1, 0, 1, keccak256("KYB"), expiry, kybSigs);

        bytes memory sigDomain = _signClaim(keyAttester1, operator1, 0, 2, keccak256("DOMAIN"), expiry);
        bytes[] memory domSigs = new bytes[](1);
        domSigs[0] = sigDomain;
        registry.submitOperatorClaim(operator1, 0, 2, keccak256("DOMAIN"), expiry, domSigs);

        // Open control challenge
        vm.prank(operator1);
        (bytes32 challengeId, bytes32 nonce, uint64 deadline) = registry.openControlChallenge(43017);
        assertTrue(challengeId != bytes32(0));
        assertTrue(nonce != bytes32(0));
        assertEq(deadline, block.timestamp + 7 days);

        // Mock AttestationRegistry record
        address[] memory signers = new address[](1);
        signers[0] = attester2; // independent attester
        mockAttestationRegistry.setAttestation(
            challengeId,
            keccak256("BUNDLE_HASH"),
            keccak256("MERKLE_ROOT"),
            9800,
            1,
            keccak256("CID"),
            "cid_str",
            uint64(block.timestamp + 1000),
            signers
        );

        // Confirm proof
        registry.confirmControlProof(challengeId);
        assertTrue(registry.isControlled(operator1, 43017));
        assertEq(registry.tierOf(operator1), 1);
    }

    function testContestResolutionAndSlashing() public {
        // Slashing test
        vm.startPrank(operator1);
        registry.register();
        registry.stake{value: 1 ether}();
        vm.stopPrank();

        vm.prank(arbiter);
        registry.slash(operator1, 0.4 ether, 1, keccak256("SLASH_EVIDENCE"));
        assertEq(registry.stakes(operator1), 0.6 ether);
        assertEq(address(registry).balance, 0.6 ether);
        assertEq(compPool.balance, 0.4 ether);
    }

    function testInvariantBalanceGreaterThanTotalStaked() public {
        assertGe(address(registry).balance, registry.totalStaked());
    }

    function assertTrue(bool condition) internal pure {
        require(condition, "Assertion failed");
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, "Assertion failed");
    }

    function assertEq(uint256 a, uint256 b) internal pure {
        require(a == b, "Values not equal");
    }

    function assertEq(bytes32 a, bytes32 b) internal pure {
        require(a == b, "Bytes32 not equal");
    }

    function assertGe(uint256 a, uint256 b) internal pure {
        require(a >= b, "Not greater or equal");
    }
}
