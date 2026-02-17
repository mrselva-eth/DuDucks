const features = [
  { title: 'Privacy-Preserving', text: 'Zero-knowledge proofs let you verify documents without exposing sensitive data to the blockchain or third parties.' },
  { title: 'DigiLocker Integration', text: 'Securely pull your Aadhaar and other government documents from the official DigiLocker portal via OAuth.' },
  { title: 'Gas-Free for You', text: 'Our relayer submits verifications on your behalf. You only sign with your wallet—no ETH required.' },
  { title: 'On-Chain Record', text: 'Verification status is stored on Base Sepolia. Tamper-proof and verifiable by any service.' },
]

const curveOffsets = ['pl-6', 'pl-8', 'pl-8', 'pl-6']

export function FeaturesSection() {
  return (
    <section className="relative min-h-screen bg-background/50 border-y border-border/30 flex flex-col justify-center snap-start snap-always overflow-hidden">
      <div className="absolute left-0 right-[68%] top-0 bottom-0 flex flex-col items-start justify-center px-8 md:px-12 lg:px-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-foreground">Why Du</span>
          <span className="text-accent">Ducks</span>
        </h2>
      </div>
      <ul className="absolute left-[32%] right-0 top-0 bottom-0 flex flex-col justify-center px-8 md:px-12 lg:px-16 gap-y-4 py-8">
        {features.map(({ title, text }, i) => (
          <li key={i} className={`list-disc list-inside text-foreground/80 text-base md:text-lg ${curveOffsets[i]}`}>
            <span className="font-semibold text-foreground">{title}:</span> {text}
          </li>
        ))}
      </ul>
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
