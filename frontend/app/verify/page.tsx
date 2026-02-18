'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Header } from '@/components/header'
import { DesignButton } from '@/components/design/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const UPCOMING_DOCS = [
  { id: 'pan', name: 'PAN Card', comingSoon: true },
  { id: 'dl', name: 'Driving License', comingSoon: true },
  { id: 'passport', name: 'Passport', comingSoon: true },
] as const

export default function VerifyPage() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      {/* Fixed box: left side, 10cm × 15cm, does not move on scroll */}
      <div className="fixed left-6 top-[calc(4rem+1cm)] z-20 w-[10cm] h-[15cm] border-2 border-foreground rounded-sm flex flex-col items-center justify-between px-4 py-5 bg-background">
        {/* 1. Heading with curved underline */}
        <div className="w-fit shrink-0">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Duck Score</h2>
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

        {/* 2. Big 0 in center */}
        <span className="text-[7rem] md:text-[8rem] font-bold text-foreground leading-none shrink-0">0</span>

        {/* 3. Bottom: what is this duck score - click for explanation */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-sm text-foreground/80 underline underline-offset-2 shrink-0 hover:text-foreground transition-colors text-left cursor-pointer"
            >
              what is this duck score (!)
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-64 max-w-[90vw]">
            <p className="text-sm text-foreground/90">
              Duck Score is a trust score based on verified government documents. 
              The more documents you verify through DuDucks, the higher your score.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right side: Verifiable Documents (full width) + dropdowns to the right */}
      <div className="flex-1 pt-8 pb-20 pl-[calc(10cm+4rem)] pr-8 md:pr-16 lg:pr-24 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <div className="w-full max-w-2xl shrink-0 lg:basis-[42rem]">
          {/* Heading */}
          <div className="w-fit mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Verifiable Documents
            </h2>
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

          {/* Aadhaar Card - Available now */}
          <div className="rounded-lg border-2 border-foreground/20 bg-white/60 backdrop-blur-sm p-5 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-accent">A</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Aadhaar Card</h3>
                <span className="text-xs text-accent font-medium">Available now</span>
              </div>
            </div>
            <Link href="/verify/aadhaar">
              <DesignButton className="shrink-0">Verify</DesignButton>
            </Link>
          </div>

          {/* Upcoming dropdown */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-3 text-left font-medium text-foreground hover:text-accent transition-colors group">
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span>Upcoming</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-2 pl-7">
                {UPCOMING_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-foreground/15 bg-white/40 backdrop-blur-sm p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-foreground/70">{doc.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground/90">{doc.name}</h3>
                        <span className="text-xs text-foreground/50">Coming soon</span>
                      </div>
                    </div>
                    <DesignButton
                      showArrow={false}
                      className="opacity-60 cursor-not-allowed"
                      disabled
                    >
                      Verify
                    </DesignButton>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Right column: 4 dropdowns */}
        <div className="flex flex-col gap-4 min-w-0 lg:max-w-xs">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-3 text-left font-medium text-foreground hover:text-accent transition-colors group">
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span>Badges</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 pl-7 text-sm text-foreground/70">{/* Empty */}</div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-3 text-left font-medium text-foreground hover:text-accent transition-colors group">
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span>FAQ</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 pl-7 text-sm text-foreground/70">{/* Empty */}</div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-3 text-left font-medium text-foreground hover:text-accent transition-colors group">
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span>Network details</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 pl-7 text-sm text-foreground/70">{/* Empty */}</div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-3 text-left font-medium text-foreground hover:text-accent transition-colors group">
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span>Partner</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 pl-7 text-sm text-foreground/70">{/* Empty */}</div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </main>
  )
}
