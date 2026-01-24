// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * Age Verification Zero-Knowledge Proof Smart Contract
 * Stores and verifies ZK proofs for age verification
 * Users submit proofs without revealing their actual age or identity details
 */

contract AgeVerificationZKP {
    // Events
    event ProofSubmitted(
        address indexed user,
        bytes32 commitment,
        uint256 minAge,
        uint256 timestamp
    );

    event ProofVerified(
        address indexed user,
        bytes32 commitment,
        uint256 timestamp
    );

    // Proof record structure
    struct ProofRecord {
        address user;
        bytes32 commitment; // Commitment hash of identity data
        bytes32 hashedAge; // Hash of age verification data
        uint256 minAge; // Minimum age proven
        uint256 timestamp; // Proof creation time
        bytes32 proofSignature; // Proof signature
        bool verified;
    }

    // Mappings
    mapping(address => ProofRecord[]) public userProofs;
    mapping(bytes32 => bool) public proofExists; // commitment -> exists
    mapping(address => bool) public verifiedUsers; // users with valid proofs
    mapping(address => uint256) public userMinAgeVerified; // highest min age verified

    // Admin and owner
    address public owner;
    mapping(address => bool) public verifiers; // authorized verifiers

    // Contract state
    bool public paused = false;
    uint256 public proofExpirationTime = 365 days; // proofs expire after 1 year

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyVerifier() {
        require(
            msg.sender == owner || verifiers[msg.sender],
            "Only verifier can call this"
        );
        _;
    }

    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        verifiers[msg.sender] = true;
    }

    /**
     * Submit a ZK proof for age verification
     * @param commitment Commitment hash of the identity data
     * @param hashedAge Hash of age verification (doesn't reveal age)
     * @param minAge Minimum age being verified
     * @param timestamp Proof creation timestamp
     * @param proofSignature Proof signature hash
     */
    function submitProof(
        bytes32 commitment,
        bytes32 hashedAge,
        uint256 minAge,
        uint256 timestamp,
        bytes32 proofSignature
    ) external notPaused {
        require(
            commitment != bytes32(0),
            "Invalid commitment"
        );
        require(minAge > 0 && minAge <= 150, "Invalid age requirement");
        require(
            timestamp <= block.timestamp,
            "Invalid timestamp"
        );
        require(
            block.timestamp - timestamp < 1 hours,
            "Proof is too old"
        );

        // Check proof expiration
        ProofRecord[] storage proofs = userProofs[msg.sender];
        for (uint i = 0; i < proofs.length; i++) {
            if (
                proofs[i].commitment == commitment &&
                block.timestamp - proofs[i].timestamp < proofExpirationTime
            ) {
                revert("Similar proof already exists");
            }
        }

        // Store proof
        ProofRecord memory newProof = ProofRecord({
            user: msg.sender,
            commitment: commitment,
            hashedAge: hashedAge,
            minAge: minAge,
            timestamp: timestamp,
            proofSignature: proofSignature,
            verified: false
        });

        userProofs[msg.sender].push(newProof);
        proofExists[commitment] = true;

        emit ProofSubmitted(
            msg.sender,
            commitment,
            minAge,
            timestamp
        );
    }

    /**
     * Verify a submitted proof (called by authorized verifier)
     * @param user User address
     * @param proofIndex Index of the proof in user's proof array
     */
    function verifyProof(address user, uint256 proofIndex)
        external
        onlyVerifier
        notPaused
    {
        require(proofIndex < userProofs[user].length, "Invalid proof index");

        ProofRecord storage proof = userProofs[user][proofIndex];
        require(!proof.verified, "Proof already verified");

        // Verify proof is not expired
        require(
            block.timestamp - proof.timestamp < proofExpirationTime,
            "Proof has expired"
        );

        // Mark proof as verified
        proof.verified = true;

        // Update user verification status
        verifiedUsers[user] = true;
        if (proof.minAge > userMinAgeVerified[user]) {
            userMinAgeVerified[user] = proof.minAge;
        }

        emit ProofVerified(user, proof.commitment, proof.timestamp);
    }

    /**
     * Check if a user has a valid verified proof
     * @param user User address
     * @return hasValidProof Whether user has a valid verified proof
     * @return minAgeVerified Highest minimum age verified for this user
     */
    function isUserVerified(address user)
        external
        view
        returns (bool hasValidProof, uint256 minAgeVerified)
    {
        hasValidProof = false;
        minAgeVerified = 0;

        ProofRecord[] storage proofs = userProofs[user];
        for (uint i = 0; i < proofs.length; i++) {
            if (
                proofs[i].verified &&
                block.timestamp - proofs[i].timestamp < proofExpirationTime
            ) {
                hasValidProof = true;
                if (proofs[i].minAge > minAgeVerified) {
                    minAgeVerified = proofs[i].minAge;
                }
            }
        }
    }

    /**
     * Check if user is verified for a specific age requirement
     * @param user User address
     * @param requiredAge Required minimum age
     * @return isVerified Whether user meets the age requirement
     */
    function isUserVerifiedForAge(address user, uint256 requiredAge)
        external
        view
        returns (bool)
    {
        return userMinAgeVerified[user] >= requiredAge;
    }

    /**
     * Get user's proofs
     * @param user User address
     * @return Array of proofs for the user
     */
    function getUserProofs(address user)
        external
        view
        returns (ProofRecord[] memory)
    {
        return userProofs[user];
    }

    /**
     * Owner functions
     */
    function setProofExpirationTime(uint256 _expirationTime)
        external
        onlyOwner
    {
        proofExpirationTime = _expirationTime;
    }

    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
    }

    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }
}
