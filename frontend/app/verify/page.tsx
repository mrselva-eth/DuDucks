'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { DocumentSelector } from '@/components/verify/document-selector'
import { AadhaarVerificationFlow } from '@/components/verify/aadhaar-verification-flow'
import { VerificationProgress } from '@/components/verify/verification-progress'

type Step = 'select' | 'connecting' | 'digilocker' | 'processing' | 'completed'

export default function VerifyPage() {
  const [currentStep, setCurrentStep] = useState<Step>('select')
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  const handleSelectDocument = (docType: string) => {
    setSelectedDocument(docType)
    setCurrentStep('connecting')
  }

  const handleBack = () => {
    setCurrentStep('select')
    setSelectedDocument(null)
  }

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />

      <div className="flex-1 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                Verify Your Government Documents
              </h1>
              <p className="text-foreground/70 text-lg">
                Select the document you want to verify. It will be retrieved from DigiLocker.
              </p>
            </div>

            {/* Progress Indicator */}
            <VerificationProgress currentStep={currentStep} />

            {/* Step Content */}
            <div className="mt-12">
              {currentStep === 'select' && (
                <DocumentSelector onSelectDocument={handleSelectDocument} />
              )}

              {(currentStep === 'connecting' || 
                currentStep === 'digilocker' || 
                currentStep === 'processing' ||
                currentStep === 'completed') && (
                <AadhaarVerificationFlow
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
