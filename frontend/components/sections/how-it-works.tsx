const steps = [
  { title: 'Connect Wallet', text: 'Link your Web3 wallet. You only sign—no gas.' },
  { title: 'DigiLocker Auth', text: 'Authorize DuDucks to access your document from DigiLocker.' },
  { title: 'Generate Proof', text: 'A zero-knowledge proof is created locally in your browser.' },
  { title: 'On-Chain Verification', text: "The relayer submits your proof; you're verified on-chain." },
]

export function HowItWorks() {
  return (
    <section className="relative min-h-screen snap-start snap-always overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-[30%] flex items-end justify-center pb-2 px-8">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-foreground">How It </span>
          <span className="text-accent">Works</span>
        </h2>
      </div>
      <div className="absolute left-0 right-0 top-[36%] -translate-y-1/2 h-8 md:h-10 w-full pointer-events-none">
        <svg
          viewBox="0 0 200 220"
          preserveAspectRatio="none"
          className="h-full w-full text-foreground/50"
        >
          <path
            d="M 0 50 Q 100 210, 200 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="absolute left-0 right-0 top-[36.5%] bottom-0 flex items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-5xl mx-auto flex">
          {steps.map(({ title, text }, i) => (
            <div key={i} className="flex-1 flex flex-col items-center min-w-0">
              <div className="w-0.5 h-24 md:h-32 lg:h-40 bg-foreground/50 shrink-0" />
              <div className="mt-3 text-center px-1">
                <h3 className="font-semibold text-foreground text-sm md:text-base">{title}</h3>
                <p className="text-foreground/70 text-xs md:text-sm mt-1 leading-snug">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
