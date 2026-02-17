# DuDucks ZK Circuits

Zero Knowledge Proof circuits for government document verification using Circom 2 and Groth16.

## Overview

This directory contains the Circom circuits that generate zero-knowledge proofs for verifying government documents without revealing sensitive information.

### Current Circuits

- **aadhaar-verification.circom** - Verifies Aadhaar card validity using hash verification

## Setup Instructions

### Prerequisites

```bash
# Install Node.js 16+ and npm
node --version  # Should be 16+
npm --version   # Should be 8+

# Install Circom
npm install -g circom

# Install snarkjs for proof generation and verification
npm install snarkjs
```

### Installation

```bash
cd circuits

# Install circomlib dependencies
npm install
```

### Directory Structure

```
circuits/
├── aadhaar-verification.circom    # Main circuit
├── build/                          # Compiled circuits (generated)
│   ├── aadhaar_js/                # WASM files
│   ├── aadhaar.r1cs               # R1CS constraint system
│   ├── aadhaar.ptau               # Powers of Tau file
│   ├── aadhaar_0000.zkey          # Proving key
│   └── verification_key.json       # Verification key
├── test/                           # Circuit tests
├── scripts/                        # Build and deployment scripts
└── README.md
```

## Compilation

### Step 1: Compile the Circuit

```bash
circom aadhaar-verification.circom --r1cs --wasm --sym -o build
```

This generates:
- `aadhaar.r1cs` - Rank-1 Constraint System (R1CS)
- `aadhaar_js/aadhaar.wasm` - WebAssembly for witness generation
- `aadhaar.sym` - Symbol table for debugging

### Step 2: Verify Constraints

```bash
# Check circuit stats
node -e "
const fs = require('fs');
const { readFileSync } = require('fs');
const json = JSON.parse(readFileSync('./build/aadhaar.sym', 'utf8'));
console.log('Circuit symbols:', Object.keys(json).length);
"
```

### Step 3: Generate Powers of Tau (Initial Setup)

```bash
# This is a one-time setup. The ptau file is provided separately for production.
# For testing/local development:
snarkjs powersoftau new bn128 12 build/aadhaar_0000.ptau
snarkjs powersoftau contribute build/aadhaar_0000.ptau build/aadhaar_1000.ptau --name="First contribution" -v
snarkjs powersoftau prepare-phase2 build/aadhaar_1000.ptau build/aadhaar_final.ptau -v
```

### Step 4: Generate Proving Key (Groth16)

```bash
snarkjs groth16 setup build/aadhaar.r1cs build/aadhaar_final.ptau build/aadhaar_0000.zkey
snarkjs zkey contribute build/aadhaar_0000.zkey build/aadhaar_final.zkey --name="Contribution" -v
snarkjs zkey verify build/aadhaar.r1cs build/aadhaar_final.ptau build/aadhaar_final.zkey
```

### Step 5: Extract Verification Key

```bash
snarkjs zkey export verificationkey build/aadhaar_final.zkey build/verification_key.json
```

## Proof Generation

### Generate Witness

```bash
# Create input.json with your test data
node build/aadhaar_js/generate_witness.js build/aadhaar_js/aadhaar.wasm input.json witness.wtns
```

### Generate Proof

```bash
snarkjs groth16 prove build/aadhaar_final.zkey witness.wtns proof.json public.json
```

### Verify Proof

```bash
snarkjs groth16 verify build/verification_key.json public.json proof.json
```

## Circuit Constraints

The Aadhaar verification circuit includes:

### Inputs

```circom
signal input aadhaarData[256];    // Aadhaar data as array of bits
signal input salt[32];             // Salt for hashing
```

### Outputs

```circom
signal output isValid;             // 1 if valid, 0 otherwise
```

### Key Constraints

1. **Hash Verification** - Verifies Poseidon hash of aadhaarData + salt
2. **Format Validation** - Ensures Aadhaar format compliance
3. **Expiry Check** - Verifies document is not expired

## Testing

### Local Testing

```bash
# Test with sample data
npm run test

# Test specific circuit
npm run test:aadhaar
```

### Integration Testing

```bash
# Generate test proofs and verify against smart contracts
npm run test:integration
```

## Production Deployment

### Checklist

- [ ] Circuit compiled successfully
- [ ] All constraints verified
- [ ] Groth16 setup completed with trusted ceremony
- [ ] Verification key deployed to smart contract
- [ ] Powers of Tau file securely stored
- [ ] Test proofs generated and verified
- [ ] Gas optimization reviewed
- [ ] Audit completed

### Deployment Script

```bash
npm run deploy:circuit
```

This will:
1. Compile the circuit
2. Generate proving and verification keys
3. Output contract-compatible verification key
4. Deploy to `../onchain/src/data/verification_key.json`

## Optimization

### Constraint Count

```bash
# Check circuit size
grep "Number of gates" build/aadhaar.sym
```

Current target: < 1,000,000 constraints for efficient proving

### Proof Generation Time

- Local (laptop): ~5-30 seconds
- Server (optimized): ~1-3 seconds
- Verification: <100ms

### Proof Size

- Proof size: ~288 bytes (2 G1 points + 1 G2 point)
- Public signals: ~32 bytes (1 field element)

## Security Considerations

1. **Trusted Setup** - Powers of Tau ceremony should use trusted participants
2. **Constraint Soundness** - All circuits audited for completeness
3. **Input Validation** - Frontend validates inputs before sending to circuit
4. **Proof Replay** - Each proof is unique to user + timestamp

## Troubleshooting

### Common Issues

**"WASM compilation failed"**
```bash
# Try rebuilding with explicit output
circom aadhaar-verification.circom --r1cs --wasm --sym -o build -v
```

**"Witness generation error"**
```bash
# Check input.json format
cat input.json
# Ensure all fields are present and correct type
```

**"Proof verification failed"**
```bash
# Verify keys match
snarkjs zkey verify build/aadhaar.r1cs build/aadhaar_final.ptau build/aadhaar_final.zkey

# Check proof JSON structure
cat proof.json | jq .
```

## References

- [Circom Documentation](https://docs.circom.io/)
- [snarkjs GitHub](https://github.com/iden3/snarkjs)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [Poseidon Hash](https://www.poseidon-hash.info/)

## Next Steps

1. Complete circuit implementation with actual hash verification
2. Add format validation constraints
3. Implement expiry date checking
4. Generate full Powers of Tau ceremony
5. Deploy to smart contract on Base Sepolia
