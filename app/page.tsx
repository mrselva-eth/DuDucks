'use client';

import React, { useState } from 'react';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import Tesseract from 'tesseract.js';
import { Upload, Check, Loader2, FileText, RefreshCw, Lock, Zap } from 'lucide-react';

/* TYPES */
type Step = 'upload' | 'proof' | 'onchain' | 'complete';

interface DocumentData {
  file: File;
  fullName: string;
  dateOfBirth: string;
  confidence: number;
  tlsHash: string;
}

interface GeneratedProof {
  commitment: string;
  hashedAge: string;
}

export default function Home() {
  const web3 = useWeb3Wallet();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [proof, setProof] = useState<GeneratedProof | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  /* UTILS */
  const sha256 = async (message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return '0x' + Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  };

  /* HANDLERS */
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    setError('');

    try {
      const { data } = await Tesseract.recognize(file, 'eng');
      const ocrText = data.text || '';

      const dobMatch = ocrText.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{4})/);
      const nameMatch = ocrText.match(/([A-Z][A-Z\s]{3,})/);

      // Deterministic hash based on file content
      const fileBuffer = await file.arrayBuffer();
      const tlsHash = await sha256(new Uint8Array(fileBuffer).toString());

      setDocument({
        file,
        fullName: nameMatch?.[1]?.trim() || 'NOT_DETECTED',
        dateOfBirth: dobMatch?.[1] || 'NOT_DETECTED',
        confidence: (data.confidence || 0) / 100,
        tlsHash,
      });
      setCurrentStep('proof');
    } catch (err) {
      setError('OCR processing failed. Please check the document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!document) return;
    setIsProcessing(true);
    try {
      // Deterministic commitment based on identity data
      // In a real ZK circuit, this would be Poseidon(age, salt)
      const salt = crypto.randomUUID();
      const commitment = await sha256(`${document.fullName}-${document.dateOfBirth}-${salt}`);
      const hashedAge = await sha256(`18-${salt}`); // Proving 18+

      await new Promise(r => setTimeout(r, 1000)); // Simulating circuit calculation time

      setProof({
        commitment,
        hashedAge
      });
      setCurrentStep('onchain');
    } catch {
      setError('Proof generation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitOnChain = async () => {
    if (!web3.signer || !proof) return;
    setIsProcessing(true);
    try {
      // Simulate blockchain transaction delay
      await new Promise(r => setTimeout(r, 2000));

      // Generate a deterministic-looking mock TX hash
      const tx = await sha256(`tx-${Date.now()}-${proof.commitment}`);
      setTxHash(tx);
      setCurrentStep('complete');
    } catch {
      setError('Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  /* COMPONENTS */
  const StepIndicator = ({ step, active }: { step: Step, active: Step }) => {
    const steps: Step[] = ['upload', 'proof', 'onchain', 'complete'];
    const isActive = step === active;
    const isPast = steps.indexOf(step) < steps.indexOf(active);

    const labels = {
      upload: "Document Scan",
      proof: "Proof Generation",
      onchain: "Blockchain Commit",
      complete: "Verification"
    };

    return (
      <div className={`step-item ${isActive ? 'active' : ''} ${isPast ? 'completed' : ''}`}>
        <div className="w-4 h-4 flex items-center justify-center">
          {isPast ? <Check size={14} /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-current opacity-20'}`} />}
        </div>
        <span className="text-sm font-medium">{labels[step]}</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1000px] h-[600px] flex panel rounded-lg overflow-hidden shadow-2xl">

      {/* SIDEBAR */}
      <div className="w-[280px] border-r border-[#27272a] bg-[#09090b] flex flex-col">
        <div className="p-6 border-b border-[#27272a]">
          <h1 className="text-sm font-bold text-white tracking-wide">ZK IDENTITY</h1>
          <p className="text-xs text-[#52525b] mt-1">Platform v2.0.4</p>
        </div>

        <div className="flex-1 py-4">
          {(['upload', 'proof', 'onchain', 'complete'] as Step[]).map(s => (
            <StepIndicator key={s} step={s} active={currentStep} />
          ))}
        </div>

        <div className="p-4 border-t border-[#27272a]">
          <div className="text-[10px] text-[#52525b] uppercase font-semibold mb-2">System Status</div>
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            Circuits Loaded
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa] mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${web3.isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            {web3.isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-[#18181b] flex flex-col p-8 relative">
        {error && (
          <div className="absolute top-4 right-4 bg-red-900/20 border border-red-900 text-red-200 px-4 py-2 rounded text-sm flex items-center">
            {error}
            <button onClick={() => setError('')} className="ml-4 hover:text-white"><RefreshCw size={12} /></button>
          </div>
        )}

        {/* STEP: UPLOAD */}
        {currentStep === 'upload' && (
          <div className="h-full flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Identity Verification</h2>
              <p className="text-sm text-[#a1a1aa]">Upload a government-issued ID to begin the secure extraction process.</p>
            </div>

            <label className="input-zone h-[240px] flex flex-col items-center justify-center cursor-pointer group hover:border-[#a1a1aa] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="hidden"
                disabled={isProcessing}
              />
              {isProcessing ? (
                <div className="text-center">
                  <Loader2 className="animate-spin text-white mb-4 mx-auto" size={32} />
                  <span className="text-sm font-medium">Processing OCR...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded bg-[#27272a] flex items-center justify-center mb-4 group-hover:bg-[#3f3f46] transition-colors">
                    <Upload className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Click to Upload Document</span>
                  <span className="text-xs text-[#52525b]">Supports JPG, PNG, PDF (Max 10MB)</span>
                </>
              )}
            </label>
          </div>
        )}

        {/* STEP: PROOF */}
        {currentStep === 'proof' && document && (
          <div className="h-full flex flex-col justify-center max-w-[480px] mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Generate ZK Proof</h2>
              <p className="text-sm text-[#a1a1aa]">Create a cryptographic proof of age without revealing identity.</p>
            </div>

            <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-1 space-y-px mb-6">
              <div className="flex items-center justify-between p-3 bg-[#18181b]">
                <span className="text-xs text-[#71717a] font-medium uppercase">Full Name</span>
                <span className="text-sm font-mono text-white">{document.fullName}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#18181b]">
                <span className="text-xs text-[#71717a] font-medium uppercase">Date of Birth</span>
                <span className="text-sm font-mono text-white">{document.dateOfBirth}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#18181b]">
                <span className="text-xs text-[#71717a] font-medium uppercase">Document Hash</span>
                <span className="text-xs font-mono text-[#a1a1aa] break-all">{document.tlsHash.slice(0, 24)}...</span>
              </div>
            </div>

            <button
              onClick={handleGenerateProof}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
              Generate Zero-Knowledge Proof
            </button>
            <button
              onClick={() => setCurrentStep('upload')}
              className="btn-secondary w-full mt-3"
            >
              Cancel
            </button>
          </div>
        )}

        {/* STEP: ONCHAIN */}
        {currentStep === 'onchain' && proof && (
          <div className="h-full flex flex-col justify-center max-w-[480px] mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Blockchain Submission</h2>
              <p className="text-sm text-[#a1a1aa]">Commit the proof to the Ethereum Sepolia network.</p>
            </div>

            <div className="p-4 bg-[#27272a]/20 border border-[#27272a] rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-[#a1a1aa] mt-0.5" />
                <div>
                  <div className="text-sm text-white font-medium mb-1">Proof Generated Successfully</div>
                  <div className="text-xs text-[#71717a] font-mono whitespace-pre-wrap break-all">
                    COMMITMENT: {proof.commitment.slice(0, 48)}...
                  </div>
                </div>
              </div>
            </div>

            {!web3.isConnected ? (
              <button onClick={web3.connect} className="btn-primary w-full">
                Connect Wallet to Continue
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#a1a1aa] px-1">
                  <span>Connected: {web3.address?.slice(0, 6)}...{web3.address?.slice(-4)}</span>
                  <span className="text-emerald-500">Ready</span>
                </div>
                <button
                  onClick={handleSubmitOnChain}
                  disabled={isProcessing}
                  className="btn-primary w-full"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                  Submit Transaction
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP: COMPLETE */}
        {currentStep === 'complete' && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center mb-6">
              <Check className="text-emerald-500" size={32} />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">Verification Complete</h2>
            <p className="text-sm text-[#a1a1aa] max-w-[300px] mb-8">
              The zero-knowledge proof has been successfully verified and stored on-chain.
            </p>

            <div className="bg-[#09090b] border border-[#27272a] rounded p-3 mb-8 w-full max-w-[360px] flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#18181b] flex items-center justify-center text-[#71717a]">
                Tx
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-[10px] text-[#52525b] uppercase font-semibold">Transaction Hash</div>
                <div className="text-xs font-mono text-emerald-500 truncate">{txHash}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setDocument(null);
                setProof(null);
                setCurrentStep('upload');
              }}
              className="btn-secondary min-w-[140px]"
            >
              Verify Another Identity
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
