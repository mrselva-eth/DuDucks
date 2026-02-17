'use client'

import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { DesignButton } from '@/components/design/button'
import { ConnectedAddressPopover } from '@/components/header/connected-address-popover'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-[55%] min-w-0 ml-[22.5%] mr-[22.5%] rounded-b-2xl bg-white backdrop-blur-md flex h-16 items-center px-6 relative z-50">
        {/* Left: Logo */}
        <div className="flex-1 flex items-center min-w-0 pointer-events-none select-none">
          <Image
            src="/images/logo.png"
            alt="DuDucks"
            width={100}
            height={33}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>

        {/* Center: Project name */}
        <div className="flex shrink-0 items-center pointer-events-none select-none">
          <span className="text-2xl font-bold leading-tight">
            <span className="text-foreground">Du</span>
            <span className="text-accent">Ducks</span>
          </span>
        </div>

        {/* Right: Connect wallet */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 justify-end">
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, openChainModal, mounted }) => {
              if (!mounted) return null
              if (!account) {
                return (
                  <DesignButton onClick={openConnectModal}>
                    Wallet
                  </DesignButton>
                )
              }
              return (
                <div className="flex items-center gap-2">
                  {chain?.id !== 84532 && (
                    <button
                      onClick={openChainModal}
                      className="text-xs text-foreground/80 hover:text-foreground px-2 py-1 rounded border border-border/50"
                    >
                      Wrong network
                    </button>
                  )}
                  <ConnectedAddressPopover address={account.address}>
                    <div className="cursor-pointer inline-block">
                      <DesignButton showArrow={false}>
                        {`${account.address.slice(0, 4)}...${account.address.slice(-5)}`}
                      </DesignButton>
                    </div>
                  </ConnectedAddressPopover>
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  )
}
