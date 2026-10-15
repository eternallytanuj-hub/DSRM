// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAttestationRegistry {
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
        );
}

/**
 * @title OperatorRegistry
 * @notice On-chain verification tier system for satellite ground and space operators.
 *         Enforces pure, recomputable tier derivations (Tier 0 Listed, Tier 1 Controlled, Tier 2 Trusted),
 *         EIP-712 multisig attestation verification, control-proof challenge/response pipeline,
 *         satellite control contest resolution, staking with delay, and arbiter slashing.
 */
contract OperatorRegistry is AccessControl, EIP712, ReentrancyGuard {
    using ECDSA for bytes32;

    bytes32 public constant OWNER_ADMIN_ROLE = keccak256("OWNER_ADMIN_ROLE");
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    bytes32 public constant OPERATOR_CLAIM_TYPEHASH =
        keccak256("OperatorClaim(address operator,uint32 noradId,uint8 kind,bytes32 evidenceHash,uint64 expiry)");

    // Claim kinds
    uint8 public constant KIND_KYB = 1;
    uint8 public constant KIND_DOMAIN = 2;
    uint8 public constant KIND_CONTROL = 3;
    uint8 public constant KIND_REGULATORY = 4;
    uint8 public constant KIND_VOUCH = 5;

    // Default stake minimums
    uint256 public constant S0_MIN_STAKE = 0.01 ether;
    uint256 public constant S2_MIN_STAKE = 0.1 ether;

    // Time parameters
    uint64 public constant UNSTAKE_DELAY = 7 days;
    uint64 public constant CHALLENGE_DURATION = 7 days;
    uint64 public constant CONTROL_GRACE_PERIOD = 1 days;
    uint64 public constant CONTROL_TTL = 90 days;

    struct AttesterInfo {
        bool isAuthorized;
        bool independent;
    }

    struct StoredClaim {
        bytes32 evidenceHash;
        uint64 expiry;
        address[] signers;
    }

    struct ControlChallenge {
        address operator;
        uint32 noradId;
        bytes32 nonce;
        uint64 openedAt;
        uint64 deadline;
        bool confirmed;
    }

    struct UnstakeRequest {
        uint256 amount;
        uint64 releaseTime;
    }

    struct TierExplanation {
        bool registered;
        uint256 stakeAmount;
        bool hasMinStakeT0;
        bool hasMinStakeT2;
        bool kybMet;
        uint64 kybExpiry;
        address[] kybAttesters;
        bool domainMet;
        uint64 domainExpiry;
        address[] domainAttesters;
        uint32 controlledSatelliteCount;
        uint32[] activeControlledNoradIds;
        bool hasUnresolvedContest;
        bool regulatoryMet;
        uint64 regulatoryExpiry;
        address[] regulatoryAttesters;
        uint32 vouchCount;
        address[] vouchAttesters;
        uint8 currentTier;
        bool isSuspended;
    }

    // Attestation registry reference (booking key is reused for challenge IDs)
    IAttestationRegistry public attestationRegistry;
    address public compensationPool;
    uint256 public minIndependentControlSigners = 1;

    // Operator state
    mapping(address => bool) public isRegistered;
    address[] public registeredOperators;

    mapping(address => uint256) public stakes;
    uint256 public totalStaked;
    mapping(address => UnstakeRequest) public unstakeRequests;

    // Attester governance
    mapping(address => AttesterInfo) public attesterInfo;
    address[] public attesterList;
    mapping(uint8 => uint256) public kindThreshold;

    // Operator claims: operator => kind => noradId (0 for entity claims) => StoredClaim
    mapping(address => mapping(uint8 => mapping(uint32 => StoredClaim))) public operatorClaims;

    // Satellite control state
    mapping(bytes32 => ControlChallenge) public challenges;
    mapping(address => mapping(uint32 => uint256)) public challengeCounter;
    mapping(uint32 => address) public activeSatelliteOperator;
    mapping(uint32 => bool) public satelliteContested;
    mapping(uint32 => address) public contestedIncumbent;
    mapping(uint32 => address) public contestedChallenger;
    mapping(address => uint256) public openContestCount;
    mapping(address => uint32[]) private _operatorControlledNoradIds;
    mapping(address => mapping(uint32 => bool)) private _operatorHasTrackedNorad;

    // Events
    event OperatorRegistered(address indexed operator);
    event Staked(address indexed operator, uint256 amount, uint256 newTotalStake);
    event UnstakeRequested(address indexed operator, uint256 amount, uint64 releaseTime);
    event Withdrawn(address indexed operator, uint256 amount);
    event AttesterAdded(address indexed attester, bool independent);
    event AttesterRemoved(address indexed attester);
    event KindThresholdUpdated(uint8 indexed kind, uint256 newThreshold);
    event OperatorClaimSubmitted(
        address indexed operator,
        uint32 indexed noradId,
        uint8 indexed kind,
        bytes32 evidenceHash,
        uint64 expiry,
        address[] signers
    );
    event ControlChallengeOpened(
        bytes32 indexed challengeId,
        address indexed operator,
        uint32 indexed noradId,
        bytes32 nonce,
        uint64 deadline
    );
    event ControlProofConfirmed(
        bytes32 indexed challengeId,
        address indexed operator,
        uint32 indexed noradId,
        bytes32 bundleHash,
        bytes32 merkleRoot,
        uint64 expiry
    );
    event SatelliteContested(
        uint32 indexed noradId,
        address indexed claimant,
        address indexed incumbent,
        bytes32 challengeId
    );
    event ContestResolved(uint32 indexed noradId, address winner, bool clearedBoth);
    event Slashed(address indexed operator, uint256 amount, uint8 reasonCode, bytes32 evidenceHash);
    event CompensationPoolUpdated(address indexed newPool);
    event AttestationRegistryUpdated(address indexed newRegistry);
    event MinIndependentControlSignersUpdated(uint256 newCount);

    // Errors
    error AlreadyRegistered(address operator);
    error NotRegistered(address operator);
    error InsufficientStake(uint256 available, uint256 required);
    error UnstakeDelayPending(uint64 releaseTime);
    error NoUnstakeRequested();
    error ContestOpenCannotUnstake(address operator);
    error ZeroAddress();
    error InvalidThreshold();
    error InvalidKind(uint8 kind);
    error ClaimExpired(uint64 expiry);
    error InsufficientSignatures(uint256 provided, uint256 required);
    error UnauthorizedAttester(address signer);
    error DuplicateSigner(address signer);
    error NonIndependentAttester(address signer);
    error ChallengeAlreadyOpen(uint32 noradId);
    error ChallengeNotFound(bytes32 challengeId);
    error AttestationNotFound(bytes32 challengeId);
    error AttestationLate(uint64 submittedAt, uint64 deadlineWithGrace);
    error InsufficientIndependentSigners(uint256 found, uint256 required);
    error NoActiveControlProof();
    error ContestNotFound(uint32 noradId);
    error TransferFailed();
    error DisputeOpen(address operator);

    constructor(
        address admin,
        address arbiter,
        address _attestationRegistry,
        address _compensationPool,
        address[] memory initialAttesters,
        bool[] memory initialIndependents
    ) EIP712("DSRM-OperatorRegistry", "1") {
        if (admin == address(0) || arbiter == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OWNER_ADMIN_ROLE, admin);
        _grantRole(ARBITER_ROLE, arbiter);

        attestationRegistry = IAttestationRegistry(_attestationRegistry);
        compensationPool = _compensationPool != address(0) ? _compensationPool : admin;

        kindThreshold[KIND_KYB] = 1;
        kindThreshold[KIND_DOMAIN] = 1;
        kindThreshold[KIND_CONTROL] = 1;
        kindThreshold[KIND_REGULATORY] = 1;
        kindThreshold[KIND_VOUCH] = 2;

        for (uint256 i = 0; i < initialAttesters.length; i++) {
            address attester = initialAttesters[i];
            if (attester == address(0)) revert ZeroAddress();
            bool ind = i < initialIndependents.length ? initialIndependents[i] : false;
            attesterInfo[attester] = AttesterInfo({ isAuthorized: true, independent: ind });
            attesterList.push(attester);
            emit AttesterAdded(attester, ind);
        }
    }

    // -------------------------------------------------------------
    // Operator Registration & Staking
    // -------------------------------------------------------------

    function register() external {
        if (isRegistered[msg.sender]) revert AlreadyRegistered(msg.sender);
        isRegistered[msg.sender] = true;
        registeredOperators.push(msg.sender);
        emit OperatorRegistered(msg.sender);
    }

    function stake() external payable {
        if (!isRegistered[msg.sender]) revert NotRegistered(msg.sender);
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value, stakes[msg.sender]);
    }

    function requestUnstake(uint256 amount) external {
        if (stakes[msg.sender] < amount) {
            revert InsufficientStake(stakes[msg.sender], amount);
        }
        if (openContestCount[msg.sender] > 0) {
            revert ContestOpenCannotUnstake(msg.sender);
        }

        uint64 release = uint64(block.timestamp + UNSTAKE_DELAY);
        unstakeRequests[msg.sender] = UnstakeRequest({
            amount: amount,
            releaseTime: release
        });

        emit UnstakeRequested(msg.sender, amount, release);
    }

    function withdraw() external nonReentrant {
        UnstakeRequest memory req = unstakeRequests[msg.sender];
        if (req.amount == 0) revert NoUnstakeRequested();
        if (block.timestamp < req.releaseTime) revert UnstakeDelayPending(req.releaseTime);
        if (openContestCount[msg.sender] > 0) revert ContestOpenCannotUnstake(msg.sender);

        uint256 amount = req.amount;
        if (stakes[msg.sender] < amount) {
            amount = stakes[msg.sender];
        }

        delete unstakeRequests[msg.sender];
        stakes[msg.sender] -= amount;
        totalStaked -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    // -------------------------------------------------------------
    // Attester Governance (OWNER_ADMIN_ROLE)
    // -------------------------------------------------------------

    function addAttester(address attester, bool independent) external onlyRole(OWNER_ADMIN_ROLE) {
        if (attester == address(0)) revert ZeroAddress();
        if (!attesterInfo[attester].isAuthorized) {
            attesterList.push(attester);
        }
        attesterInfo[attester] = AttesterInfo({ isAuthorized: true, independent: independent });
        emit AttesterAdded(attester, independent);
    }

    function removeAttester(address attester) external onlyRole(OWNER_ADMIN_ROLE) {
        if (!attesterInfo[attester].isAuthorized) return;
        delete attesterInfo[attester];

        uint256 len = attesterList.length;
        for (uint256 i = 0; i < len; i++) {
            if (attesterList[i] == attester) {
                attesterList[i] = attesterList[len - 1];
                attesterList.pop();
                break;
            }
        }
        emit AttesterRemoved(attester);
    }

    function setKindThreshold(uint8 kind, uint256 n) external onlyRole(OWNER_ADMIN_ROLE) {
        if (n == 0) revert InvalidThreshold();
        kindThreshold[kind] = n;
        emit KindThresholdUpdated(kind, n);
    }

    function setAttestationRegistry(address _registry) external onlyRole(OWNER_ADMIN_ROLE) {
        if (_registry == address(0)) revert ZeroAddress();
        attestationRegistry = IAttestationRegistry(_registry);
        emit AttestationRegistryUpdated(_registry);
    }

    function setCompensationPool(address _pool) external onlyRole(OWNER_ADMIN_ROLE) {
        if (_pool == address(0)) revert ZeroAddress();
        compensationPool = _pool;
        emit CompensationPoolUpdated(_pool);
    }

    function setMinIndependentControlSigners(uint256 n) external onlyRole(OWNER_ADMIN_ROLE) {
        if (n == 0) revert InvalidThreshold();
        minIndependentControlSigners = n;
        emit MinIndependentControlSignersUpdated(n);
    }

    // -------------------------------------------------------------
    // Claims Submission (EIP-712)
    // -------------------------------------------------------------

    function submitOperatorClaim(
        address operator,
        uint32 noradId,
        uint8 kind,
        bytes32 evidenceHash,
        uint64 expiry,
        bytes[] calldata signatures
    ) external {
        if (!isRegistered[operator]) revert NotRegistered(operator);
        if (expiry <= block.timestamp) revert ClaimExpired(expiry);

        uint256 threshold = kindThreshold[kind];
        if (threshold == 0) revert InvalidKind(kind);
        if (signatures.length < threshold) {
            revert InsufficientSignatures(signatures.length, threshold);
        }

        bytes32 structHash = keccak256(
            abi.encode(OPERATOR_CLAIM_TYPEHASH, operator, noradId, kind, evidenceHash, expiry)
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        address[] memory recovered = new address[](signatures.length);

        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ECDSA.recover(digest, signatures[i]);
            AttesterInfo memory info = attesterInfo[signer];
            if (!info.isAuthorized) revert UnauthorizedAttester(signer);

            if (kind == KIND_VOUCH && !info.independent) {
                revert NonIndependentAttester(signer);
            }

            for (uint256 j = 0; j < i; j++) {
                if (recovered[j] == signer) revert DuplicateSigner(signer);
            }
            recovered[i] = signer;
        }

        operatorClaims[operator][kind][noradId] = StoredClaim({
            evidenceHash: evidenceHash,
            expiry: expiry,
            signers: recovered
        });

        emit OperatorClaimSubmitted(operator, noradId, kind, evidenceHash, expiry, recovered);
    }

    // -------------------------------------------------------------
    // Satellite Control Proof Pipeline
    // -------------------------------------------------------------

    function openControlChallenge(uint32 noradId)
        external
        returns (bytes32 challengeId, bytes32 nonce, uint64 deadline)
    {
        if (!isRegistered[msg.sender]) revert NotRegistered(msg.sender);
        if (stakes[msg.sender] < S0_MIN_STAKE) {
            revert InsufficientStake(stakes[msg.sender], S0_MIN_STAKE);
        }

        StoredClaim storage kyb = operatorClaims[msg.sender][KIND_KYB][0];
        if (kyb.expiry <= block.timestamp) revert ClaimExpired(kyb.expiry);

        uint256 counter = challengeCounter[msg.sender][noradId];
        challengeId = keccak256(abi.encode(msg.sender, noradId, counter));

        // Check if an existing open challenge for this operator and satellite is still pending
        ControlChallenge storage existing = challenges[challengeId];
        if (existing.openedAt != 0 && !existing.confirmed && existing.deadline > block.timestamp) {
            revert ChallengeAlreadyOpen(noradId);
        }

        counter++;
        challengeCounter[msg.sender][noradId] = counter;
        challengeId = keccak256(abi.encode(msg.sender, noradId, counter));

        nonce = keccak256(
            abi.encode(blockhash(block.number - 1), msg.sender, noradId, counter, block.timestamp)
        );
        deadline = uint64(block.timestamp + CHALLENGE_DURATION);

        challenges[challengeId] = ControlChallenge({
            operator: msg.sender,
            noradId: noradId,
            nonce: nonce,
            openedAt: uint64(block.timestamp),
            deadline: deadline,
            confirmed: false
        });

        emit ControlChallengeOpened(challengeId, msg.sender, noradId, nonce, deadline);
    }

    /**
     * @notice Confirms a control proof using an observation recorded in AttestationRegistry.
     * @dev The AttestationRegistry's bookingId key is reused as the challengeId.
     *      The contract trusts attesters to have verified that the public nonce is present in frames;
     *      the underlying evidence bundle remains publicly re-verifiable off-chain.
     */
    function confirmControlProof(bytes32 challengeId) external {
        ControlChallenge storage ch = challenges[challengeId];
        if (ch.openedAt == 0) revert ChallengeNotFound(challengeId);
        if (ch.confirmed) return; // Idempotent

        (
            bytes32 bundleHash,
            bytes32 merkleRoot,
            ,
            ,
            ,
            ,
            uint64 submittedAt,
            address[] memory signers
        ) = attestationRegistry.getAttestation(challengeId);

        if (submittedAt == 0) revert AttestationNotFound(challengeId);
        if (submittedAt > ch.deadline + CONTROL_GRACE_PERIOD) {
            revert AttestationLate(submittedAt, ch.deadline + CONTROL_GRACE_PERIOD);
        }

        // Count independent authorized signers
        uint256 independentCount = 0;
        for (uint256 i = 0; i < signers.length; i++) {
            AttesterInfo memory info = attesterInfo[signers[i]];
            if (info.isAuthorized && info.independent) {
                independentCount++;
            }
        }
        if (independentCount < minIndependentControlSigners) {
            revert InsufficientIndependentSigners(independentCount, minIndependentControlSigners);
        }

        ch.confirmed = true;
        uint64 expiry = uint64(block.timestamp + CONTROL_TTL);

        operatorClaims[ch.operator][KIND_CONTROL][ch.noradId] = StoredClaim({
            evidenceHash: bundleHash,
            expiry: expiry,
            signers: signers
        });

        // If no incumbent or previous claim expired, set as active operator
        address incumbent = activeSatelliteOperator[ch.noradId];
        if (incumbent == address(0) || operatorClaims[incumbent][KIND_CONTROL][ch.noradId].expiry <= block.timestamp) {
            activeSatelliteOperator[ch.noradId] = ch.operator;
        }

        if (!_operatorHasTrackedNorad[ch.operator][ch.noradId]) {
            _operatorHasTrackedNorad[ch.operator][ch.noradId] = true;
            _operatorControlledNoradIds[ch.operator].push(ch.noradId);
        }

        emit ControlProofConfirmed(challengeId, ch.operator, ch.noradId, bundleHash, merkleRoot, expiry);
    }

    /**
     * @notice Contest an active controlled claim held by another operator.
     */
    function contestClaim(uint32 noradId, bytes32 challengeId) external {
        ControlChallenge storage ch = challenges[challengeId];
        if (ch.operator != msg.sender || ch.noradId != noradId || !ch.confirmed) {
            revert NoActiveControlProof();
        }

        address incumbent = activeSatelliteOperator[noradId];
        if (incumbent == address(0) || incumbent == msg.sender) {
            revert ContestNotFound(noradId);
        }

        satelliteContested[noradId] = true;
        contestedIncumbent[noradId] = incumbent;
        contestedChallenger[noradId] = msg.sender;

        openContestCount[incumbent]++;
        openContestCount[msg.sender]++;

        emit SatelliteContested(noradId, msg.sender, incumbent, challengeId);
    }

    /**
     * @notice Arbiter resolves an open contest.
     */
    function resolveContest(
        uint32 noradId,
        address winner,
        bool clearBoth
    ) external onlyRole(ARBITER_ROLE) {
        if (!satelliteContested[noradId]) revert ContestNotFound(noradId);

        address incumbent = contestedIncumbent[noradId];
        address challenger = contestedChallenger[noradId];

        satelliteContested[noradId] = false;
        delete contestedIncumbent[noradId];
        delete contestedChallenger[noradId];

        if (openContestCount[incumbent] > 0) openContestCount[incumbent]--;
        if (openContestCount[challenger] > 0) openContestCount[challenger]--;

        if (clearBoth) {
            activeSatelliteOperator[noradId] = address(0);
            operatorClaims[incumbent][KIND_CONTROL][noradId].expiry = 0;
            operatorClaims[challenger][KIND_CONTROL][noradId].expiry = 0;
            emit ContestResolved(noradId, address(0), true);
        } else {
            activeSatelliteOperator[noradId] = winner;
            address loser = (winner == incumbent) ? challenger : incumbent;
            operatorClaims[loser][KIND_CONTROL][noradId].expiry = 0;
            emit ContestResolved(noradId, winner, false);
        }
    }

    // -------------------------------------------------------------
    // Slashing (ARBITER_ROLE)
    // -------------------------------------------------------------

    function slash(
        address operator,
        uint256 amount,
        uint8 reasonCode,
        bytes32 evidenceHash
    ) external onlyRole(ARBITER_ROLE) {
        uint256 currentStake = stakes[operator];
        uint256 slashAmount = amount > currentStake ? currentStake : amount;
        if (slashAmount == 0) return;

        stakes[operator] -= slashAmount;
        totalStaked -= slashAmount;

        (bool ok, ) = payable(compensationPool).call{value: slashAmount}("");
        if (!ok) revert TransferFailed();

        emit Slashed(operator, slashAmount, reasonCode, evidenceHash);
    }

    // -------------------------------------------------------------
    // Pure Tier Derivation & Views
    // -------------------------------------------------------------

    function isControlled(address operator, uint32 noradId) public view returns (bool) {
        if (satelliteContested[noradId]) return false;
        if (activeSatelliteOperator[noradId] != operator) return false;
        StoredClaim storage claim = operatorClaims[operator][KIND_CONTROL][noradId];
        return claim.expiry > block.timestamp;
    }

    function tierOf(address operator) public view returns (uint8) {
        if (!isRegistered[operator]) return 0;

        // Any open dispute / contest disqualifies dependent tier
        bool hasContest = openContestCount[operator] > 0;

        // Tier 0 requirements
        bool hasStakeT0 = stakes[operator] >= S0_MIN_STAKE;
        bool kybActive = operatorClaims[operator][KIND_KYB][0].expiry > block.timestamp;
        bool domainActive = operatorClaims[operator][KIND_DOMAIN][0].expiry > block.timestamp;

        if (!hasStakeT0 || !kybActive || !domainActive) {
            return 0;
        }

        // Tier 1 requirements: Tier 0 + at least one non-expired non-contested controlled satellite
        if (hasContest) {
            // Contested operator disabled from Tier 1 and above
            return 0;
        }

        uint32 activeControlledCount = 0;
        uint32[] storage norads = _operatorControlledNoradIds[operator];
        for (uint256 i = 0; i < norads.length; i++) {
            if (isControlled(operator, norads[i])) {
                activeControlledCount++;
                break; // Found at least 1
            }
        }

        if (activeControlledCount == 0) {
            return 0; // Tier 0 Listed
        }

        // Tier 2 requirements: Tier 1 + stake >= S2 (0.1 ETH) + REGULATORY + 2 independent VOUCH
        bool hasStakeT2 = stakes[operator] >= S2_MIN_STAKE;
        bool regActive = operatorClaims[operator][KIND_REGULATORY][0].expiry > block.timestamp;

        StoredClaim storage vouchClaim = operatorClaims[operator][KIND_VOUCH][0];
        bool vouchActive = vouchClaim.expiry > block.timestamp && vouchClaim.signers.length >= 2;

        if (hasStakeT2 && regActive && vouchActive) {
            return 2;
        }

        return 1;
    }

    function explainTier(address operator) external view returns (TierExplanation memory) {
        bool reg = isRegistered[operator];
        uint256 st = stakes[operator];
        bool hasStakeT0 = st >= S0_MIN_STAKE;
        bool hasStakeT2 = st >= S2_MIN_STAKE;

        StoredClaim storage kyb = operatorClaims[operator][KIND_KYB][0];
        bool kybMet = kyb.expiry > block.timestamp;

        StoredClaim storage dom = operatorClaims[operator][KIND_DOMAIN][0];
        bool domMet = dom.expiry > block.timestamp;

        StoredClaim storage regClaim = operatorClaims[operator][KIND_REGULATORY][0];
        bool regMet = regClaim.expiry > block.timestamp;

        StoredClaim storage vouchClaim = operatorClaims[operator][KIND_VOUCH][0];
        bool vouchMet = vouchClaim.expiry > block.timestamp && vouchClaim.signers.length >= 2;

        uint32[] storage tracked = _operatorControlledNoradIds[operator];
        uint32[] memory activeNorads = new uint32[](tracked.length);
        uint32 activeCount = 0;

        for (uint256 i = 0; i < tracked.length; i++) {
            if (isControlled(operator, tracked[i])) {
                activeNorads[activeCount] = tracked[i];
                activeCount++;
            }
        }

        // Compact array
        uint32[] memory finalActive = new uint32[](activeCount);
        for (uint32 j = 0; j < activeCount; j++) {
            finalActive[j] = activeNorads[j];
        }

        bool hasContest = openContestCount[operator] > 0;
        uint8 derivedTier = tierOf(operator);
        bool suspended = hasContest || (reg && !hasStakeT0);

        return TierExplanation({
            registered: reg,
            stakeAmount: st,
            hasMinStakeT0: hasStakeT0,
            hasMinStakeT2: hasStakeT2,
            kybMet: kybMet,
            kybExpiry: kyb.expiry,
            kybAttesters: kyb.signers,
            domainMet: domMet,
            domainExpiry: dom.expiry,
            domainAttesters: dom.signers,
            controlledSatelliteCount: activeCount,
            activeControlledNoradIds: finalActive,
            hasUnresolvedContest: hasContest,
            regulatoryMet: regMet,
            regulatoryExpiry: regClaim.expiry,
            regulatoryAttesters: regClaim.signers,
            vouchCount: uint32(vouchClaim.signers.length),
            vouchAttesters: vouchClaim.signers,
            currentTier: derivedTier,
            isSuspended: suspended
        });
    }

    function capsOf(uint8 tier)
        external
        pure
        returns (
            uint256 maxBookingValueWei,
            uint32 maxActiveWindows,
            uint32 payoutHoldSeconds
        )
    {
        if (tier == 0) {
            return (0.05 ether, 3, 72 hours);
        } else if (tier == 1) {
            return (0.5 ether, 20, 24 hours);
        } else if (tier == 2) {
            return (5.0 ether, 100, 2 hours);
        } else {
            return (0, 0, 0);
        }
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
