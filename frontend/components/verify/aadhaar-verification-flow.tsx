'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader, CheckCircle2, AlertCircle, ExternalLink, Copy } from 'lucide-react'
import { DIGILOCKER_CONFIG } from '@/lib/digilocker'

type Step = 'select' | 'connecting' | 'digilocker' | 'processing' | 'completed'

interface AadhaarVerificationFlowProps {
  currentStep: Step
  setCurrentStep: (step: Step) => void
  onBack: () => void
}

export function AadhaarVerificationFlow({
  currentStep,
  setCurrentStep,
  onBack,
}: AadhaarVerificationFlowProps) {
  const [txHash, setTxHash] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // Simulate flow progression for demo
  useEffect(() => {
    if (currentStep === 'connecting') {
      const timer = setTimeout(() => setCurrentStep('digilocker'), 2000)
      return () => clearTimeout(timer)
    }

    if (currentStep === 'digilocker') {
      const timer = setTimeout(() => setCurrentStep('processing'), 2000)
      return () => clearTimeout(timer)
    }

    if (currentStep === 'processing') {
      const timer = setTimeout(() => {
        setCurrentStep('completed')
        setTxHash('0x' + Math.random().toString(16).substring(2, 66))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, setCurrentStep])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {currentStep === 'connecting' && (
        <Card className="bg-background/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Loader className="w-5 h-5 text-accent animate-spin" />
              Connecting Wallet
            </CardTitle>
            <CardDescription>Please approve the wallet connection in your extension</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <p className="text-sm text-foreground/70">
                We're establishing a secure connection to your Web3 wallet. This is required to sign your proof.
              </p>
            </div>
            <Button variant="outline" onClick={onBack} disabled>
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'digilocker' && (
        <Card className="bg-background/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Loader className="w-5 h-5 text-accent animate-spin" />
              Authenticating with DigiLocker
            </CardTitle>
            <CardDescription>You will be redirected to DigiLocker to authorize document access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/30 space-y-3">
              <p className="text-sm text-foreground/70">
                Next, you'll be taken to the official DigiLocker portal. Follow these steps:
              </p>
              <ol className="text-sm text-foreground/70 space-y-2 list-decimal list-inside">
                <li>Log in with your DigiLocker credentials</li>
                <li>Authorize DuDucks to access your Aadhaar document</li>
                <li>You'll be redirected back to complete verification</li>
              </ol>
            </div>

            <a
              href={DIGILOCKER_CONFIG.webHome}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-accent text-background hover:bg-accent/90 text-base py-6 flex items-center justify-center gap-2">
                Go to DigiLocker
                <ExternalLink className="w-5 h-5" />
              </Button>
            </a>

            <p className="text-xs text-foreground/50 text-center">
              After authorizing, return here and click "Continue"
            </p>

            <Button className="w-full bg-accent/20 text-accent hover:bg-accent/30">
              Continue After DigiLocker Auth
            </Button>

            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'processing' && (
        <Card className="bg-background/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Loader className="w-5 h-5 text-accent animate-spin" />
              Generating Zero-Knowledge Proof
            </CardTitle>
            <CardDescription>Creating cryptographic proof of your Aadhaar validity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="text-xs text-foreground/60 font-mono">
                  [ZK] Initializing Circom circuit...
                </p>
              </div>
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="text-xs text-foreground/60 font-mono">
                  [ZK] Processing Aadhaar data...
                </p>
              </div>
              <div className="p-3 bg-background/50 rounded border border-border/50 animate-pulse">
                <p className="text-xs text-foreground/60 font-mono">
                  [ZK] Generating Groth16 proof...
                </p>
              </div>
            </div>

            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-sm text-foreground/70">
                This is happening locally on your device. Your personal data never leaves your browser.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'completed' && (
        <div className="space-y-4">
          <Card className="bg-background/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-accent" />
                Verification Complete
              </CardTitle>
              <CardDescription>Your Aadhaar has been verified and recorded on-chain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Info */}
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-sm text-foreground/70">
                  Your zero-knowledge proof has been verified and submitted to Base Sepolia blockchain. Your
                  verification is now permanent and immutable.
                </p>
              </div>

              {/* Transaction Hash */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Transaction Hash</label>
                <div className="flex items-center gap-2 p-3 bg-background/50 rounded border border-border/50">
                  <code className="text-xs text-foreground/70 flex-1 break-all font-mono">{txHash}</code>
                  <button
                    onClick={copyToClipboard}
                    className="text-foreground/50 hover:text-accent transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copied && <p className="text-xs text-accent">Copied to clipboard</p>}
              </div>

              {/* Verification Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background/50 rounded border border-border/50">
                  <p className="text-xs text-foreground/60">Document Type</p>
                  <p className="text-sm font-semibold text-foreground">Aadhaar Card</p>
                </div>
                <div className="p-3 bg-background/50 rounded border border-border/50">
                  <p className="text-xs text-foreground/60">Status</p>
                  <p className="text-sm font-semibold text-accent">Verified</p>
                </div>
                <div className="p-3 bg-background/50 rounded border border-border/50">
                  <p className="text-xs text-foreground/60">Network</p>
                  <p className="text-sm font-semibold text-foreground">Base Sepolia</p>
                </div>
                <div className="p-3 bg-background/50 rounded border border-border/50">
                  <p className="text-xs text-foreground/60">Valid Until</p>
                  <p className="text-sm font-semibold text-foreground">1 year</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-accent text-background hover:bg-accent/90">
                  View on BaseScan
                </Button>
                <Button variant="outline" className="flex-1">
                  Download Proof
                </Button>
              </div>

              <Button variant="outline" onClick={onBack} className="w-full">
                Verify Another Document
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
