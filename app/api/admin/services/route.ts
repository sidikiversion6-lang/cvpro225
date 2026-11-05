import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as Record<string, unknown>).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const data = await prisma.serviceConfig.findMany({
    include: {
      packs: {
        orderBy: { ordre: 'asc' },
        include: { features: { orderBy: { ordre: 'asc' } } },
      },
    },
    orderBy: { slug: 'asc' },
  })

  return NextResponse.json({ data })
}
