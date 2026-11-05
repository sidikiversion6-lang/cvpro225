import type {
  StrapiResponse,
  StrapiData,
  Article,
  Temoignage,
  OffreEmploi,
  AppelOffres,
  ServiceGP,
  FAQ,
} from '@/types/strapi'

/* ==========================================================================
   Configuration
   ========================================================================== */

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'http://localhost:1337'

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || ''

/* ==========================================================================
   ISR — durées de revalidation
   ========================================================================== */

const REVALIDATE_BLOG    = 3600  // 1 h
const REVALIDATE_OFFRES  = 1800  // 30 min
const REVALIDATE_DEFAULT = 3600

/* ==========================================================================
   fetchStrapi — requête de base
   ========================================================================== */

interface FetchStrapiOptions {
  revalidate?: number
  params?: Record<string, string | number | boolean>
  cache?: RequestCache
}

async function fetchStrapi<T>(
  endpoint: string,
  options: FetchStrapiOptions = {}
): Promise<T> {
  const { revalidate = REVALIDATE_DEFAULT, params, cache } = options

  const url = new URL(`/api${endpoint}`, STRAPI_URL)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value))
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    headers,
  }

  if (cache) {
    fetchOptions.cache = cache
  } else {
    fetchOptions.next = { revalidate }
  }

  const res = await fetch(url.toString(), fetchOptions)

  if (!res.ok) {
    throw new Error(
      `Strapi API error: ${res.status} ${res.statusText} — ${endpoint}`
    )
  }

  return res.json()
}

/* ==========================================================================
   Helpers
   ========================================================================== */

function flattenStrapiData<T>(entry: StrapiData<T>): T & { id: number } {
  return { id: entry.id, ...entry.attributes }
}

function flattenStrapiList<T>(data: StrapiData<T>[]): (T & { id: number })[] {
  return data.map(flattenStrapiData)
}

/* ==========================================================================
   Articles (Blog)
   ========================================================================== */

export async function getArticles(
  page = 1,
  pageSize = 12
): Promise<StrapiResponse<Article>> {
  return fetchStrapi<StrapiResponse<Article>>('/articles', {
    revalidate: REVALIDATE_BLOG,
    params: {
      'sort[0]': 'date_publication:desc',
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'populate': '*',
    },
  })
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await fetchStrapi<StrapiResponse<Article>>('/articles', {
    revalidate: REVALIDATE_BLOG,
    params: {
      'filters[slug][$eq]': slug,
      'populate': '*',
    },
  })

  if (!res.data.length) return null
  return flattenStrapiData(res.data[0])
}

export async function getArticlesByCategorie(
  categorie: string
): Promise<Article[]> {
  const res = await fetchStrapi<StrapiResponse<Article>>('/articles', {
    revalidate: REVALIDATE_BLOG,
    params: {
      'filters[categorie][$eq]': categorie,
      'sort[0]': 'date_publication:desc',
      'populate': '*',
    },
  })

  return flattenStrapiList(res.data)
}

/* ==========================================================================
   Témoignages
   ========================================================================== */

export async function getTemoignages(service?: string): Promise<Temoignage[]> {
  const params: Record<string, string | number> = {
    'sort[0]': 'note:desc',
    'populate': '*',
  }

  if (service) {
    params['filters[service][$eq]'] = service
  }

  const res = await fetchStrapi<StrapiResponse<Temoignage>>('/temoignages', {
    revalidate: REVALIDATE_DEFAULT,
    params,
  })

  return flattenStrapiList(res.data)
}

/* ==========================================================================
   Offres d'emploi
   ========================================================================== */

export async function getOffresEmploi(
  secteur?: string,
  limit = 25
): Promise<OffreEmploi[]> {
  const params: Record<string, string | number | boolean> = {
    'filters[actif][$eq]': true,
    'sort[0]': 'date_limite:asc',
    'pagination[pageSize]': limit,
    'populate': '*',
  }

  if (secteur) {
    params['filters[secteur][$eq]'] = secteur
  }

  const res = await fetchStrapi<StrapiResponse<OffreEmploi>>('/offres-emploi', {
    revalidate: REVALIDATE_OFFRES,
    params,
  })

  return flattenStrapiList(res.data)
}

/* ==========================================================================
   Appels d'offres
   ========================================================================== */

export async function getAppelsOffres(
  secteur?: string,
  limit = 25
): Promise<AppelOffres[]> {
  const params: Record<string, string | number | boolean> = {
    'filters[actif][$eq]': true,
    'sort[0]': 'date_limite:asc',
    'pagination[pageSize]': limit,
    'populate': '*',
  }

  if (secteur) {
    params['filters[secteur][$eq]'] = secteur
  }

  const res = await fetchStrapi<StrapiResponse<AppelOffres>>('/appels-offres', {
    revalidate: REVALIDATE_OFFRES,
    params,
  })

  return flattenStrapiList(res.data)
}

/* ==========================================================================
   Services
   ========================================================================== */

export async function getServices(): Promise<ServiceGP[]> {
  const res = await fetchStrapi<StrapiResponse<ServiceGP>>('/services', {
    revalidate: REVALIDATE_DEFAULT,
    params: {
      'populate[packs][populate]': '*',
      'populate[0]': 'packs',
    },
  })

  return flattenStrapiList(res.data)
}

export async function getServiceBySlug(
  slug: string
): Promise<ServiceGP | null> {
  const res = await fetchStrapi<StrapiResponse<ServiceGP>>('/services', {
    revalidate: REVALIDATE_DEFAULT,
    params: {
      'filters[slug][$eq]': slug,
      'populate[packs][populate]': '*',
      'populate[0]': 'packs',
    },
  })

  if (!res.data.length) return null
  return flattenStrapiData(res.data[0])
}

/* ==========================================================================
   FAQ
   ========================================================================== */

export async function getFAQ(service?: string): Promise<FAQ[]> {
  const params: Record<string, string | number> = {
    'sort[0]': 'ordre:asc',
  }

  if (service) {
    params['filters[service][$eq]'] = service
  }

  const res = await fetchStrapi<StrapiResponse<FAQ>>('/faqs', {
    revalidate: REVALIDATE_DEFAULT,
    params,
  })

  return flattenStrapiList(res.data)
}
