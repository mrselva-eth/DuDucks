'use client'

/**
 * Web3 Configuration for DuDucks
 * Setup for RainbowKit and Wagmi
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia } from 'wagmi/chains'

// Create config once so WagmiProvider can wrap the tree on first render (avoids WagmiProviderNotFoundError)
export const web3Config = getDefaultConfig({
  appName: 'DuDucks',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
  chains: [baseSepolia],
  ssr: true,
})

/** @deprecated Use web3Config directly */
export function getWeb3Config() {
  return web3Config
}

export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
}
