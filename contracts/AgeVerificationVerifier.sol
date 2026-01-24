// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AgeVerificationVerifier
 * @notice Smart contract to verify ZK-SNARK proofs for age verification
 * 
 * This contract:
 * 1. Receives ZK proofs from users proving they are >= 18
 * 2. Verifies proofs using the Groth16 verifier
 * 3. Stores verified proofs on-chain
 * 4. Allows other contracts to query verification status
 */

interface IGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool);
}

contract AgeVerificationVerifier {
    // ===== Events =====
    event ProofVerified(
        address indexed user,
        bytes32 indexed proofId,
        uint256 ageCommitment,
        uint256 timestamp
    );

    event ProofSubmitted(
        address indexed user,
        bytes32 indexed proofId,
        uint256 timestamp
    );

    event VerifierUpdated(address indexed newVerifier);

    // ===== State Variables =====
    address public verifierContract;
    address public owner;

    // Proof storage
    struct AgeProof {
        address user;
        uint256 ageCommitment; // Poseidon(age, salt) - proves age >= 18
        uint256 documentHash; // TLS-verified document hash
        uint256 currentTimestamp; // Timestamp when proof was created
        uint256 verifiedAt; // Block timestamp when verified on-chain
        bool isValid; // Whether proof passed verification
        string proofHash; // IPFS hash of proof data
    }

    // Mappings
    mapping(bytes32 => AgeProof) public proofs;
    mapping(address => bytes32[]) public userProofs;
    mapping(address => bool) public verifiedUsers; // Quick lookup for other contracts
    mapping(address => uint256) public verificationTimestamps;

    // Proof validity period (default: 1 year)
    uint256 public proofValidityPeriod = 365 days;

    // ===== Modifiers =====
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier proofExists(bytes32 proofId) {
        require(proofs[proofId].user != address(0), "Proof does not exist");
        _;
    }

    // ===== Constructor =====
    constructor(address _verifierContract) {
        require(_verifierContract != address(0), "Invalid verifier contract");
        verifierContract = _verifierContract;
        owner = msg.sender;
    }

    // ===== Main Functions =====

    /**
     * @notice Submit and verify a ZK proof for age verification
     * @param _proofId Unique identifier for this proof
     * @param _pA First component of the proof (2 elements)
     * @param _pB Second component of the proof (2x2 elements)
     * @param _pC Third component of the proof (2 elements)
     * @param _pubSignals Public signals: [ageCommitment, documentHash, currentTimestamp]
     * @param _proofHash IPFS hash of the full proof data
     */
    function submitAndVerifyProof(
        bytes32 _proofId,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals,
        string calldata _proofHash
    ) external returns (bool) {
        require(_pubSignals[0] != 0, "Invalid age commitment");
        require(_pubSignals[1] != 0, "Invalid document hash");
        require(_pubSignals[2] > 0, "Invalid timestamp");

        // Verify proof with Groth16 verifier
        bool isValid = IGroth16Verifier(verifierContract).verifyProof(
            _pA,
            _pB,
            _pC,
            _pubSignals
        );

        require(isValid, "ZK proof verification failed");

        // Store proof
        AgeProof memory newProof = AgeProof({
            user: msg.sender,
            ageCommitment: _pubSignals[0],
            documentHash: _pubSignals[1],
            currentTimestamp: _pubSignals[2],
            verifiedAt: block.timestamp,
            isValid: true,
            proofHash: _proofHash
        });

        proofs[_proofId] = newProof;
        userProofs[msg.sender].push(_proofId);
        verifiedUsers[msg.sender] = true;
        verificationTimestamps[msg.sender] = block.timestamp;

        emit ProofVerified(
            msg.sender,
            _proofId,
            _pubSignals[0],
            block.timestamp
        );

        return true;
    }

    /**
     * @notice Submit a proof without verifying immediately (for batch verification)
     * @param _proofId Unique identifier
     * @param _ageCommitment Age commitment from proof
     * @param _documentHash Document hash from proof
     * @param _currentTimestamp Timestamp from proof
     * @param _proofHash IPFS hash
     */
    function submitProof(
        bytes32 _proofId,
        uint256 _ageCommitment,
        uint256 _documentHash,
        uint256 _currentTimestamp,
        string calldata _proofHash
    ) external {
        require(_ageCommitment != 0, "Invalid age commitment");
        require(_documentHash != 0, "Invalid document hash");

        AgeProof memory newProof = AgeProof({
            user: msg.sender,
            ageCommitment: _ageCommitment,
            documentHash: _documentHash,
            currentTimestamp: _currentTimestamp,
            verifiedAt: 0,
            isValid: false,
            proofHash: _proofHash
        });

        proofs[_proofId] = newProof;
        userProofs[msg.sender].push(_proofId);

        emit ProofSubmitted(msg.sender, _proofId, block.timestamp);
    }

    /**
     * @notice Verify a previously submitted proof
     * @param _proofId ID of the proof to verify
     * @param _pA Proof component A
     * @param _pB Proof component B
     * @param _pC Proof component C
     */
    function verifyProof(
        bytes32 _proofId,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC
    ) external proofExists(_proofId) returns (bool) {
        AgeProof storage proof = proofs[_proofId];

        require(proof.user == msg.sender, "Not proof owner");
        require(!proof.isValid, "Proof already verified");

        uint[3] memory pubSignals = [
            proof.ageCommitment,
            proof.documentHash,
            proof.currentTimestamp
        ];

        // Verify proof
        bool isValid = IGroth16Verifier(verifierContract).verifyProof(
            _pA,
            _pB,
            _pC,
            pubSignals
        );

        require(isValid, "ZK proof verification failed");

        // Mark as verified
        proof.isValid = true;
        proof.verifiedAt = block.timestamp;
        verifiedUsers[msg.sender] = true;
        verificationTimestamps[msg.sender] = block.timestamp;

        emit ProofVerified(msg.sender, _proofId, proof.ageCommitment, block.timestamp);

        return true;
    }

    // ===== Query Functions =====

    /**
     * @notice Check if a user has a valid, non-expired age verification
     * @param _user User address to check
     * @return True if user has valid verification
     */
    function isAgeVerified(address _user) external view returns (bool) {
        if (!verifiedUsers[_user]) {
            return false;
        }

        uint256 lastVerification = verificationTimestamps[_user];
        return (block.timestamp - lastVerification) < proofValidityPeriod;
    }

    /**
     * @notice Get proof details
     * @param _proofId ID of the proof
     */
    function getProof(bytes32 _proofId)
        external
        view
        proofExists(_proofId)
        returns (AgeProof memory)
    {
        return proofs[_proofId];
    }

    /**
     * @notice Get all proofs for a user
     * @param _user User address
     */
    function getUserProofs(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userProofs[_user];
    }

    /**
     * @notice Get number of proofs for a user
     * @param _user User address
     */
    function getUserProofCount(address _user) external view returns (uint256) {
        return userProofs[_user].length;
    }

    /**
     * @notice Check if a specific proof is valid
     * @param _proofId ID of the proof
     */
    function isProofValid(bytes32 _proofId)
        external
        view
        proofExists(_proofId)
        returns (bool)
    {
        AgeProof memory proof = proofs[_proofId];
        return proof.isValid && (block.timestamp - proof.verifiedAt) < proofValidityPeriod;
    }

    /**
     * @notice Get verification status for a user
     * @param _user User address
     */
    function getVerificationStatus(address _user)
        external
        view
        returns (
            bool isVerified,
            uint256 timestamp,
            uint256 expiresAt
        )
    {
        isVerified = verifiedUsers[_user];
        timestamp = verificationTimestamps[_user];
        expiresAt = timestamp + proofValidityPeriod;
    }

    // ===== Admin Functions =====

    /**
     * @notice Update the verifier contract (for upgrades)
     * @param _newVerifier Address of new verifier contract
     */
    function updateVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier address");
        verifierContract = _newVerifier;
        emit VerifierUpdated(_newVerifier);
    }

    /**
     * @notice Update proof validity period
     * @param _newPeriod New validity period in seconds
     */
    function setProofValidityPeriod(uint256 _newPeriod) external onlyOwner {
        require(_newPeriod > 0, "Invalid period");
        proofValidityPeriod = _newPeriod;
    }

    /**
     * @notice Revoke a proof
     * @param _proofId ID of the proof to revoke
     */
    function revokeProof(bytes32 _proofId) external onlyOwner {
        require(proofs[_proofId].user != address(0), "Proof does not exist");
        delete proofs[_proofId];
    }

    /**
     * @notice Emergency: Remove a user's verification status
     * @param _user User address
     */
    function revokeUserVerification(address _user) external onlyOwner {
        verifiedUsers[_user] = false;
        verificationTimestamps[_user] = 0;
    }

    // ===== Events Helper =====
    function getLastProofForUser(address _user)
        external
        view
        returns (bytes32)
    {
        bytes32[] memory userProofIds = userProofs[_user];
        require(userProofIds.length > 0, "No proofs found for user");
        return userProofIds[userProofIds.length - 1];
    }
}
