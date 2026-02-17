import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative min-h-screen min-h-[100dvh] pt-20 md:pt-24 flex items-center justify-center overflow-hidden snap-start snap-always">
      <div className="absolute left-0 right-[40%] top-0 bottom-0 flex flex-col items-start justify-center px-8 md:px-12 lg:px-16 pointer-events-none select-none">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
          <span className="text-foreground">Du</span>
          <span className="text-accent">Ducks</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-full pr-6 md:pr-10 leading-relaxed">
          Securely verify your Aadhaar and government documents on-chain. Privacy-first with{' '}
          <span className="text-accent underline decoration-black decoration-solid decoration-2 underline-offset-[0.35em]">Zero Knowledge Proofs</span> on Base Sepolia.
        </p>
      </div>
      <div
        className="absolute left-[60%] right-0 top-0 bottom-0 flex items-center justify-center px-4 md:px-8 pointer-events-none select-none"
        aria-hidden
      >
        <Image
          src="/images/logo.png"
          alt=""
          width={400}
          height={133}
          className="h-[60%] min-h-[8rem] w-auto max-w-full object-contain opacity-90"
        />
      </div>
      <div className="absolute left-[60%] top-20 md:top-24 bottom-12 -translate-x-1/2 flex items-center justify-center w-24 md:w-36">
        <svg
          viewBox="-60 0 220 100"
          preserveAspectRatio="none"
          className="h-full w-full text-foreground/50"
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
