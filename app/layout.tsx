import type { Viewport } from 'next'
import { ROOT_METADATA } from '@/lib/seo'
import './globals.css'

export const metadata = ROOT_METADATA

export const viewport: Viewport = {
  themeColor: '#0F7B5A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-body text-gray-800 antialiased">
        {children}
      </body>
    </html>
  )
}
