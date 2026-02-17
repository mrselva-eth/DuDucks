// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VerificationRegistry
 * @notice Registry for verified documents on-chain
 * @dev Base contract for DuDucks verification system
 */

interface IVerifier {
    function verify(uint256[2] memory proof, uint256[2] memory pubSignals) external view returns (bool);
}

contract VerificationRegistry {
    // Verification status
    enum VerificationStatus { PENDING, VERIFIED, REJECTED, REVOKED }

    // Events
    event VerificationSubmitted(
        address indexed user,
        string documentType,
        bytes32 indexed verificationHash,
        uint256 timestamp
    );

    event VerificationApproved(
        address indexed user,
        bytes32 indexed verificationHash,
        uint256 timestamp
    );

    event VerificationRevoked(
        address indexed user,
        bytes32 indexed verificationHash,
        uint256 timestamp
    );

    // Storage
    mapping(address => mapping(string => VerificationRecord)) public verifications;
    mapping(bytes32 => VerificationRecord) public verificationsByHash;
    
    IVerifier public verifier;
    address public relayer;
    address public admin;

    struct VerificationRecord {
        address user;
        string documentType;
        bytes32 proofHash;
        VerificationStatus status;
        uint256 timestamp;
        uint256 expiryTime;
    }

    // Modifiers
    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call this");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    // Constructor
    constructor(address _verifier, address _relayer) {
        verifier = IVerifier(_verifier);
        relayer = _relayer;
        admin = msg.sender;
    }

    /**
     * @notice Submit a verification proof
     * @param user The user address
     * @param documentType The type of document (e.g., "aadhaar")
     * @param proofHash The hash of the proof
     */
    function submitVerification(
        address user,
        string memory documentType,
        bytes32 proofHash
    ) external onlyRelayer {
        require(user != address(0), "Invalid user address");
        
        bytes32 verificationHash = keccak256(abi.encodePacked(user, documentType, block.timestamp));
        
        verifications[user][documentType] = VerificationRecord({
            user: user,
            documentType: documentType,
            proofHash: proofHash,
            status: VerificationStatus.VERIFIED,
            timestamp: block.timestamp,
            expiryTime: block.timestamp + 365 days
        });

        verificationsByHash[verificationHash] = verifications[user][documentType];

        emit VerificationSubmitted(user, documentType, verificationHash, block.timestamp);
        emit VerificationApproved(user, verificationHash, block.timestamp);
    }

    /**
     * @notice Get verification status for a user
     * @param user The user address
     * @param documentType The type of document
     */
    function getVerificationStatus(
        address user,
        string memory documentType
    ) external view returns (VerificationRecord memory) {
        return verifications[user][documentType];
    }

    /**
     * @notice Revoke a verification
     * @param user The user address
     * @param documentType The type of document
     */
    function revokeVerification(
        address user,
        string memory documentType
    ) external onlyAdmin {
        require(user != address(0), "Invalid user address");
        
        VerificationRecord storage record = verifications[user][documentType];
        require(record.status == VerificationStatus.VERIFIED, "Verification not verified");
        
        record.status = VerificationStatus.REVOKED;
        
        bytes32 verificationHash = keccak256(abi.encodePacked(user, documentType, record.timestamp));
        emit VerificationRevoked(user, verificationHash, block.timestamp);
    }

    /**
     * @notice Update relayer address
     */
    function setRelayer(address newRelayer) external onlyAdmin {
        require(newRelayer != address(0), "Invalid relayer address");
        relayer = newRelayer;
    }

    /**
     * @notice Update verifier address
     */
    function setVerifier(address newVerifier) external onlyAdmin {
        require(newVerifier != address(0), "Invalid verifier address");
        verifier = IVerifier(newVerifier);
    }
}
