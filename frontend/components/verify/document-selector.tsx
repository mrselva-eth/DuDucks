'use client'

import { FileCheck, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DocumentOption {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className: string }>
  status: 'available' | 'coming-soon'
}

const documents: DocumentOption[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    description: 'Government-issued unique identification number',
    icon: FileCheck,
    status: 'available',
  },
  {
    id: 'pan',
    name: 'PAN Card',
    description: 'Permanent Account Number for taxation',
    icon: FileCheck,
    status: 'coming-soon',
  },
  {
    id: 'passport',
    name: 'Passport',
    description: 'International travel document',
    icon: FileCheck,
    status: 'coming-soon',
  },
  {
    id: 'dl',
    name: 'Driving License',
    description: 'Authorization to operate vehicles',
    icon: FileCheck,
    status: 'coming-soon',
  },
]

interface DocumentSelectorProps {
  onSelectDocument: (docType: string) => void
}

export function DocumentSelector({ onSelectDocument }: DocumentSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Available Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent" />
          Available Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents
            .filter((doc) => doc.status === 'available')
            .map((doc) => {
              const Icon = doc.icon
              return (
                <Card
                  key={doc.id}
                  className="bg-background/50 border-border/50 hover:border-accent/50 transition-all cursor-pointer group"
                  onClick={() => onSelectDocument(doc.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-8 h-8 text-accent" />
                      <span className="text-xs font-semibold text-accent bg-accent/20 px-2 py-1 rounded">
                        READY
                      </span>
                    </div>
                    <CardTitle className="text-foreground group-hover:text-accent transition-colors">
                      {doc.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground/70 mb-4">
                      {doc.description}
                    </CardDescription>
                    <Button className="w-full bg-accent text-background hover:bg-accent/90">
                      Verify {doc.name}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground/60 mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents
            .filter((doc) => doc.status === 'coming-soon')
            .map((doc) => {
              const Icon = doc.icon
              return (
                <Card
                  key={doc.id}
                  className="bg-background/30 border-border/25 opacity-60"
                  disabled
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                        SOON
                      </span>
                    </div>
                    <CardTitle className="text-foreground/50">{doc.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground/40 mb-4">
                      {doc.description}
                    </CardDescription>
                    <Button disabled className="w-full" variant="outline">
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-12 p-6 rounded-lg bg-accent/10 border border-accent/30">
        <h3 className="font-semibold text-foreground mb-2">How it works</h3>
        <ol className="text-sm text-foreground/70 space-y-2 list-decimal list-inside">
          <li>Select a document to verify</li>
          <li>Connect your wallet (you'll sign, not pay)</li>
          <li>Authenticate with DigiLocker</li>
          <li>We generate a zero-knowledge proof</li>
          <li>Your verification is recorded on-chain</li>
        </ol>
      </div>
    </div>
  )
}
