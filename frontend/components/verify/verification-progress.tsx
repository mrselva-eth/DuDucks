'use client'

import { CheckCircle2, Circle, Loader } from 'lucide-react'

type Step = 'select' | 'connecting' | 'digilocker' | 'processing' | 'completed'

interface VerificationProgressProps {
  currentStep: Step
}

const steps: { id: Step; label: string; description: string }[] = [
  { id: 'connecting', label: 'Connect Wallet', description: 'Link your Web3 wallet' },
  { id: 'digilocker', label: 'DigiLocker Auth', description: 'Authenticate and retrieve document' },
  { id: 'processing', label: 'Generate Proof', description: 'Create zero-knowledge proof' },
  { id: 'completed', label: 'Complete', description: 'Verification submitted on-chain' },
]

export function VerificationProgress({ currentStep }: VerificationProgressProps) {
  const getStepStatus = (stepId: Step) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId)
    const currentIndex = steps.findIndex((s) => s.id === currentStep)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex-1 flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    status === 'completed'
                      ? 'bg-accent text-background'
                      : status === 'current'
                        ? 'bg-accent/20 border-2 border-accent text-accent'
                        : 'bg-background/50 border-2 border-border text-foreground/40'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : status === 'current' ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>

                {/* Step Label (Mobile: hidden on small screens) */}
                <div className="mt-3 text-center hidden md:block">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      status === 'completed' || status === 'current'
                        ? 'text-foreground'
                        : 'text-foreground/40'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-xs transition-colors ${
                      status === 'completed' || status === 'current'
                        ? 'text-foreground/70'
                        : 'text-foreground/30'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all ${
                    status === 'completed' ? 'bg-accent' : 'bg-border/50'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Labels */}
      <div className="mt-6 md:hidden">
        {steps.map((step) => {
          const status = getStepStatus(step.id)
          return (
            <div key={step.id} className="mb-4">
              <p
                className={`text-sm font-semibold transition-colors ${
                  status === 'completed' || status === 'current'
                    ? 'text-foreground'
                    : 'text-foreground/40'
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-xs transition-colors ${
                  status === 'completed' || status === 'current'
                    ? 'text-foreground/70'
                    : 'text-foreground/30'
                }`}
              >
                {step.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
