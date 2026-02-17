/**
 * Relayer Utilities for Gas-Free Transactions
 * User signs the proof, relayer submits to blockchain
 */

export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  rpcUrl: 'https://sepolia.base.org',
  name: 'Base Sepolia',
  explorerUrl: 'https://sepolia.basescan.org',
}

export interface VerificationProofPayload {
  user: string
  documentType: string
  proofHash: string
  signature: string // User's signature
  timestamp: number
}

export interface RelayerSubmissionResult {
  txHash: string
  blockNumber: number
  status: 'success' | 'failed'
}

/**
 * Create verification payload for user to sign
 */
export function createVerificationPayload(
  userAddress: string,
  documentType: string,
  proofHash: string,
  timestamp: number
): VerificationProofPayload {
  return {
    user: userAddress,
    documentType,
    proofHash,
    signature: '', // To be filled by wallet signature
    timestamp,
  }
}

/**
 * Format payload for signing
 */
export function formatPayloadForSigning(payload: VerificationProofPayload): string {
  const message = `Verify ${payload.documentType} on DuDucks\nProof Hash: ${payload.proofHash}\nTimestamp: ${payload.timestamp}`
  return message
}

/**
 * Verify signature (user's wallet signature)
 */
export async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  // This will be verified on-chain in the contract
  // For now, we'll do client-side validation using ethers or web3.js
  try {
    // Placeholder - will implement with viem
    console.log('[Relayer] Verifying signature for address:', address)
    return true
  } catch (error) {
    console.error('[Relayer] Signature verification failed:', error)
    return false
  }
}

/**
 * Submit verified proof to blockchain via relayer
 */
export async function submitProofViaRelayer(
  payload: VerificationProofPayload,
  relayerUrl: string
): Promise<RelayerSubmissionResult> {
  try {
    const response = await fetch(`${relayerUrl}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Relayer submission failed: ${response.statusText}`)
    }

    const result: RelayerSubmissionResult = await response.json()
    return result
  } catch (error) {
    console.error('[Relayer] Submission failed:', error)
    throw error
  }
}

/**
 * Check relayer health
 */
export async function checkRelayerHealth(relayerUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${relayerUrl}/health`, {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Format verification for blockchain submission
 * This is the data the relayer will submit to VerificationRegistry
 */
export interface BlockchainVerificationData {
  user: string
  documentType: string
  proofHash: string
  signature: string
  timestamp: number
}

export function formatForBlockchain(
  payload: VerificationProofPayload
): BlockchainVerificationData {
  return {
    user: payload.user,
    documentType: payload.documentType,
    proofHash: payload.proofHash,
    signature: payload.signature,
    timestamp: payload.timestamp,
  }
}
