import { ethers } from 'ethers';

/**
 * Web3 Wallet Integration Utilities
 * Handles MetaMask and other EIP-1193 compatible wallets
 */

export interface WalletConnectResult {
  address: string;
  provider: any;
  signer: ethers.Signer;
  network: ethers.Network;
}

/**
 * Check if wallet is available in browser
 */
export function isWalletAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).ethereum;
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet(): Promise<WalletConnectResult> {
  if (!isWalletAvailable()) {
    throw new Error(
      'MetaMask not installed. Please install MetaMask extension.'
    );
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);

  try {
    // Request account access
    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    return {
      address: accounts[0],
      provider,
      signer,
      network,
    };
  } catch (error) {
    if ((error as any).code === 4001) {
      throw new Error('User rejected wallet connection');
    }
    throw error;
  }
}

/**
 * Check if connected to Sepolia network
 */
export async function isSepoliaNetwork(provider: ethers.Provider): Promise<boolean> {
  const network = await provider.getNetwork();
  return network.chainId === 11155111;
}

/**
 * Switch to Sepolia network
 */
export async function switchToSepolia(): Promise<void> {
  if (!isWalletAvailable()) {
    throw new Error('MetaMask not installed');
  }

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not added to wallet, try to add it
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            rpcUrls: [
              'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
            ],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

/**
 * Contract ABI for proof submission
 */
export const AGE_VERIFICATION_ZKP_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
      { internalType: 'bytes32', name: 'hashedAge', type: 'bytes32' },
      { internalType: 'uint256', name: 'minAge', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes32', name: 'proofSignature', type: 'bytes32' },
    ],
    name: 'submitProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'proofIndex', type: 'uint256' },
    ],
    name: 'verifyProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isUserVerified',
    outputs: [
      { internalType: 'bool', name: 'hasValidProof', type: 'bool' },
      { internalType: 'uint256', name: 'minAgeVerified', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'requiredAge', type: 'uint256' },
    ],
    name: 'isUserVerifiedForAge',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
      { indexed: false, internalType: 'uint256', name: 'minAge', type: 'uint256' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'ProofSubmitted',
    type: 'event',
  },
];

/**
 * Submit proof to smart contract
 */
