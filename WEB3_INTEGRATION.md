# Web3 Integration Guide

## Overview

This guide covers the complete Web3 integration for on-chain proof submission using MetaMask and the Ethereum Sepolia testnet.

## Architecture

### Components

1. **Web3 Utilities** (`lib/web3-utils.ts`)
   - Wallet connection and management
   - Contract interaction (submit proofs, verify status)
   - Transaction tracking and Etherscan integration
   - Gas estimation and transaction utilities

2. **Web3 Hook** (`hooks/useWeb3Wallet.ts`)
   - React hook for wallet state management
   - Account and network change listeners
   - Connection/disconnection logic
   - Network switching

3. **On-Chain Submission Component** (`components/zkp/onchain-submission.tsx`)
   - User interface for wallet connection
   - Transaction submission UI
   - Status tracking
   - Etherscan linking

## Setup Instructions

### 1. Install Dependencies

```bash
npm install ethers
```

The project already includes ethers in `package.json`.

### 2. Configure Environment Variables

Add to `.env.local`:

```env
# After deploying the smart contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID
```

### 3. Deploy Smart Contract

Follow the [SMART_CONTRACT_DEPLOYMENT.md](./SMART_CONTRACT_DEPLOYMENT.md) guide to deploy the contract to Sepolia.

### 4. Update Contract Address

After deployment, update:
1. Copy the contract address from deployment output
2. Set `NEXT_PUBLIC_CONTRACT_ADDRESS` environment variable
3. Restart development server: `npm run dev`

## Features

### Wallet Connection

The system supports MetaMask and other EIP-1193 compatible wallets:

```typescript
// In your component
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';

export function MyComponent() {
  const web3 = useWeb3Wallet();

  return (
    <div>
      {web3.isConnected ? (
        <p>Connected: {web3.address}</p>
      ) : (
        <button onClick={web3.connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Network Switching

Automatically handles Sepolia network:

```typescript
// Switch to Sepolia if not already connected
if (!web3.isCorrectNetwork) {
  await web3.switchNetwork();
}
```

### Proof Submission

Submit ZK proofs to the smart contract:

```typescript
import { submitProofToContract } from '@/lib/web3-utils';

const tx = await submitProofToContract(
  contractAddress,
  signer,
  {
    commitment: '0x...',
    hashedAge: '0x...',
    timestamp: Math.floor(Date.now() / 1000),
    proofSignature: '0x...',
  }
);
```

### Transaction Tracking

Wait for transaction confirmation and get details:

```typescript
import { waitForTransaction } from '@/lib/web3-utils';

const receipt = await waitForTransaction(provider, txHash);
console.log('Confirmed at block:', receipt.blockNumber);
```

### Verification Status

Check if a user has a valid proof on-chain:

```typescript
import { checkUserVerificationStatus } from '@/lib/web3-utils';

const { isVerified, minAge } = await checkUserVerificationStatus(
  contractAddress,
  userAddress,
  provider
);
```

## User Flow

### 1. Document Upload Phase
- User uploads identity document
- Personal information collected
- ZK proof generated locally

### 2. Proof Verification Phase
- Proof verified on backend
- Status marked as "verified"

### 3. On-Chain Submission Phase
- User clicks "Submit On-Chain"
- If wallet not connected:
  - Show "Connect Wallet" button
  - User clicks to open MetaMask
  - Wallet connects and shows user address
- If wrong network:
  - Show "Switch Network" button
  - User clicks to switch to Sepolia
  - MetaMask prompts to add network if needed
- If connected to Sepolia:
  - Show "Submit Proof" button
  - User clicks to submit transaction
  - MetaMask shows transaction details
  - User approves transaction
  - Transaction sent to blockchain
  - Wait for confirmation (1+ blocks)
  - Show confirmation with Etherscan link

## API Reference

### useWeb3Wallet Hook

```typescript
const web3 = useWeb3Wallet();

// State
web3.isConnected         // boolean - wallet connected
web3.address            // string | null - user's wallet address
web3.provider           // BrowserProvider | null
web3.signer             // Signer | null
web3.network            // Network | null
web3.isLoading          // boolean - operation in progress
web3.error              // string | null - error message
web3.isCorrectNetwork   // boolean - on Sepolia

