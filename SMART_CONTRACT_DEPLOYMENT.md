# Smart Contract Deployment Guide

## Overview

This guide walks through deploying the `AgeVerificationZKP` smart contract to Ethereum Sepolia testnet.

## Prerequisites

1. **Node.js 18+** installed
2. **Hardhat** project (already configured)
3. **Ethereum wallet** with Sepolia testnet ETH
4. **Infura or Alchemy account** for RPC endpoint
5. **Etherscan account** for contract verification (optional but recommended)

## Step 1: Setup Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Infura RPC URL for Sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID

# Your wallet private key (WITHOUT 0x prefix)
PRIVATE_KEY=your_wallet_private_key_here

# Etherscan API key (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Getting These Values:

**Infura Project ID:**
1. Go to [infura.io](https://www.infura.io)
2. Sign up and create a new project
3. Select "Ethereum" and "Sepolia"
4. Copy your project ID from the dashboard

**Private Key:**
1. Open MetaMask
2. Click account menu → Account details
3. Click "Show private key" and enter your password
4. Copy the private key (WITHOUT 0x prefix)
⚠️ **NEVER** commit this to version control!

**Etherscan API Key:**
1. Go to [etherscan.io](https://etherscan.io)
2. Create an account
3. Go to API keys and create a new key
4. Copy your API key

## Step 2: Fund Your Wallet

Get Sepolia testnet ETH for gas fees:

1. Go to [Sepolia Faucet](https://sepoliafaucet.com)
2. Enter your wallet address
3. Request 0.5 ETH (usually takes a few seconds)

Verify receipt:
```bash
# Check your balance
curl -X POST https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYOUR_ADDRESS", "latest"],
    "id": 1
  }'
```

## Step 3: Compile the Contract

```bash
npm run hardhat:compile
```

Expected output:
```
Compiling 1 file with 0.8.19
Compilation successful
```

## Step 4: Test Locally (Optional)

Run the test suite before deploying:

```bash
npm run hardhat:test
```

Expected output:
```
  AgeVerificationZKP
    Deployment
      ✓ Should deploy and set owner
      ✓ Owner should be a verifier by default
      ✓ Contract should not be paused
    Proof Submission
      ✓ Should submit a proof successfully
      ...
  
  30 passing (1.2s)
```

## Step 5: Deploy to Sepolia

Deploy the contract:

```bash
npm run deploy:sepolia
```

### Expected Output:

```
Starting AgeVerificationZKP contract deployment...
Deploying contract with account: 0x...
Account balance: 0.5 ETH

Deploying AgeVerificationZKP...
✓ AgeVerificationZKP deployed to: 0x...

Transaction hash: 0x...
Block number: 5123456
Gas used: 1234567

Waiting 30 seconds before Etherscan verification...
Verifying contract on Etherscan...
✓ Contract verified on Etherscan

=== Deployment Complete ===
Contract Address: 0x...
Network: sepolia
View on Etherscan: https://sepolia.etherscan.io/address/0x...

Next steps:
1. Update CONTRACT_ADDRESS in your frontend with: 0x...
2. Add environment variable:
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
3. Test proof submission in the frontend
```

## Step 6: Verify Deployment

### Check on Etherscan

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io)
2. Paste your contract address
3. Verify:
   - Contract code is displayed
   - Source code is visible (if verification succeeded)
   - No errors shown

### Interact with Contract

Using Etherscan UI:

1. Go to contract address on Etherscan
2. Click "Contract" tab
3. Click "Read Contract" or "Write Contract"
4. Connect your wallet for write operations

### Using hardhat console:

```bash
npx hardhat console --network sepolia

# In console:
> const contract = await ethers.getContractAt("AgeVerificationZKP", "0xYOUR_CONTRACT_ADDRESS")
> const owner = await contract.owner()
> console.log(owner)
```

## Step 7: Update Frontend

### Add to `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID
```

### Update Contract ABI (Optional)

If needed, copy the ABI from:
```
artifacts/contracts/AgeVerificationZKP.sol/AgeVerificationZKP.json
```

Create `/lib/contract-abi.ts`:
```typescript
export const AgeVerificationZKP_ABI = [
  // Copy from artifacts JSON
];
```

## Step 8: Test Frontend Integration

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)

3. Test the workflow:
   - Upload document
   - Generate proof
   - Verify proof
   - Submit on-chain
   - Check transaction on Etherscan

## Manual Verification (if auto-verification failed)

```bash
npm run verify:sepolia -- 0xYOUR_CONTRACT_ADDRESS
```

## Troubleshooting

### "Insufficient balance for gas"
- Need more testnet ETH
- Go to [Sepolia Faucet](https://sepoliafaucet.com)
- Request more ETH

### "Invalid private key"
- Ensure private key is WITHOUT 0x prefix
- Ensure it's a valid Ethereum private key (64 hex characters)
- Check for extra spaces or newlines

### "RPC endpoint error"
- Verify Infura project ID is correct
- Ensure Sepolia network is selected
- Check internet connection

### "Contract already verified on Etherscan"
- This is OK, your contract is already verified
- You can proceed with frontend integration

### "Transaction reverted"
- Check gas limit (auto-set to reasonable value)
- Verify account has sufficient balance
- Ensure RPC endpoint is working

### "Address not found on Etherscan"
- Contract deployment might not have completed
- Wait a few minutes and try again
- Check transaction hash in console output

## Gas Optimization Tips

Current contract:
- Deployment gas: ~1.2M
- Gas savings: Optimized for 200 runs

If you need lower gas:
1. Reduce state variables
2. Use `external` instead of `public` where possible
3. Consider using proxy patterns

## Sepolia to Mainnet Migration

When ready for production:

1. **Get Mainnet ETH**
   - Need real ETH (expensive!)
   - ~$5-20+ for deployment

2. **Update configuration**
   - Change RPC to mainnet
   - Update ETHERSCAN_API_KEY if needed

3. **Deploy to mainnet**
   ```bash
   # Add mainnet to hardhat.config.js first
   npm run deploy:mainnet
   ```

4. **Test thoroughly**
   - Use testnet first
   - Conduct security audit
   - Test with small amounts first

## Contract Functions Reference

### Submit Proof (User)
```solidity
submitProof(
  bytes32 commitment,
  bytes32 hashedAge,
  uint256 minAge,
  uint256 timestamp,
  bytes32 proofSignature
)
```

### Verify Proof (Owner/Verifier)
```solidity
verifyProof(address user, uint256 proofIndex)
```

### Check User Status (Anyone)
```solidity
isUserVerified(address user) returns (bool, uint256)
isUserVerifiedForAge(address user, uint256 requiredAge) returns (bool)
```

### Admin Functions (Owner Only)
```solidity
addVerifier(address _verifier)
removeVerifier(address _verifier)
pause() / unpause()
setProofExpirationTime(uint256 _expirationTime)
```

## Security Notes

1. **Private Key Safety**
   - Never share your private key
   - Never commit `.env` to git
   - Use `.env.local` for local development
   - Use Vercel Secrets for production

2. **Contract Audit**
   - Current implementation is for demonstration
   - For production, get professional security audit
   - Consider using OpenZeppelin libraries

3. **Proof Validation**
   - Current implementation uses SHA-256 hashing
   - For production ZKP, use proper circuit libraries (circom/snarkjs)
   - Implement rate limiting on API endpoints

## Next Steps

1. ✓ Deploy contract to Sepolia
2. ✓ Verify on Etherscan
3. Integrate contract with frontend
4. Test end-to-end workflow
5. Add Web3 wallet connection
6. Implement real transaction submission
7. Add event listening for proof verification
8. Create verifier dashboard
9. Deploy frontend to production
10. Monitor contract for issues

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Development](https://ethereum.org/en/developers)
- [Sepolia Testnet Info](https://www.sepoliafaucet.com)
- [Etherscan API](https://docs.etherscan.io)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org)

## Support

For deployment issues:
1. Check this guide for troubleshooting
2. Review contract compilation output
3. Check Etherscan for transaction details
4. Review test results
5. Open GitHub issue with details
