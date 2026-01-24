'use client';

import React, { useState } from 'react';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';

interface ProofDisplayProps {
  proofId: string;
  proof: {
    commitment: string;
    ageVerification: {
      proof: string;
      minAge: number;
      timestamp: number;
    };
    documentHash: string;
    publicInputs: {
      commitment: string;
      hashedAge: string;
      timestamp: number;
    };
  };
  onVerify: (proofId: string) => void;
  onSubmitOnChain: (proofId: string) => void;
  isVerifying: boolean;
  isSubmitting: boolean;
}

export function ProofDisplay({
  proofId,
  proof,
  onVerify,
  onSubmitOnChain,
  isVerifying,
  isSubmitting,
}: ProofDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatHash = (hash: string) => {
    return hash.substring(0, 16) + '...' + hash.substring(hash.length - 16);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
          <p className="font-semibold text-green-900 dark:text-green-100">
            ZK Proof Generated Successfully
          </p>
          <p className="text-sm text-green-700 dark:text-green-200">
            Your age verification proof is ready for verification and on-chain
            submission
          </p>
        </div>
      </div>

      {/* Proof Details */}
      <div className="space-y-4 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold">Proof Details</h3>

        <div className="space-y-3">
          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              PROOF ID
            </p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono break-all">{proofId}</code>
              <button
                onClick={() => copyToClipboard(proofId, 'proofId')}
                className="ml-2 p-1 hover:bg-background rounded"
              >
                <Copy
                  className={`w-4 h-4 ${
                    copied === 'proofId'
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                MINIMUM AGE
              </p>
              <p className="text-lg font-semibold">
                {proof.ageVerification.minAge}+
              </p>
            </div>

            <div className="p-3 bg-muted rounded">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                PROOF TYPE
              </p>
              <p className="text-lg font-semibold">Age Verification</p>
            </div>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              COMMITMENT (IDENTITY HASH)
            </p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono">
                {formatHash(proof.commitment)}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(proof.commitment, 'commitment')
                }
                className="ml-2 p-1 hover:bg-background rounded"
              >
                <Copy
                  className={`w-4 h-4 ${
                    copied === 'commitment'
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              HASHED AGE PROOF
            </p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono">
                {formatHash(proof.publicInputs.hashedAge)}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(proof.publicInputs.hashedAge, 'hashedAge')
                }
                className="ml-2 p-1 hover:bg-background rounded"
              >
                <Copy
                  className={`w-4 h-4 ${
                    copied === 'hashedAge'
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              DOCUMENT HASH
            </p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono">
                {formatHash(proof.documentHash)}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(proof.documentHash, 'docHash')
                }
                className="ml-2 p-1 hover:bg-background rounded"
              >
                <Copy
                  className={`w-4 h-4 ${
                    copied === 'docHash'
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              TIMESTAMP
            </p>
            <p className="text-sm">
              {new Date(proof.ageVerification.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="space-y-4 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold">How Zero-Knowledge Proof Works</h3>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Commitment Created</p>
              <p className="text-sm text-muted-foreground">
                Your identity data is hashed into a commitment, proving you
                possess valid identity information without revealing it.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Age Verified Privately</p>
              <p className="text-sm text-muted-foreground">
                The system verifies you meet the minimum age requirement without
                revealing your actual age or birth date.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Proof Generated</p>
              <p className="text-sm text-muted-foreground">
                A cryptographic proof is generated that third parties can verify
                without accessing any personal information.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              4
            </div>
            <div>
              <p className="font-medium">On-Chain Submission</p>
              <p className="text-sm text-muted-foreground">
                Submit the proof to the blockchain smart contract for permanent,
                verifiable age verification records.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onVerify(proofId)}
          disabled={isVerifying}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
        >
          {isVerifying ? 'Verifying...' : 'Verify Proof'}
        </button>
        <button
          onClick={() => onSubmitOnChain(proofId)}
          disabled={isSubmitting || isVerifying}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            'Preparing...'
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Submit On-Chain
            </>
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Privacy Guarantee:</strong> Your proof contains only
          cryptographic hashes. No actual identity, age, or document data is
          stored or revealed. Each proof is unique and cannot be linked to your
          real identity.
        </p>
      </div>
    </div>
  );
}
