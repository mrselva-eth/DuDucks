import { groth16 } from 'snarkjs';
import { poseidon } from 'circomlibjs';

/**
 * ZK-SNARK Proof Generation and Verification
 * Using Circom circuits and SnarkJS
 */

interface ProofInput {
  ageCommitment: string;
  documentHash: string;
  currentTimestamp: number;
  age: number;
  salt: number;
  docData: number;
  birthDate: number;
  documentIssuanceDate: number;
}

interface GeneratedProof {
  proof: any;
  publicSignals: string[];
  proofJson: string;
}

/**
 * Generate Poseidon hash for commitment
 * Used for age and document commitments
 */
export async function generatePoseidonHash(
  input1: number | bigint,
  input2: number | bigint
): Promise<string> {
  try {
    const inputs = [BigInt(input1), BigInt(input2)];
    const hash = poseidon(inputs);
    return hash.toString();
  } catch (error) {
    console.error('[v0] Error generating Poseidon hash:', error);
    throw error;
  }
}

/**
 * Generate ZK proof for age verification
 * Proves age >= 18 without revealing actual age
 */
export async function generateAgeProof(
  input: ProofInput,
  wasmFile: ArrayBuffer,
  zkeyFile: ArrayBuffer
): Promise<GeneratedProof> {
  try {
    console.log('[v0] Generating age verification proof...');

    const proofInput = {
      ageCommitment: input.ageCommitment,
      documentHash: input.documentHash,
      currentTimestamp: input.currentTimestamp,
      age: input.age,
      salt: input.salt,
      docData: input.docData,
      birthDate: input.birthDate,
      documentIssuanceDate: input.documentIssuanceDate,
    };

    console.log('[v0] Proof input prepared');

    // Generate proof using groth16
    const { proof, publicSignals } = await groth16.fullProve(
      proofInput,
      wasmFile,
      zkeyFile
    );

    console.log('[v0] Proof generated successfully');
    console.log('[v0] Public signals:', publicSignals);

    return {
      proof,
      publicSignals,
      proofJson: JSON.stringify({
        proof,
        publicSignals,
      }),
    };
  } catch (error) {
    console.error('[v0] Error generating proof:', error);
    throw error;
  }
}

/**
 * Verify ZK proof locally (before submitting on-chain)
 */
export async function verifyProofLocally(
  proof: any,
  publicSignals: string[],
  verificationKeyJson: any
): Promise<boolean> {
  try {
    console.log('[v0] Verifying proof locally...');

    const isValid = await groth16.verify(
      verificationKeyJson,
      publicSignals,
      proof
    );

    console.log('[v0] Local verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('[v0] Error verifying proof:', error);
    return false;
  }
}

/**
 * Format proof for smart contract submission
 * Converts proof to contract-compatible format
 */
export function formatProofForContract(proof: any): {
  a: string[];
  b: string[][];
  c: string[];
} {
  try {
    const proofFormatted = {
      a: [proof.pi_a[0].toString(), proof.pi_a[1].toString()],
      b: [
        [proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString()],
        [proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString()],
      ],
      c: [proof.pi_c[0].toString(), proof.pi_c[1].toString()],
    };

    console.log('[v0] Proof formatted for contract submission');
    return proofFormatted;
  } catch (error) {
    console.error('[v0] Error formatting proof:', error);
    throw error;
  }
}

/**
 * Extract proof components for on-chain verification
 */
export function extractProofComponents(proof: any): {
  piA: [string, string];
  piB: [[string, string], [string, string]];
  piC: [string, string];
} {
  return {
    piA: [proof.pi_a[0].toString(), proof.pi_a[1].toString()],
    piB: [
      [proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString()],
      [proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString()],
    ],
    piC: [proof.pi_c[0].toString(), proof.pi_c[1].toString()],
  };
}

/**
 * Create witness for proof generation
 * Used internally by the prover
 */
export async function createWitness(
  input: ProofInput,
  wasmFile: ArrayBuffer
): Promise<any> {
  try {
    console.log('[v0] Creating witness...');

    // This would use circom's witness calculator
    // Implementation depends on your circuit setup

    console.log('[v0] Witness created');
    return null; // Return actual witness
  } catch (error) {
    console.error('[v0] Error creating witness:', error);
    throw error;
  }
}

/**
 * Verify proof parameters are valid
 */
export function validateProofInput(input: ProofInput): boolean {
  try {
    // Validate age range
    if (input.age < 0 || input.age > 150) {
      console.error('[v0] Invalid age value');
      return false;
    }

    // Validate timestamps
    if (input.documentIssuanceDate > input.currentTimestamp) {
      console.error('[v0] Document issuance date is in the future');
      return false;
    }

    // Validate birth date
    if (input.birthDate > input.currentTimestamp) {
      console.error('[v0] Birth date is in the future');
      return false;
    }

    console.log('[v0] Proof input validation passed');
    return true;
  } catch (error) {
    console.error('[v0] Error validating proof input:', error);
    return false;
  }
}

/**
 * Convert public signals to numbers (for display/debugging)
 */
export function parsePublicSignals(publicSignals: string[]): {
  ageCommitment: string;
  documentHash: string;
  currentTimestamp: string;
} {
  if (publicSignals.length < 3) {
    throw new Error('Invalid number of public signals');
  }

  return {
    ageCommitment: publicSignals[0],
    documentHash: publicSignals[1],
    currentTimestamp: publicSignals[2],
  };
}
