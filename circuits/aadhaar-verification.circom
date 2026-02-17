pragma circom 2.0;

/**
 * Aadhaar Verification Circuit (Circom 2 + Groth16)
 * 
 * Verifies Aadhaar card validity without revealing personal information.
 * 
 * Process:
 * 1. Takes Aadhaar data extracted from DigiLocker
 * 2. Hashes the data with a salt
 * 3. Verifies the hash matches the committed hash from DigiLocker
 * 4. Verifies document is not expired
 * 5. Outputs a zero-knowledge proof of validity
 * 
 * Inputs:
 *   - aadhaarData[256]: Aadhaar document data as bits
 *   - salt[32]: Random salt for hashing
 *   - dataHash: Expected hash of the Aadhaar data
 *   - expiryDate: Expiry date (Unix timestamp)
 *   - currentTime: Current time for expiry check
 * 
 * Outputs:
 *   - isValid: 1 if all checks pass, 0 otherwise
 */

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template AadhaarVerification() {
    // Inputs - Aadhaar data
    signal input aadhaarData[256];
    signal input salt[32];
    
    // Hash inputs - for verification
    signal input dataHash;
    
    // Expiry check inputs
    signal input expiryDate;
    signal input currentTime;
    
    // Output
    signal output isValid;
    
    // ========== Step 1: Hash Aadhaar Data with Salt ==========
    // Combine aadhaar data and salt into a single input array
    var combined_len = 256 + 32;
    signal combined_data[combined_len];
    
    // Copy aadhaar data
    for (var i = 0; i < 256; i++) {
        combined_data[i] <== aadhaarData[i];
    }
    
    // Copy salt
    for (var i = 0; i < 32; i++) {
        combined_data[256 + i] <== salt[i];
    }
    
    // Hash using Poseidon (efficient and ZK-friendly)
    component poseidon = Poseidon(combined_len);
    for (var i = 0; i < combined_len; i++) {
        poseidon.inputs[i] <== combined_data[i];
    }
    
    signal computedHash <== poseidon.out;
    
    // ========== Step 2: Verify Hash Matches ==========
    // The computed hash must equal the provided dataHash
    component hashCheck = IsEqual();
    hashCheck.in[0] <== computedHash;
    hashCheck.in[1] <== dataHash;
    signal hashValid <== hashCheck.out;
    
    // ========== Step 3: Verify Document Not Expired ==========
    // currentTime must be less than expiryDate
    // Create a constraint: expiryDate - currentTime > 0
    signal timeDiff <== expiryDate - currentTime;
    
    // Check that timeDiff is positive (document not expired)
    component timeCheck = GreaterThan(32);
    timeCheck.in[0] <== timeDiff;
    timeCheck.in[1] <== 0;
    signal timeValid <== timeCheck.out;
    
    // ========== Step 4: Combine Checks ==========
    // isValid = 1 only if both hash is valid AND document not expired
    // Note: In a real circuit, we'd use AND gate but Circom doesn't have one
    // Instead we multiply: if either is 0, result is 0
    signal bothValid <== hashValid * timeValid;
    
    // Final output: 1 if valid, 0 if invalid
    isValid <== bothValid;
    
    // Constrain output to be binary (0 or 1)
    isValid * (isValid - 1) === 0;
}

/**
 * IsEqual Template
 * Checks if two numbers are equal
 * Output: 1 if equal, 0 if not equal
 */
template IsEqual() {
    signal input in[2];
    signal output out;
    
    signal diff <== in[0] - in[1];
    
    // If diff = 0, out = 1; if diff != 0, out = 0
    component isZero = IsZero();
    isZero.in <== diff;
    out <== isZero.out;
}

/**
 * IsZero Template
 * Checks if a number is zero
 * Output: 1 if input is 0, 0 otherwise
 */
template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    
    // If in = 0, out = 1
    // If in != 0, we need to find inv such that in * inv = 1
    // We use the constraint: (1 - out) * in = 0
    // If in = 0, then out can be 1
    // If in != 0, then out must be 0
    
    out <-- in == 0 ? 1 : 0;
    out * in === 0;
    (1 - out) * in === 0;
}

/**
 * GreaterThan Template
 * Checks if in[0] > in[1]
 * Output: 1 if in[0] > in[1], 0 otherwise
 */
template GreaterThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0];
    out <== lt.out;
}

/**
 * LessThan Template
 * Checks if in[0] < in[1]
 */
template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component n2b = Num2Bits(n + 1);
    n2b.in <== in[0] + (1 << n) - in[1];
    
    out <== 1 - n2b.out[n];
}

/**
 * Num2Bits Template
 * Converts a number to bits
 */
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    
    var lc1 = 0;
    var e2 = 1;
    
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * e2;
        e2 *= 2;
    }
    
    lc1 === in;
}

// Main component
component main = AadhaarVerification();
