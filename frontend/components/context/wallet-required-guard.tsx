'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { DesignButton } from '@/components/design/button'

interface WalletRequiredGuardProps {
  children: React.ReactNode
}

/**
 * Wraps content that requires a connected wallet.
 * When disconnected: shows Back to home + Wallet connect.
 * When connected: shows children (updates without refresh).
 */
export function WalletRequiredGuard({ children }: WalletRequiredGuardProps) {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
        <div className="max-w-md w-full rounded-xl border-2 border-foreground/20 bg-white/80 backdrop-blur-sm p-8 flex flex-col items-center gap-6 text-center">
          <h2 className="text-xl font-bold text-foreground">Wallet required</h2>
          <p className="text-foreground/70 text-sm">
            Connect your wallet to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/" className="flex-1 order-2 sm:order-1">
              <DesignButton
                showArrow={false}
                className="w-full justify-center border-2 border-foreground/30 bg-transparent hover:bg-foreground/5"
              >
                Back to home
              </DesignButton>
            </Link>
            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => {
                if (!mounted) return null
                return (
                  <div className="flex-1 order-1 sm:order-2">
                    <DesignButton
                      onClick={openConnectModal}
                      className="w-full justify-center"
                    >
                      Wallet
                    </DesignButton>
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