export async function submitProofToContract(
  contractAddress: string,
  signer: ethers.Signer,
  proofData: {
    commitment: string;
    hashedAge: string;
    timestamp: number;
    proofSignature: string;
  }
): Promise<ethers.ContractTransactionResponse | null> {
  const contract = new ethers.Contract(
    contractAddress,
    AGE_VERIFICATION_ZKP_ABI,
    signer
  );

  // Ensure all data is properly formatted
  const commitment = proofData.commitment.startsWith('0x')
    ? proofData.commitment
    : '0x' + proofData.commitment;
  const hashedAge = proofData.hashedAge.startsWith('0x')
    ? proofData.hashedAge
    : '0x' + proofData.hashedAge;
  const proofSignature = proofData.proofSignature.startsWith('0x')
    ? proofData.proofSignature
    : '0x' + proofData.proofSignature;
  const minAge = 18; // Standard minimum age
  const timestamp = proofData.timestamp;

  try {
    console.log('[v0] Submitting proof with:', {
      commitment,
      hashedAge,
      minAge,
      timestamp,
      proofSignature,
    });

    const tx = await contract.submitProof(
      commitment,
      hashedAge,
      minAge,
      timestamp,
      proofSignature
    );

    console.log('[v0] Transaction sent:', tx.hash);
    return tx;
  } catch (error: any) {
    console.error('[v0] Contract submission error:', error);
    throw new Error(
      error.reason || error.message || 'Failed to submit proof to contract'
    );
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  provider: ethers.Provider,
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  return provider.waitForTransaction(txHash, confirmations);
}

/**
 * Check if user is verified on-chain
 */
export async function checkUserVerificationStatus(
  contractAddress: string,
  userAddress: string,
  provider: ethers.Provider
): Promise<{ isVerified: boolean; minAge: number }> {
  const contract = new ethers.Contract(
    contractAddress,
    AGE_VERIFICATION_ZKP_ABI,
    provider
  );

  const [isVerified, minAge] = await contract.isUserVerified(userAddress);
  return { isVerified, minAge: minAge.toNumber() };
}

/**
 * Check if user is verified for specific age
 */
export async function checkUserVerificationForAge(
  contractAddress: string,
  userAddress: string,
  requiredAge: number,
  provider: ethers.Provider
): Promise<boolean> {
  const contract = new ethers.Contract(
    contractAddress,
    AGE_VERIFICATION_ZKP_ABI,
    provider
  );

  return contract.isUserVerifiedForAge(userAddress, requiredAge);
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
  return hash.substring(0, 10) + '...' + hash.substring(hash.length - 10);
}

/**
 * Get Etherscan URL for transaction
 */
export function getEtherscanTxUrl(txHash: string, network: string = 'sepolia'): string {
  const baseUrl =
    network === 'mainnet'
      ? 'https://etherscan.io'
      : `https://${network}.etherscan.io`;
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get Etherscan URL for address
 */
export function getEtherscanAddressUrl(
  address: string,
  network: string = 'sepolia'
): string {
  const baseUrl =
    network === 'mainnet'
      ? 'https://etherscan.io'
      : `https://${network}.etherscan.io`;
  return `${baseUrl}/address/${address}`;
}

/**
 * Format ETH amount
 */
export function formatEth(wei: bigint): string {
  return ethers.formatEther(wei);
}

/**
 * Parse ETH amount to wei
 */
export function parseEth(eth: string): bigint {
  return ethers.parseEther(eth);
}

/**
 * Get gas price
 */
export async function getGasPrice(provider: ethers.Provider): Promise<string> {
  const gasPrice = await provider.getFeeData();
  if (gasPrice.gasPrice) {
    return ethers.formatUnits(gasPrice.gasPrice, 'gwei');
  }
  throw new Error('Unable to fetch gas price');
}

/**
 * Estimate transaction cost
 */
export async function estimateTransactionCost(
  contractAddress: string,
  signer: ethers.Signer,
  proofData: {
    commitment: string;
    hashedAge: string;
    timestamp: number;
    proofSignature: string;
  }
): Promise<{ gasEstimate: bigint; estimatedCostEth: string }> {
  const contract = new ethers.Contract(
    contractAddress,
    AGE_VERIFICATION_ZKP_ABI,
    signer
  );

  const commitment = proofData.commitment.startsWith('0x')
    ? proofData.commitment
    : '0x' + proofData.commitment;
  const hashedAge = proofData.hashedAge.startsWith('0x')
    ? proofData.hashedAge
    : '0x' + proofData.hashedAge;
  const proofSignature = proofData.proofSignature.startsWith('0x')
    ? proofData.proofSignature
    : '0x' + proofData.proofSignature;

  const gasEstimate = await contract.submitProof.estimateGas(
    commitment,
    hashedAge,
    18,
    proofData.timestamp,
    proofSignature
  );

  const gasPrice = await signer.provider?.getFeeData();
  if (!gasPrice?.gasPrice) {
    throw new Error('Unable to fetch gas price');
  }

  const estimatedCost = gasEstimate * gasPrice.gasPrice;
  return {
    gasEstimate,
    estimatedCostEth: ethers.formatEther(estimatedCost),
  };
}

/**
 * Listen for ProofSubmitted events
 */
export async function listenForProofEvents(
  contractAddress: string,
  provider: ethers.Provider,
  onProofSubmitted: (userAddress: string, commitment: string) => void
): Promise<() => void> {
  const contract = new ethers.Contract(
    contractAddress,
    AGE_VERIFICATION_ZKP_ABI,
    provider
  );

  const filter = contract.filters.ProofSubmitted();
  const listener = (user: string, commitment: string) => {
    onProofSubmitted(user, commitment);
  };

  contract.on(filter, listener);

  // Return unsubscribe function
  return () => {
    contract.off(filter, listener);
  };
}
