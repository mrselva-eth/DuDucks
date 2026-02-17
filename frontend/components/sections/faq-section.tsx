import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'What is a zero-knowledge proof?',
    a: 'A zero-knowledge proof lets you prove that something is true (e.g. your document is valid) without revealing the underlying data. DuDucks uses ZK proofs so your Aadhaar details never appear on the blockchain.',
  },
  {
    q: 'Do I need to pay gas fees?',
    a: 'No. Our relayer submits the verification transaction for you. You only sign a message with your wallet to authorize the submission.',
  },
  {
    q: 'Is my data safe with DigiLocker?',
    a: 'DigiLocker is the Government of India’s document wallet. We use official OAuth to read your document; we do not store your raw document data.',
  },
  {
    q: 'Which chain is DuDucks on?',
    a: 'DuDucks runs on Base Sepolia testnet. Connect your wallet to Base Sepolia to verify documents.',
  },
]

export function FAQSection() {
  return (
    <section className="relative min-h-screen bg-background/50 border-y border-border/30 flex flex-col justify-center snap-start snap-always overflow-hidden">
      <div className="absolute left-0 right-[68%] top-0 bottom-0 flex flex-col items-start justify-center px-8 md:px-12 lg:px-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-foreground">Frequently Asked </span>
          <span className="text-accent">Questions</span>
        </h2>
      </div>
      <div className="absolute left-[32%] right-0 top-0 bottom-0 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8">
        <Accordion type="single" collapsible className="w-full max-w-2xl">
          {faqs.map(({ q, a }) => (
            <AccordionItem key={q} value={q} className="border-border/50">
              <AccordionTrigger className="text-left text-foreground hover:text-accent py-4">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 pb-4">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="absolute left-[32%] top-20 md:top-24 bottom-12 -translate-x-1/2 flex items-center justify-center w-24 md:w-36">
        <svg
          viewBox="-60 0 220 100"
          preserveAspectRatio="none"
          className="h-full w-full text-foreground/50 scale-x-[-1]"
        >
          <path
            d="M 50 0 Q -80 50, 50 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </section>
  )
}
