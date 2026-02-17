import type { Metadata } from 'next'

import './globals.css'
import { Web3Provider } from '@/components/providers/web3-provider'

export const metadata: Metadata = {
  title: 'DuDucks',
  description: 'Government Document Verification with Zero Knowledge Proofs',
  metadataBase: new URL('https://duducks.app'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/logo.png',
  },
  openGraph: {
    title: 'DuDucks - Document Verification with ZK Proofs',
    description: 'Verify your Aadhaar card and government documents securely on-chain',
    type: 'website',
    images: ['/images/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased relative">
        <Web3Provider>{children}</Web3Provider>
        {/* Full-page fixed white border frame (0.35 cm), behind navbar so line doesn't show on navbar */}
        <div
          className="fixed inset-0 border-[0.35cm] border-white pointer-events-none z-40"
          aria-hidden
        />
      </body>
    </html>
  )
}
