import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cvpro225.com'
export const SITE_NAME = 'CVPro225'

const TWITTER_HANDLE = '@cvpro225'
const OG_LOCALE = 'fr_CI'
const OG_IMAGE = '/og-image.jpg'

// Titre/description par défaut du site, hérités par toute page qui ne les override pas.
const SITE_TAGLINE = 'CVPro225 — Services Professionnels en Côte d\'Ivoire'
const SITE_DESCRIPTION = 'Votre partenaire professionnel en Côte d\'Ivoire. CV ATS, emploi, appels d\'offres. Basé à Abidjan.'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedAt?: string
  updatedAt?: string
  author?: string
  noIndex?: boolean
}

const DEFAULT_KEYWORDS = [
  'CVPro225',
  'services professionnels Côte d\'Ivoire',
  'CV professionnel Côte d\'Ivoire',
  'emploi Abidjan',
  'appels d\'offres Côte d\'Ivoire',
  'CV ATS Côte d\'Ivoire',
  'recrutement Côte d\'Ivoire',
  'offres emploi Abidjan',
]

export const SEO_KEYWORDS = {
  cv: [
    'CV professionnel Côte d\'Ivoire', 'CV ATS Abidjan', 'créer CV Côte d\'Ivoire',
    'CV optimisé recruteurs', 'lettre motivation Côte d\'Ivoire', 'CV mines Côte d\'Ivoire',
    'CV ONG Côte d\'Ivoire', 'modèle CV Côte d\'Ivoire',
  ],
  job: [
    'offres emploi Côte d\'Ivoire', 'trouver emploi Abidjan', 'candidature emploi Côte d\'Ivoire',
    'postuler offre emploi Côte d\'Ivoire', 'emploi mines Côte d\'Ivoire', 'emploi ONG Côte d\'Ivoire',
    'emploi banque Abidjan', 'recherche emploi Côte d\'Ivoire',
  ],
  tender: [
    'appels d\'offres Côte d\'Ivoire', 'marchés publics Côte d\'Ivoire', 'ANRMP Côte d\'Ivoire',
    'appels d\'offres Abidjan', 'soumission appel d\'offres Côte d\'Ivoire',
    'marchés Banque Mondiale Côte d\'Ivoire', 'appels d\'offres PNUD Côte d\'Ivoire',
    'PME marchés publics Côte d\'Ivoire',
  ],
  blog: [
    'conseils CV Côte d\'Ivoire', 'guide visa Côte d\'Ivoire', 'conseils emploi Abidjan',
    'ressources professionnelles Côte d\'Ivoire',
  ],
}

// Metadata du root layout. Source unique avec buildMetadata() ci-dessous :
// même SITE_NAME, mêmes keywords, même handle, même locale.
export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TAGLINE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: OG_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    creator: TWITTER_HANDLE,
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  verification: { google: process.env.GOOGLE_VERIFICATION },
}

export function buildMetadata(config: SEOConfig): Metadata {
  const {
    title, description, keywords = [], image = OG_IMAGE,
    url = '/', type = 'website', publishedAt, updatedAt, author, noIndex = false,
  } = config

  const fullUrl = `${SITE_URL}${url}`
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' as const, 'max-snippet': -1 } },
    openGraph: {
      type,
      url: fullUrl,
      title,
      description,
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      ...(publishedAt && { publishedTime: publishedAt }),
      ...(updatedAt && { modifiedTime: updatedAt }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
    alternates: { canonical: fullUrl },
    verification: { google: process.env.GOOGLE_VERIFICATION },
  }
}

export const PAGE_METADATA = {
  home: {
    ...buildMetadata({
      title: 'CVPro225 — CV, Emploi & Appels d\'offres en Côte d\'Ivoire',
      description: 'CVPro225 accompagne les Ivoiriens dans la création de CV ATS, la candidature emploi et les appels d\'offres. Basé à Abidjan.',
      keywords: [...SEO_KEYWORDS.cv.slice(0, 3), ...SEO_KEYWORDS.job.slice(0, 3), ...SEO_KEYWORDS.tender.slice(0, 2)],
      url: '/',
    }),
    // title.absolute bypass le template "%s — CVPro225" du root layout
    // (sinon → "CVPro225 — CV ... — CVPro225", doublon)
    title: { absolute: 'CVPro225 — CV, Emploi & Appels d\'offres en Côte d\'Ivoire' },
  },
  cvPro: buildMetadata({
    title: 'CV Pro ATS — CV Professionnel Optimisé pour les Recruteurs',
    description: 'Créez un CV professionnel optimisé ATS livré en 24-72h. Lettre de motivation incluse. Secteurs : mines, banque, ONG, télécoms. À partir de 15 000 FCFA.',
    keywords: SEO_KEYWORDS.cv,
    url: '/services/cv-pro',
  }),
  jobAssist: buildMetadata({
    title: 'JobAssist — Assistance Candidature Emploi en Côte d\'Ivoire',
    description: 'Veille des offres d\'emploi, rédaction de candidature complète et préparation aux entretiens. Secteurs mines, ONG, banque, télécoms. À partir de 30 000 FCFA.',
    keywords: SEO_KEYWORDS.job,
    url: '/services/job-assist',
  }),
  tarifs: buildMetadata({
    title: 'Tarifs — CV, Emploi & Appels d\'offres',
    description: 'Tous les tarifs CVPro225 en Francs CFA (FCFA). CV Pro à partir de 15 000 FCFA, JobAssist à partir de 30 000 FCFA.',
    keywords: ['tarifs services professionnels Côte d\'Ivoire', 'prix CV professionnel Côte d\'Ivoire', 'prix candidature emploi Côte d\'Ivoire'],
    url: '/tarifs',
  }),
  blog: buildMetadata({
    title: 'Blog — Conseils CV, Emploi & Appels d\'Offres',
    description: 'Guides pratiques et conseils professionnels pour les Ivoiriens : comment créer un CV ATS, trouver un emploi à Abidjan, répondre à un appel d\'offres.',
    keywords: SEO_KEYWORDS.blog,
    url: '/blog',
  }),
  aPropos: buildMetadata({
    title: 'À propos — Notre mission en Côte d\'Ivoire',
    description: 'CVPro225, votre partenaire professionnel basé à Abidjan. Notre mission : rendre accessibles des services professionnels de qualité à tous les Ivoiriens.',
    url: '/a-propos',
  }),
  contact: buildMetadata({
    title: 'Contact — WhatsApp, Email, Abidjan',
    description: 'Contactez CVPro225 par WhatsApp ou email. Réponse sous 30 minutes en heures ouvrables. Basés à Abidjan, Côte d\'Ivoire.',
    url: '/contact',
  }),
}

export function buildArticleMetadata(article: {
  seo_titre?: string
  titre: string
  seo_description?: string
  extrait?: string
  slug: string
  image?: string
  auteur?: string
  date_publication?: string
  updatedAt?: string
}): Metadata {
  return buildMetadata({
    title: article.seo_titre || article.titre,
    description: article.seo_description || article.extrait || '',
    keywords: SEO_KEYWORDS.blog,
    image: article.image,
    url: `/blog/${article.slug}`,
    type: 'article',
    publishedAt: article.date_publication,
    updatedAt: article.updatedAt,
    author: article.auteur,
  })
}
