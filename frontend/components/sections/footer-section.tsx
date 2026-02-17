import Link from 'next/link'
import Image from 'next/image'

const pageLinks = [
  { label: 'Home', href: '/' },
  { label: 'Verify', href: '/verify' },
]

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'Discord', href: 'https://discord.gg' },
  { label: 'GitHub', href: 'https://github.com' },
]

export function FooterSection() {
  return (
    <footer className="border-t border-border/50 bg-background/90 py-10 md:py-14 min-h-[50vh] flex flex-col justify-center snap-start">
      <div className="w-full max-w-6xl mx-auto pr-6 md:pr-8 pl-2 md:pl-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-4 md:gap-6">
              <Image
                src="/images/logo.png"
                alt="DuDucks"
                width={80}
                height={27}
                className="h-12 md:h-14 w-auto object-contain shrink-0"
              />
              <span className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
                <span className="text-foreground">Du</span>
                <span className="text-accent">Ducks</span>
              </span>
            </div>
            <p className="mt-6 text-foreground/50 text-sm md:text-base max-w-2xl">
              Government document verification with ZK. Built for secure, privacy-preserving verification on Base Sepolia.
            </p>
          </div>
          <div className="flex gap-12 md:gap-16 shrink-0">
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-3">Page</h3>
              <nav className="flex flex-col gap-2">
                {pageLinks.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-foreground/70 hover:text-accent transition-colors text-sm md:text-base"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-3">Social</h3>
              <nav className="flex flex-col gap-2">
                {socialLinks.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-accent transition-colors text-sm md:text-base"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/30 text-center text-sm text-foreground/50">
          Built for secure, privacy-preserving document verification on Base Sepolia.
        </div>
      </div>
    </footer>
  )
}
