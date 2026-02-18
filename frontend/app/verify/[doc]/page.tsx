'use client'

import { Header } from '@/components/header'
import { WalletRequiredGuard } from '@/components/context/wallet-required-guard'

export default function DocumentPage() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      <WalletRequiredGuard>
        <div className="flex-1 pt-8 pb-20" />
      </WalletRequiredGuard>
    </main>
  )
}
