pragma circom 2.0.0;

// Import necessary templates
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";
include "circomlib/bitify.circom";

/**
 * @title AgeVerification
 * @notice Zero-Knowledge circuit to prove age >= 18 without revealing actual age
 * 
 * Public Inputs:
 *   - ageCommitment: Poseidon hash of (age, salt)
 *   - documentHash: Hash of the document
 *   - currentTimestamp: Current block timestamp
 * 
 * Private Inputs:
 *   - age: The actual age (secret)
 *   - salt: Random salt for commitment (secret)
 *   - docData: Extracted document data (secret)
 *   - birthDate: Birth date from document (secret)
 *   - documentIssuanceDate: When document was issued (secret)
 */

template AgeVerification() {
    // Public inputs
    signal input ageCommitment;
    signal input documentHash;
    signal input currentTimestamp;
    
    // Private inputs
    signal input age;
    signal input salt;
    signal input docData;
    signal input birthDate;
    signal input documentIssuanceDate;
    
    // Output: proof is valid (1) or invalid (0)
    signal output proofValid;
    
    // ===== Step 1: Verify Age Commitment =====
    // Verify that ageCommitment = Poseidon(age, salt)
    component ageHasher = Poseidon(2);
    ageHasher.inputs[0] <== age;
    ageHasher.inputs[1] <== salt;
    
    // The commitment must match
    ageCommitment === ageHasher.out;
    
    // ===== Step 2: Age Range Check =====
    // Prove age >= 18 without revealing the actual age
    // We check that (age - 18) is in the valid range [0, 150]
    
    component ageGte18 = GreaterEqThan(8);
    ageGte18.in[0] <== age;
    ageGte18.in[1] <== 18;
    ageGte18.out === 1;  // Must be >= 18
    
    // Also verify age is <= 150 (reasonable upper bound)
    component ageLte150 = LessThan(8);
    ageLte150.in[0] <== age;
    ageLte150.in[1] <== 151;
    ageLte150.out === 1;  // Must be < 151
    
    // ===== Step 3: Document Date Validation =====
    // Verify document issuance is recent (within 10 years)
    // timeDiff = currentTimestamp - documentIssuanceDate
    signal timeDiff <== currentTimestamp - documentIssuanceDate;
    
    // 10 years in seconds = 315,360,000
    component dateValid = LessThan(32);
    dateValid.in[0] <== timeDiff;
    dateValid.in[1] <== 315360000;  // 10 years
    dateValid.out === 1;
    
    // ===== Step 4: Birth Date Sanity Check =====
    // Verify birthDate + age years < currentTimestamp
    // This ensures the age value is consistent with the birth date
    signal ageInSeconds <== age * 31536000;  // 1 year = 31,536,000 seconds
    signal expectedCurrentTimestamp <== birthDate + ageInSeconds;
    
    component birthDateValid = LessThan(32);
    birthDateValid.in[0] <== expectedCurrentTimestamp;
    birthDateValid.in[1] <== currentTimestamp + 31536000;  // Allow 1 year margin
    birthDateValid.out === 1;
    
    // ===== Step 5: Document Integrity =====
    // Verify document hash matches the provided data
    // documentHash should be Poseidon(docData, salt)
    component docHasher = Poseidon(2);
    docHasher.inputs[0] <== docData;
    docHasher.inputs[1] <== salt;
    
    documentHash === docHasher.out;
    
    // ===== Step 6: Final Output =====
    // If all constraints are satisfied, proof is valid
    proofValid <== 1;
}

// Main component
component main {public [ageCommitment, documentHash, currentTimestamp]} = AgeVerification();
