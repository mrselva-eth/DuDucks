'use client'

import { useState } from 'react'
import { useDisconnect } from 'wagmi'
import { Copy, Check, LogOut } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface ConnectedAddressPopoverProps {
  address: string
  children: React.ReactNode
}

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-5)}`
}

export function ConnectedAddressPopover({ address, children }: ConnectedAddressPopoverProps) {
  const [copied, setCopied] = useState(false)
  const { disconnect } = useDisconnect()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[240px] p-3" sideOffset={8}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <code className="text-sm font-medium text-foreground truncate min-w-0">{formatAddress(address)}</code>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 shrink-0 min-w-[84px] justify-center"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-foreground"
            onClick={handleDisconnect}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
