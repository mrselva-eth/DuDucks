'use client'

import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { BASE_SEPOLIA_CONFIG } from '@/lib/web3-config'

interface WalletConnectProps {
  onConnected?: (address: string) => void
}

export function WalletConnect({ onConnected }: WalletConnectProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const isCorrectChain = chainId === BASE_SEPOLIA_CONFIG.chainId

  if (isConnected && isCorrectChain && address) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/30 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Wallet Connected</p>
            <p className="text-sm text-foreground/70 break-all">{address}</p>
          </div>
        </div>
        <Button
          className="w-full bg-accent text-background hover:bg-accent/90"
          onClick={() => {
            onConnected?.(address)
          }}
        >
          Continue with This Wallet
        </Button>
      </div>
    )
  }

  if (isConnected && !isCorrectChain) {
    return (
      <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-foreground">Wrong Network</p>
          <p className="text-sm text-foreground/70">
            Please switch to {BASE_SEPOLIA_CONFIG.name} in your wallet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-background/50 rounded-lg border border-border/50">
      <p className="text-sm text-foreground/70 mb-4">
        Connect your wallet to proceed with verification. You'll only need to sign, no gas fees.
      </p>
      <ConnectButton
        accountStatus="avatar"
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  )
}
