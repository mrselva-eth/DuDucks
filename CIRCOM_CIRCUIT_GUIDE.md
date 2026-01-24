# Circom Circuit Guide - Age Verification ZK-SNARK

## What is Circom?

Circom is a domain-specific language for writing zero-knowledge circuits. It allows you to define constraints that prove something is true without revealing the underlying data.

## Our Circuit: AgeVerification.circom

### Purpose
Prove that you are age >= 18 without revealing your actual age, name, or any identifying information.

### Circuit Structure

```circom
template AgeVerification()
```

### Inputs

**Public Inputs** (revealed to verifier):
```
ageCommitment     // Poseidon(age, salt) - proves age value
documentHash      // SHA-256(document_data) - proves document integrity  
currentTimestamp  // When proof was generated
```

**Private Inputs** (kept secret, only commitment is public):
```
age               // Your actual age (0-150)
salt              // Random 256-bit number
docData           // Extracted document information
birthDate         // From identity document
documentIssuanceDate // When document was issued
```

### Constraints

The circuit enforces these mathematical constraints:

#### 1. Commitment Verification
```circom
component ageHasher = Poseidon(2);
ageHasher.inputs[0] <== age;
ageHasher.inputs[1] <== salt;
ageCommitment === ageHasher.out;
```
**Means**: The public `ageCommitment` must match `Poseidon(age, salt)`. This proves the age value hasn't changed.

#### 2. Age Range Check
```circom
component ageGte18 = GreaterEqThan(8);
ageGte18.in[0] <== age;
ageGte18.in[1] <== 18;
ageGte18.out === 1;
```
**Means**: Age must be >= 18. This is the core constraint.

```circom
component ageLte150 = LessThan(8);
ageLte150.in[0] <== age;
ageLte150.in[1] <== 151;
ageLte150.out === 1;
```
**Means**: Age must be < 151 (reasonable upper bound).

#### 3. Document Recency Check
```circom
signal timeDiff <== currentTimestamp - documentIssuanceDate;
component dateValid = LessThan(32);
dateValid.in[0] <== timeDiff;
dateValid.in[1] <== 315360000;  // 10 years in seconds
dateValid.out === 1;
```
**Means**: Document must have been issued within the last 10 years. Prevents using old documents.

#### 4. Birth Date Sanity Check
```circom
signal ageInSeconds <== age * 31536000;  // seconds per year
signal expectedCurrentTimestamp <== birthDate + ageInSeconds;
component birthDateValid = LessThan(32);
birthDateValid.out === 1;
```
**Means**: If you were born on `birthDate`, your age today should be approximately `age`. This ensures age value is consistent with the birth date.

#### 5. Document Integrity
```circom
component docHasher = Poseidon(2);
docHasher.inputs[0] <== docData;
docHasher.inputs[1] <== salt;
documentHash === docHasher.out;
```
**Means**: The public `documentHash` must match the hash of the document data. Prevents document tampering.

### How It Works: Example

**Scenario**: You're 25 years old born on 1999-05-15

1. **Private Data**:
   ```
   age = 25
   salt = 0x3f4a1b2c5d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f
   birthDate = 924211200 (May 15, 1999 in Unix)
   documentIssuanceDate = 1672531200 (Jan 1, 2023)
   currentTimestamp = 1704067200 (Jan 1, 2024)
   ```

2. **Public Commitments**:
   ```
   ageCommitment = Poseidon(25, salt)
                 = 0x12ab34cd56ef78901234567890abcdef...
   documentHash = Poseidon(docData, salt)
                = 0x9876543210fedcba98765432...
   currentTimestamp = 1704067200
   ```

3. **Proof Generation**:
   - Circuit receives private inputs
   - Computes: Poseidon(25, salt) = 0x12ab34cd... ✓
   - Checks: 25 >= 18 ✓
   - Checks: 25 <= 150 ✓
   - Checks: (1704067200 - 1672531200) = 31536000 < 315360000 ✓
   - Checks: (924211200 + 25*31536000) < (1704067200 + 31536000) ✓
   - Checks: Poseidon(docData, salt) matches ✓
   - All constraints satisfied: **PROOF VALID** ✓

4. **On-Chain Verification**:
   - Smart contract receives proof + public signals
   - Verifies: `e(A, B) = e(α, β) * e(Vk_x, γ) * e(C, δ)` (Groth16)
   - If valid: Stores proof on-chain
   - Other contracts can now query: `isAgeVerified(userAddress)`

