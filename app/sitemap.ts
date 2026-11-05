import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cvpro225.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const staticPages = [
    { url: '', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: '/services/cv-pro', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/services/job-assist', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/tarifs', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: '/a-propos', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/contact', changeFrequency: 'yearly' as const, priority: 0.6 },
    { url: '/login', changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: '/inscription', changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return staticPages.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
