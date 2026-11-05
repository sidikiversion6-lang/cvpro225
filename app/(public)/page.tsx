import { PAGE_METADATA } from '@/lib/seo'
import { CVCheckerHomeSection } from '@/components/home/CVCheckerHomeSection'
import AboutSection from '@/components/home/AboutSection'
import ServicesIcons from '@/components/home/ServicesIcons'
import SplitCTA from '@/components/home/SplitCTA'
import StatsBar from '@/components/home/StatsBar'
import Testimonials from '@/components/home/Testimonials'
import WhatsAppCTA from '@/components/home/WhatsAppCTA'

export const metadata = PAGE_METADATA.home

export default function HomePage() {
  return (
    <>
      {/* Le header est `fixed` (h-72px) : plus aucun hero ne l'absorbe, il faut
          donc réserver sa hauteur. Sur lg la TopBar (~40px) occupe déjà le flux
          sous lui, d'où l'écart réduit. */}
      <div aria-hidden className="h-[72px] lg:h-8" />
      <CVCheckerHomeSection />
      <AboutSection />
      <ServicesIcons />
      <SplitCTA />
      <StatsBar />
      <Testimonials />
      <WhatsAppCTA />
    </>
  )
}
