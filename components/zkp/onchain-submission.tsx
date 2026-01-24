'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Loader,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import {
  submitProofToContract,
  waitForTransaction,
  getEtherscanTxUrl,
  formatTxHash,
} from '@/lib/web3-utils';

interface OnChainSubmissionProps {
  proofData: {
    commitment: string;
    hashedAge: string;
    timestamp: number;
    userAddress: string;
    proofSignature: string;
  };
  onChainProofId: string;
  onSubmit: (txHash: string) => void;
  isLoading: boolean;
}

export function OnChainSubmission({
  proofData,
  onChainProofId,
  onSubmit,
  isLoading,
}: OnChainSubmissionProps) {
  const web3 = useWeb3Wallet();
  const [status, setStatus] = useState<
    'ready' | 'connecting' | 'submitting' | 'pending' | 'confirmed'
  >('ready');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatHash = (hash: string) => {
    return hash.substring(0, 10) + '...' + hash.substring(hash.length - 10);
  };

  useEffect(() => {
    if (web3.error && status === 'connecting') {
      setError(web3.error);
      setStatus('ready');
    }
  }, [web3.error]);

  const handleConnectWallet = async () => {
    setStatus('connecting');
    setError('');
    await web3.connect();
  };

  const handleSwitchNetwork = async () => {
    setError('');
    await web3.switchNetwork();
  };

  const handleSubmitTransaction = async () => {
    if (!web3.isConnected || !web3.signer || !web3.provider) {
      setError('Wallet not connected. Please connect first.');
      return;
    }

    if (!contractAddress) {
      setError(
        'Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS'
      );
      return;
    }

    if (!web3.isCorrectNetwork) {
      setError('Please switch to Sepolia network');
      return;
    }

    try {
      setStatus('submitting');
      setError('');

      console.log('[v0] Submitting proof to contract:', contractAddress);

      // Submit proof to contract
      const tx = await submitProofToContract(
        contractAddress,
        web3.signer,
        proofData
      );

      if (!tx) {
        throw new Error('Transaction failed to send');
      }

      const txHash = tx.hash;
      setTxHash(txHash);
      setStatus('pending');

      console.log('[v0] Transaction sent:', txHash);

      // Wait for confirmation
      const receipt = await waitForTransaction(web3.provider, txHash, 1);

      if (receipt) {
        console.log('[v0] Transaction confirmed:', receipt.hash);
        setStatus('confirmed');
        onSubmit(txHash);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      setStatus('ready');
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit transaction';
      setError(errorMessage);
      console.error('[v0] Submission error:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Wallet Status */}
      {!web3.isConnected ? (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              Wallet Not Connected
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Please connect your MetaMask wallet to submit the proof
            </p>
          </div>
          <button
            onClick={handleConnectWallet}
            disabled={web3.isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium transition whitespace-nowrap"
          >
            {web3.isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : !web3.isCorrectNetwork ? (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Wrong Network
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-200">
              Please switch to Sepolia testnet to submit the proof
            </p>
          </div>
          <button
            onClick={handleSwitchNetwork}
            disabled={web3.isLoading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded font-medium transition whitespace-nowrap"
          >
            {web3.isLoading ? 'Switching...' : 'Switch Network'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-100">
              Wallet Connected
            </p>
            <p className="text-sm text-green-700 dark:text-green-200">
              {web3.address?.substring(0, 6)}...{web3.address?.substring(web3.address.length - 4)}
            </p>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {status === 'confirmed' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-100">
              Transaction Confirmed
            </p>
            <p className="text-sm text-green-700 dark:text-green-200">
              Your ZK proof has been successfully submitted on-chain
            </p>
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              Awaiting Confirmation
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Your transaction is being processed on the blockchain
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">
              Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      <div className="space-y-4 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold">Transaction Details</h3>

        <div className="space-y-3">
          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              ON-CHAIN PROOF ID
            </p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono">{onChainProofId}</code>
              <button
                onClick={() => copyToClipboard(onChainProofId)}
                className="ml-2 p-1 hover:bg-background rounded"
              >
                <Copy
                  className={`w-4 h-4 ${
                    copied ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              COMMITMENT
            </p>
            <code className="text-sm font-mono">
              {formatHash(proofData.commitment)}
            </code>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              HASHED AGE
            </p>
            <code className="text-sm font-mono">
              {formatHash(proofData.hashedAge)}
            </code>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              PROOF SIGNATURE
            </p>
            <code className="text-sm font-mono">
              {formatHash(proofData.proofSignature)}
            </code>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              TIMESTAMP
            </p>
            <p className="text-sm">
              {new Date(proofData.timestamp * 1000).toLocaleString()}
            </p>
          </div>

          {txHash && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
              <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">
                TRANSACTION HASH
              </p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-green-800 dark:text-green-200">
                {formatTxHash(txHash)}
              </code>
              <a
                href={getEtherscanTxUrl(txHash, 'sepolia')}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded"
              >
                <ExternalLink className="w-4 h-4 text-green-600" />
              </a>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Contract Info */}
      <div className="space-y-4 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold">Smart Contract Information</h3>

        <div className="space-y-3 text-sm">
          <p>
            <strong>Network:</strong> Ethereum Sepolia Testnet
          </p>
          <p>
            <strong>Contract:</strong> AgeVerificationZKP.sol
          </p>
          <p>
            <strong>Function:</strong> submitProof()
          </p>
          <p className="text-muted-foreground">
            Your proof data will be submitted to the smart contract, where it
            will be stored and available for verification by authorized
            verifiers.
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Contract deployment details will be provided
            after testing. For now, this demonstrates the proof submission
            workflow.
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-4 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold">On-Chain Verification Process</h3>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Submit Proof</p>
              <p className="text-sm text-muted-foreground">
                Send your proof data to the smart contract on Ethereum Sepolia
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Transaction Confirmation</p>
              <p className="text-sm text-muted-foreground">
                Wait for blockchain confirmation (usually 1-2 minutes)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Verifier Review</p>
              <p className="text-sm text-muted-foreground">
                Authorized verifiers can verify your proof without accessing
                your identity
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              4
            </div>
            <div>
              <p className="font-medium">Verification Status</p>
              <p className="text-sm text-muted-foreground">
                Check your verification status on-chain anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {status === 'ready' && web3.isConnected && web3.isCorrectNetwork && (
        <button
          onClick={handleSubmitTransaction}
          disabled={web3.isLoading || isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {web3.isLoading || isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ExternalLink className="w-5 h-5" />
              Submit Proof to Contract
            </>
          )}
        </button>
      )}

      {/* Security Info */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Security:</strong> Make sure you're connected to Sepolia
          Testnet. Never submit real funds or sensitive information. This is a
          demonstration of ZKP age verification on the blockchain.
        </p>
      </div>
    </div>
  );
}
