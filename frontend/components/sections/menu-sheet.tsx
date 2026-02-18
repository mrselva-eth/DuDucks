'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDisconnect } from 'wagmi'
import { Copy, Check, LogOut } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { DesignButton } from '@/components/design/button'
import { Button } from '@/components/ui/button'

interface MenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-5)}`
}

export function MenuSheet({ open, onOpenChange }: MenuSheetProps) {
  const [copied, setCopied] = useState(false)
  const { disconnect } = useDisconnect()

  const handleCopy = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        noOverlay
        closeButtonClassName="border-2 border-foreground/30 rounded-none w-9 h-9 flex items-center justify-center focus:ring-0 focus:ring-offset-0"
        className="w-[min(20rem,85vw)] sm:max-w-[20rem] top-[calc(0.35cm-3px)] right-[calc(0.35cm-3px)] bottom-[calc(0.35cm-3px)] left-auto h-auto border-l-0 p-0 overflow-visible bg-white shadow-none"
      >
        {/* Curved left edge (more pronounced, like "(") */}
        <div
          className="absolute left-0 top-0 bottom-0 w-6 -translate-x-full"
          aria-hidden
        >
          <svg
            viewBox="0 0 60 400"
            preserveAspectRatio="none"
            className="h-full w-full text-white"
          >
            <path
              d="M 60 0 Q -40 200, 60 400"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="h-full pt-14 pb-6 pl-10 pr-6 bg-white flex flex-col">
          <SheetHeader className="text-left pb-4">
            <div className="w-fit">
              <SheetTitle className="text-2xl md:text-3xl font-bold">Menu</SheetTitle>
              <div className="w-full mt-1 h-2 overflow-visible" aria-hidden>
                <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-full text-foreground/50">
                  <path
                    d="M 0 50 Q 100 90, 200 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>
          </SheetHeader>
          <nav className="flex flex-col items-center gap-4 mt-8">
            <Link
              href="/"
              onClick={() => onOpenChange(false)}
              className="text-2xl md:text-3xl font-bold text-foreground hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              href="/verify"
              onClick={() => onOpenChange(false)}
              className="text-2xl md:text-3xl font-bold text-foreground hover:text-accent transition-colors"
            >
              Verify
            </Link>
          </nav>

          {/* Bottom: wallet (connected = address + copy + log out, else = Wallet button) */}
          <div className="mt-auto pt-6 border-t border-foreground/15 space-y-4">
            <ConnectButton.Custom>
              {({ account, openConnectModal, mounted }) => {
                if (!mounted) return null
                if (!account) {
                  return (
                    <DesignButton onClick={openConnectModal} className="w-full justify-center text-base py-3">
                      Wallet
                    </DesignButton>
                  )
                }
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-base md:text-lg font-medium text-foreground truncate min-w-0">
                        {formatAddress(account.address)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-10 gap-2 shrink-0 min-w-[100px] justify-center text-base"
                        onClick={() => handleCopy(account.address)}
                      >
                        {copied ? (
                          <>
                            <Check className="h-5 w-5 text-foreground shrink-0" />
                            <span className="text-sm">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-5 w-5" />
                            <span className="text-sm">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-3 text-base py-4 h-auto"
                      onClick={() => disconnect()}
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      Log out
                    </Button>
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
