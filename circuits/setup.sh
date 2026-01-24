#!/bin/bash

# Generate proving key and verification key from the circuit
echo "Setting up ZK circuit trusted setup..."

if [ ! -f "powersOfTau28_hez_final_12.ptau" ]; then
    echo "ERROR: powersOfTau28_hez_final_12.ptau not found!"
    echo "Download it from: https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau"
    exit 1
fi

# Step 1: Create phase 2 contribution
echo "Creating phase 2 circuit specific setup..."
snarkjs groth16 setup AgeVerification.r1cs powersOfTau28_hez_final_12.ptau circuit_final.zkey

# Step 2: Apply beacon (finalize zkey)
echo "Applying beacon to finalize the key..."
snarkjs zkey beacon circuit_final.zkey circuit_final.zkey "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f" 10 final

# Step 3: Export verification key
echo "Exporting verification key..."
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# Step 4: Generate Solidity verifier
echo "Generating Solidity verifier contract..."
snarkjs zkey export solidityverifier circuit_final.zkey Verifier.sol

# Step 5: Copy verification key to frontend
mkdir -p ../public/zk-keys
cp verification_key.json ../public/zk-keys/
cp circuit_final.zkey ../public/zk-keys/

echo "Setup complete!"
echo "Generated files:"
echo "  - circuit_final.zkey (proving key, keep secret!)"
echo "  - verification_key.json"
echo "  - Verifier.sol (smart contract)"
echo "  - AgeVerification.r1cs (constraint system)"
