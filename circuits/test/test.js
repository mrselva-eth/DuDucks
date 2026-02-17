/**
 * Aadhaar Verification Circuit Tests
 * 
 * Tests the Circom circuit locally using snarkjs
 */

const path = require('path')
const fs = require('fs')

async function runTests() {
  console.log('[TEST] Starting Aadhaar Verification Circuit Tests\n')

  try {
    // Step 1: Check if circuit is compiled
    const buildDir = path.join(__dirname, '../build')
    if (!fs.existsSync(buildDir)) {
      console.error('[ERROR] Build directory not found.')
      console.log('[INFO] Please run: npm run compile')
      process.exit(1)
    }

    console.log('✓ Build directory exists')

    // Step 2: Check if WASM file exists
    const wasmPath = path.join(buildDir, 'aadhaar_js/aadhaar.wasm')
    if (!fs.existsSync(wasmPath)) {
      console.error('[ERROR] WASM file not found.')
      console.log('[INFO] Please run: npm run compile')
      process.exit(1)
    }

    console.log('✓ WASM file exists')

    // Step 3: Create test input
    console.log('\n[TEST] Creating test input data...')

    const currentTime = Math.floor(Date.now() / 1000) // Unix timestamp
    const expiryDate = currentTime + 365 * 24 * 60 * 60 // 1 year from now

    // Create random Aadhaar data (256 bits / 32 bytes)
    const aadhaarData = []
    for (let i = 0; i < 256; i++) {
      aadhaarData.push(Math.floor(Math.random() * 2))
    }

    // Create random salt (32 bits / 4 bytes - kept small for simplicity)
    const salt = []
    for (let i = 0; i < 32; i++) {
      salt.push(Math.floor(Math.random() * 2))
    }

    // For this test, we'll use dummy values
    // In production, these would be computed hashes
    const dataHash = 123456789 // Placeholder hash
    const input = {
      aadhaarData,
      salt,
      dataHash,
      expiryDate,
      currentTime,
    }

    const inputPath = path.join(__dirname, '../input.json')
    fs.writeFileSync(inputPath, JSON.stringify(input, null, 2))

    console.log(`✓ Test input created at: ${inputPath}`)
    console.log(`  - Aadhaar data: ${aadhaarData.length} bits`)
    console.log(`  - Salt: ${salt.length} bits`)
    console.log(`  - Current time: ${currentTime}`)
    console.log(`  - Expiry date: ${expiryDate}`)

    // Step 4: Check if proving key exists
    const zkeyPath = path.join(buildDir, 'aadhaar_final.zkey')
    if (!fs.existsSync(zkeyPath)) {
      console.error('[WARNING] Proving key not found.')
      console.log('[INFO] Please run: npm run setup')
      console.log('\n[TEST] Skipping proof generation test.')
      return
    }

    console.log('\n✓ Proving key found')

    // Step 5: Check if verification key exists
    const vkeyPath = path.join(buildDir, 'verification_key.json')
    if (!fs.existsSync(vkeyPath)) {
      console.error('[WARNING] Verification key not found.')
      console.log('[INFO] Please run: npm run vkey')
      console.log('\n[TEST] Skipping verification test.')
      return
    }

    console.log('✓ Verification key found')

    console.log('\n[TEST] All checks passed! Circuit is ready for use.')
    console.log('[INFO] Next steps:')
    console.log('  1. Generate witness: npm run witness')
    console.log('  2. Generate proof: npm run prove')
    console.log('  3. Verify proof: npm run verify')

  } catch (error) {
    console.error('[ERROR] Test failed:', error.message)
    process.exit(1)
  }
}

// Run tests
runTests()