// Methods
web3.connect()          // Connect wallet
web3.disconnect()       // Disconnect wallet
web3.switchNetwork()    // Switch to Sepolia
```

### submitProofToContract

```typescript
submitProofToContract(
  contractAddress: string,
  signer: ethers.Signer,
  proofData: {
    commitment: string;
    hashedAge: string;
    timestamp: number;
    proofSignature: string;
  }
): Promise<ContractTransactionResponse>
```

### waitForTransaction

```typescript
waitForTransaction(
  provider: ethers.Provider,
  txHash: string,
  confirmations?: number
): Promise<TransactionReceipt | null>
```

### checkUserVerificationStatus

```typescript
checkUserVerificationStatus(
  contractAddress: string,
  userAddress: string,
  provider: ethers.Provider
): Promise<{ isVerified: boolean; minAge: number }>
```

### checkUserVerificationForAge

```typescript
checkUserVerificationForAge(
  contractAddress: string,
  userAddress: string,
  requiredAge: number,
  provider: ethers.Provider
): Promise<boolean>
```

## Error Handling

### Common Errors

**"MetaMask not installed"**
- User needs to install MetaMask extension
- Show installation link

**"User rejected wallet connection"**
- User clicked "Cancel" in MetaMask
- Let them try connecting again

**"Please switch to Sepolia network"**
- User has MetaMask open but wrong network selected
- Click "Switch Network" button to auto-switch

**"Contract not found"**
- Contract address not configured
- Check `NEXT_PUBLIC_CONTRACT_ADDRESS` env var

**"Transaction failed"**
- Check gas price and balance
- Verify proof data format
- Check Etherscan for error details

### Handling Errors

```typescript
try {
  const tx = await submitProofToContract(...);
} catch (error) {
  if (error.code === 4001) {
    console.log('User rejected transaction');
  } else if (error.reason) {
    console.error('Contract error:', error.reason);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Testing

### Local Testing

1. Start development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)

3. Use Sepolia testnet:
   - Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com)
   - Connect MetaMask
   - Test workflow end-to-end

### Mainnet Testing

Before deploying to mainnet:

1. Test thoroughly on Sepolia
2. Use very small amounts of real ETH
3. Conduct security audit
4. Get contract audited by third party
5. Deploy contract to mainnet
6. Update environment variables
7. Test with limited users first

## Monitoring

### Transaction Monitoring

```typescript
import { listenForProofEvents } from '@/lib/web3-utils';

const unsubscribe = await listenForProofEvents(
  contractAddress,
  provider,
  (userAddress, commitment) => {
    console.log(`Proof submitted by ${userAddress}`);
  }
);

// Later, unsubscribe
unsubscribe();
```

### Gas Price Monitoring

```typescript
import { getGasPrice } from '@/lib/web3-utils';

const gasPriceGwei = await getGasPrice(provider);
console.log(`Current gas price: ${gasPriceGwei} gwei`);
```

### Cost Estimation

```typescript
import { estimateTransactionCost } from '@/lib/web3-utils';

const { gasEstimate, estimatedCostEth } = await estimateTransactionCost(
  contractAddress,
  signer,
  proofData
);

console.log(`Estimated cost: ${estimatedCostEth} ETH`);
```

## Security Considerations

### Private Key Management

- Never expose private keys in frontend code
- Use MetaMask for key management
- Never log or store private keys
- Use environment variables for sensitive data

### Transaction Validation

- Always verify proof data format
- Check gas price before sending
- Validate contract address
- Verify network before submission

### User Warnings

- Warn users about transaction costs
- Confirm proof data before sending
- Show Etherscan link for transparency
- Never request seed phrases

## Troubleshooting

### "Wallet not connecting"

1. Check MetaMask is installed
2. Check browser extensions enabled
3. Check website not in incognito mode
4. Try refreshing page
5. Restart MetaMask

### "Contract call failing"

1. Verify contract address is correct
2. Check contract is deployed to Sepolia
3. Verify proof data format
4. Check gas limit is sufficient
5. Look at Etherscan for error details

### "Transactions slow"

1. Check network is not congested
2. Check gas price setting
3. Wait for network to settle
4. Try increasing gas price
5. Check Etherscan gas tracker

## Best Practices

1. **Always validate data** - Verify addresses and amounts
2. **Use confirmed transactions** - Wait for at least 1 confirmation
3. **Show loading states** - Give user feedback during operations
4. **Handle errors gracefully** - Show helpful error messages
5. **Link to Etherscan** - Let users verify transactions
6. **Use network indicators** - Show which network user is on
7. **Respect user choice** - Ask before submitting transactions
8. **Test thoroughly** - Test all error paths

## Resources

- [ethers.js Documentation](https://docs.ethers.org)
- [Ethereum JSON-RPC](https://ethereum.org/en/developers/docs/apis/json-rpc)
- [MetaMask Developer Docs](https://docs.metamask.io)
- [Sepolia Testnet](https://sepoliafaucet.com)
- [Etherscan API](https://docs.etherscan.io)

## Next Steps

1. ✓ Web3 utilities created
2. ✓ Wallet hook implemented
3. ✓ On-chain component updated
4. Deploy smart contract
5. Set contract address env var
6. Test end-to-end workflow
7. Monitor transactions
8. Add event listening
9. Create verifier dashboard
10. Deploy to production
