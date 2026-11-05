import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cvpro225.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/commander/confirmation', '/commander/paiement/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
