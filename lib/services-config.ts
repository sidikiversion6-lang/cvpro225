import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export const getServicesConfig = cache(async () => {
  return prisma.serviceConfig.findMany({
    where: { actif: true },
    include: {
      packs: {
        where: { actif: true },
        orderBy: { ordre: 'asc' },
        include: { features: { orderBy: { ordre: 'asc' } } },
      },
    },
    orderBy: { slug: 'asc' },
  })
})

export const getServiceConfig = cache(async (slug: string) => {
  return prisma.serviceConfig.findUnique({
    where: { slug },
    include: {
      packs: {
        where: { actif: true },
        orderBy: { ordre: 'asc' },
        include: { features: { orderBy: { ordre: 'asc' } } },
      },
    },
  })
})

export const getSiteConfig = cache(async (cle: string) => {
  const config = await prisma.siteConfig.findUnique({ where: { cle } })
  return config?.valeur || null
})

export const getSiteConfigs = cache(async (groupe?: string) => {
  return prisma.siteConfig.findMany({
    where: groupe ? { groupe } : undefined,
  })
})