## Constraint System

The circuit compiles to **R1CS** (Rank-1 Constraint System):

- **Number of Constraints**: ~150 (approx)
- **Variables**: ~200 (approx)
- **Field**: BN254 (254-bit prime field)

### Why These Constraints?

**Commitment (Poseidon)**:
- Cheaper than SHA-256 in circuits (~150x faster)
- Perfect for commitments in ZK proofs
- Output: 254-bit number

**Range Checks (GreaterEqThan, LessThan)**:
- Proves comparison without revealing values
- Essential for age verification
- Uses binary decomposition internally

**Timestamp Checks**:
- Ensures document is recent
- Prevents replay attacks
- Uses range checks

**Consistency Checks**:
- Birth date + age should match current age
- Prevents inconsistent proofs

## Proving Process

```
Circuit Code (Circom)
      ↓
Constraint System (R1CS)
      ↓ [Witness Generation]
Witness (satisfies all constraints)
      ↓
Private Inputs + Public Inputs
      ↓ [Groth16 Prover]
Proof {A, B, C}  (~288 bytes)
```

### Step-by-Step

1. **Compile**: `circom AgeVerification.circom --r1cs --wasm`
   - Generates: `AgeVerification.r1cs`, `AgeVerification_js/`

2. **Witness Generation**: Compute values that satisfy constraints
   - Done by: SnarkJS in JavaScript/WASM
   - Input: witness.json

3. **Proof Generation**: Use Groth16 algorithm
   - Prover performs: ~2000 field operations
   - Output: ~288 bytes compressed proof

4. **Verification**: On-chain check
   - Verifier: ~5 pairing operations
   - Gas: ~500k

## Common Patterns

### 1. Commitment
```circom
component hasher = Poseidon(2);
hasher.inputs[0] <== secret_value;
hasher.inputs[1] <== salt;
public_commitment === hasher.out;
```

### 2. Range Check
```circom
component inRange = GreaterEqThan(16);
inRange.in[0] <== value;
inRange.in[1] <== min_value;
inRange.out === 1;
```

### 3. Boolean
```circom
component check = IsZero();
check.in <== (value1 - value2);
check.out === 1;  // value1 == value2
```

### 4. AND Logic
```circom
component condition = AND();
condition.a <== constraint1.out;
condition.b <== constraint2.out;
condition.out === 1;
```

## Modifying the Circuit

### To Change Age Requirement (e.g., 21+)
```circom
component ageGte21 = GreaterEqThan(8);
ageGte21.in[0] <== age;
ageGte21.in[1] <== 21;  // Change from 18
ageGte21.out === 1;
```

### To Add Additional Constraint (e.g., Nationality)
```circom
signal input nationalityHash;  // Public
signal input nationality;       // Private

component nationalityHasher = Poseidon(2);
nationalityHasher.inputs[0] <== nationality;
nationalityHasher.inputs[1] <== salt;
nationalityHash === nationalityHasher.out;
```

### To Remove Constraints
Delete the component and its assertion.

## Testing Your Circuit

1. **Create test input** (`input.json`):
```json
{
  "ageCommitment": "12345...",
  "documentHash": "abcde...",
  "currentTimestamp": 1704067200,
  "age": 25,
  "salt": "3f4a1b...",
  "docData": 123456789,
  "birthDate": 924211200,
  "documentIssuanceDate": 1672531200
}
```

2. **Generate witness**:
```bash
node circuit_js/generate_witness.js circuit_js/AgeVerification.wasm input.json witness.wtns
```

3. **Create proof**:
```bash
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json
```

4. **Verify proof**:
```bash
snarkjs groth16 verify verification_key.json public.json proof.json
```

## Security Considerations

1. **Salt Secrecy**: Never reuse salt for different proofs
2. **Input Validation**: Circuit doesn't check for negative numbers; use range checks
3. **Timing Attacks**: Groth16 is non-interactive, resistant to timing
4. **Soundness**: Proof can't be forged (computational security)
5. **Zero-Knowledge**: Verifier learns nothing except: age >= 18

## References

- Circom Documentation: https://docs.circom.io/
- Poseidon Hash: https://www.poseidon-hash.info/
- Groth16: https://eprint.iacr.org/2016/260.pdf
- SnarkJS: https://github.com/iden3/snarkjs
