'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { web3Config } from '@/lib/web3-config'
import { duducksRainbowTheme } from '@/lib/rainbowkit-theme'
import '@rainbow-me/rainbowkit/styles.css'
import './rainbowkit-overrides.css'

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={web3Config}>
        <RainbowKitProvider theme={duducksRainbowTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
