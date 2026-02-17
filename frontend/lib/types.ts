/**
 * DuDucks Type Definitions
 */

/**
 * Supported document types for verification
 */
export enum DocumentType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
}

/**
 * Verification status states
 */
export enum VerificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  VERIFIED = 'verified',
  FAILED = 'failed',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

/**
 * User profile information
 */
export interface UserProfile {
  address: string
  connectedAt: number
  verifications: Record<DocumentType, VerificationRecord>
}

/**
 * Verification record stored on-chain and in database
 */
export interface VerificationRecord {
  user: string
  documentType: DocumentType
  status: VerificationStatus
  proofHash: string
  txHash?: string
  verifiedAt: number
  expiresAt: number
  metadata: {
    digiLockerDocumentId: string
    dataHash: string
  }
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

/**
 * DigiLocker user info from OAuth
 */
export interface DigiLockerUser {
  uid: string
  name: string
  email: string
  mobileNumber: string
}

/**
 * ZK Proof submission request
 */
export interface ProofSubmissionRequest {
  userAddress: string
  documentType: DocumentType
  proof: {
    pi_a: [string, string]
    pi_b: [[string, string], [string, string]]
    pi_c: [string, string]
  }
  publicSignals: string[]
  signature: string
}

/**
 * Verification event emitted from blockchain
 */
export interface VerificationEvent {
  user: string
  documentType: string
  verificationHash: string
  txHash: string
  timestamp: number
  blockNumber: number
}

/**
 * Environment variables required
 */
export interface EnvironmentConfig {
  // DigiLocker OAuth
  DIGILOCKER_CLIENT_ID: string
  DIGILOCKER_CLIENT_SECRET: string
  DIGILOCKER_REDIRECT_URI: string

  // Wallet and Blockchain
  PRIVATE_KEY_RELAYER: string
  BASE_SEPOLIA_RPC: string
  VERIFICATION_REGISTRY_ADDRESS: string
  VERIFIER_ADDRESS: string

  // Application
  NEXT_PUBLIC_APP_URL: string
  NEXT_PUBLIC_RELAYER_URL: string

  // Optional: For analytics and monitoring
  SENTRY_DSN?: string
}
