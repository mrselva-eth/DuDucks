'use client'

import dynamic from 'next/dynamic'

const Web3Provider = dynamic(
  () => import('@/components/providers/web3-provider').then((m) => ({ default: m.Web3Provider })),
  { ssr: false }
)

export function Web3ProviderClient({ children }: { children: React.ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>
}
