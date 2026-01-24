import crypto from 'crypto';

/**
 * Zero-Knowledge Proof (ZKP) Implementation for Age Verification
 * This uses a simplified commitment-based ZKP scheme
 */

interface IdentityData {
  name: string;
  dateOfBirth: string; // ISO format YYYY-MM-DD
  documentId: string;
  issuingCountry: string;
}

interface ZKProof {
  commitment: string; // Hash commitment of the identity data
  ageVerification: {
    proof: string; // Cryptographic proof of age
    minAge: number; // Minimum age being verified
    timestamp: number;
  };
  documentHash: string; // Hash of the document image
  publicInputs: {
    commitment: string;
    hashedAge: string;
    timestamp: number;
  };
}

/**
 * Generate a commitment from identity data
 * This proves possession without revealing content
 */
export function generateCommitment(data: IdentityData, salt: string): string {
  const dataString = JSON.stringify({
    name: data.name,
    dateOfBirth: data.dateOfBirth,
    documentId: data.documentId,
    issuingCountry: data.issuingCountry,
  });

  return crypto
    .createHash('sha256')
    .update(dataString + salt)
    .digest('hex');
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Generate ZK Proof for age verification
 * Proves the user is at least minAge without revealing exact age
 */
export function generateAgeVerificationProof(
  identityData: IdentityData,
  minAge: number,
  salt: string
): ZKProof | null {
  const age = calculateAge(identityData.dateOfBirth);

  // Verify age requirement
  if (age < minAge) {
    return null; // Cannot generate valid proof
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Generate commitment
  const commitment = generateCommitment(identityData, salt);

  // Create age proof: hash(actual_age, min_age, commitment)
  const ageProofData = `${age}${minAge}${commitment}${timestamp}`;
  const ageProof = crypto
    .createHash('sha256')
    .update(ageProofData)
    .digest('hex');

  // Hash the age for public inputs (reveals nothing about exact age)
  const hashedAge = crypto
    .createHash('sha256')
    .update(`${minAge}${timestamp}`)
    .digest('hex');

  return {
    commitment,
    ageVerification: {
      proof: ageProof,
      minAge,
      timestamp,
    },
    documentHash: crypto
      .createHash('sha256')
      .update(identityData.documentId)
      .digest('hex'),
    publicInputs: {
      commitment,
      hashedAge,
      timestamp,
    },
  };
}

/**
 * Verify a ZK proof (server-side or contract-side verification)
 * This is a simplified verification - in production, use proper ZKP libraries
 */
export function verifyAgeProof(
  proof: ZKProof,
  identityData: IdentityData,
  salt: string
): boolean {
  // Verify commitment
  const expectedCommitment = generateCommitment(identityData, salt);
  if (proof.commitment !== expectedCommitment) {
    return false;
  }

  // Verify age requirement
  const age = calculateAge(identityData.dateOfBirth);
  if (age < proof.ageVerification.minAge) {
    return false;
  }

  // Verify age proof hash
  const ageProofData = `${age}${proof.ageVerification.minAge}${proof.commitment}${proof.ageVerification.timestamp}`;
  const expectedAgeProof = crypto
    .createHash('sha256')
    .update(ageProofData)
    .digest('hex');

  if (proof.ageVerification.proof !== expectedAgeProof) {
    return false;
  }

  return true;
}

/**
 * Hash document for verification
 */
export function hashDocument(documentBuffer: Buffer): string {
  return crypto.createHash('sha256').update(documentBuffer).digest('hex');
}

/**
 * Generate a cryptographic salt for the proof
 */
export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create proof data for on-chain submission
 */
export function createOnChainProofData(
  proof: ZKProof,
  userAddress: string
): {
  commitment: string;
  hashedAge: string;
  timestamp: number;
  userAddress: string;
  proofSignature: string;
} {
  const dataToSign = `${proof.commitment}${proof.publicInputs.hashedAge}${proof.ageVerification.timestamp}${userAddress}`;
  const proofSignature = crypto
    .createHash('sha256')
    .update(dataToSign)
    .digest('hex');

  return {
    commitment: proof.commitment,
    hashedAge: proof.publicInputs.hashedAge,
    timestamp: proof.ageVerification.timestamp,
    userAddress,
    proofSignature,
  };
}
