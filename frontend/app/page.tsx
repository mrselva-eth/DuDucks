import { Header } from '@/components/header'
import { HeroSection } from '@/components/sections/hero-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { HowItWorks } from '@/components/sections/how-it-works'
import { FAQSection } from '@/components/sections/faq-section'
import { FooterSection } from '@/components/sections/footer-section'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <FAQSection />
      <FooterSection />
    </main>
  )
}
