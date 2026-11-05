import TopBar from '@/components/layout/TopBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      {children}
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
