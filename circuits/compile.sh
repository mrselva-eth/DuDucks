#!/bin/bash

# Compile Circom circuit to wasm and js
echo "Compiling AgeVerification.circom..."

# Install circom if not present
if ! command -v circom &> /dev/null; then
    echo "Installing circom..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    git clone https://github.com/iden3/circom.git
    cd circom
    cargo build --release
    cargo install --path .
    cd ..
fi

# Compile the circuit
circom AgeVerification.circom --r1cs --wasm --sym

# Generate witness
echo "Generated constraint system and wasm files"

# Create circuit_js folder if it doesn't exist
mkdir -p circuit_js

# Move generated files
mv AgeVerification_js/AgeVerification.js circuit_js/
mv AgeVerification_js/AgeVerification.wasm circuit_js/

# Download powers of tau if not present
if [ ! -f "powersOfTau28_hez_final_12.ptau" ]; then
    echo "Downloading trusted setup (powers of tau)..."
    curl -o powersOfTau28_hez_final_12.ptau \
        https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
fi

echo "Circuit compilation complete!"
echo "Next steps:"
echo "1. Download 'powersOfTau28_hez_final_12.ptau' (~400MB)"
echo "2. Run 'npm run circuit:setup' to generate proving and verification keys"
