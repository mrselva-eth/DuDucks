'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { DesignButton } from '@/components/design/button'
import { ConnectedAddressPopover } from '@/components/header/connected-address-popover'
import { MenuSheet } from '@/components/sections/menu-sheet'

export function Header() {
  const pathname = usePathname()
  const isVerifyPage = pathname === '/verify'
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-[55%] min-w-0 ml-[22.5%] mr-[22.5%] rounded-b-2xl bg-white backdrop-blur-md flex h-16 items-center px-6 relative z-50">
        {/* Left: Logo (home link) – only the logo is clickable */}
        <Link
          href="/"
          className="flex items-center shrink-0 select-none bg-white hover:bg-white active:bg-white focus:bg-white outline-none !border-0 ring-0 shadow-none hover:!border-0 active:!border-0 focus:!border-0 hover:ring-0 active:ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [-webkit-tap-highlight-color:transparent]"
        >
          <Image
            src="/images/logo.png"
            alt="DuDucks"
            width={100}
            height={33}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <div className="flex-1 min-w-0" aria-hidden />

        {/* Center: Project name or Verify page heading */}
        <div className="flex shrink-0 items-center pointer-events-none select-none">
          <span className="text-2xl font-bold leading-tight">
            {isVerifyPage ? (
              <>
                <span className="text-foreground">Verify </span>
                <span className="text-accent">Gov</span>
                <span className="text-foreground"> Doc</span>
              </>
            ) : (
              <>
                <span className="text-foreground">Du</span>
                <span className="text-accent">Ducks</span>
              </>
            )}
          </span>
        </div>

        {/* Right: Connect wallet + hamburger menu */}
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
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  )
}
