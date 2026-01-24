'use client';

import React, { useState } from 'react';
import {
  Zap,
  Loader,
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface DocumentPreview {
  file: File;
  preview: string;
  extractedData: {
    fullName: string;
    dateOfBirth: string;
    documentNumber: string;
    extractionConfidence: number;
  } | null;
  tlsHash: string | null;
  isVerified: boolean;
}

interface GeneratedZKProof {
  proofId: string;
  proof: {
    a: string[];
    b: string[][];
    c: string[];
  };
  publicSignals: string[];
  documentData: {
    name: string;
    dateOfBirth: string;
    extractionConfidence: number;
  };
  verification: {
    tlsVerified: boolean;
    integrityHash: string;
  };
  message: string;
}

interface ZKProofGeneratorProps {
  document: DocumentPreview | null;
  userAddress: string;
  onProofGenerated: (proof: GeneratedZKProof) => void;
}

export function ZKProofGenerator({
  document,
  userAddress,
  onProofGenerated,
}: ZKProofGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<GeneratedZKProof | null>(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateProof = async () => {
    if (!document) {
      setError('Please upload a document first');
      return;
    }

    if (!userAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      console.log('[v0] Initiating ZK proof generation...');

      const formData = new FormData();
      formData.append('document', document.file);
      formData.append('userAddress', userAddress);

      // Call backend API to generate ZK proof
      const response = await fetch('/api/zkp/generate-zk-proof', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate proof');
      }

      const proofData = await response.json();
      console.log('[v0] ZK proof generated successfully');

      setGeneratedProof(proofData);
      onProofGenerated(proofData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate ZK proof';
      setError(errorMessage);
      console.error('[v0] Proof generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
          <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">
            Upload a document first to generate a ZK proof
          </p>
        </div>
      </div>
    );
  }

  if (generatedProof) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Success Status */}
        <div className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-900 text-lg">
              ZK-SNARK Proof Generated Successfully
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              Your age is verified without revealing your identity
            </p>
          </div>
        </div>

        {/* Proof Details Card */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg">Proof Details</h3>
          </div>

          <div className="p-6 space-y-4">
            {/* Proof ID */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Proof ID
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-gray-50 text-gray-900 text-sm font-mono rounded-xl border border-gray-200 break-all">
                  {generatedProof.proofId}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedProof.proofId)}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Document Verification */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                TLS Verification Status
              </label>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm font-medium text-emerald-800">
                  {generatedProof.verification.tlsVerified
                    ? 'Document TLS Verified'
                    : 'Verification Failed'}
                </span>
              </div>
            </div>

            {/* Extracted Document Data */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Verified Information (Hidden in Proof)
              </label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Full Name:</span>
                  <span className="font-semibold text-gray-900">
                    {generatedProof.documentData.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">DOB:</span>
                  <span className="font-semibold text-gray-900">
                    {generatedProof.documentData.dateOfBirth}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Confidence:</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(generatedProof.documentData.extractionConfidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Proof Components */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Proof Components
                </label>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
              </div>

              {showDetails && (
                <div className="space-y-2 text-xs font-mono p-4 bg-gray-900 text-gray-100 rounded-xl max-h-64 overflow-auto border border-gray-800">
                  <div>
                    <span className="text-blue-400">pA:</span>{' '}
                    <span className="text-gray-300">{JSON.stringify(generatedProof.proof.a)}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">pB:</span>{' '}
                    <span className="text-gray-300">{JSON.stringify(generatedProof.proof.b)}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">pC:</span>{' '}
                    <span className="text-gray-300">{JSON.stringify(generatedProof.proof.c)}</span>
                  </div>
                  <div className="mt-2 border-t border-gray-700 pt-2">
                    <span className="text-emerald-400">publicSignals:</span>
                    <div className="mt-1">
                      {generatedProof.publicSignals.map((signal, i) => (
                        <div key={i} className="text-gray-300">
                          [{i}] {signal.substring(0, 32)}...
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-bold">What's happening:</span> Your ZK-SNARK proof
                cryptographically proves you are 18+ without revealing your exact age, name, or
                any personal information. Only the proof components are sent on-chain.
              </p>
            </div>

            {/* Next Steps */}
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <p className="text-sm font-bold text-amber-900">
                Next: Submit proof on-chain
              </p>
              <p className="text-sm text-amber-800">
                Connect your wallet and click "Submit to Blockchain" to record this proof on
                Ethereum Sepolia.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setGeneratedProof(null);
              setError('');
            }}
            className="flex-1 px-4 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
          >
            Generate New Proof
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Info Section */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-bold text-blue-900 mb-3 text-lg">
          Creating Your ZK-SNARK Proof
        </h4>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside leading-relaxed">
          <li>OCR will extract your age from the document</li>
          <li>Circom circuit will generate a cryptographic proof</li>
          <li>Proof proves age ≥ 18 without revealing identity</li>
          <li>Ready to submit on-chain to Ethereum Sepolia</li>
        </ol>
      </div>

      {/* Document Summary */}
      <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
        <h4 className="font-bold text-gray-900 mb-4 text-lg">Document Summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Name:</span>
            <span className="font-semibold text-gray-900">
              {document.extractedData?.fullName}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Date of Birth:</span>
            <span className="font-semibold text-gray-900">
              {document.extractedData?.dateOfBirth}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 font-medium">OCR Confidence:</span>
            <span className="font-semibold text-gray-900">
              {Math.round((document.extractedData?.extractionConfidence || 0) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateProof}
        disabled={isGenerating || !document.isVerified}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {isGenerating ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Generating ZK-SNARK Proof...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Generate ZK-SNARK Proof
          </>
        )}
      </button>
    </div>
  );
}
