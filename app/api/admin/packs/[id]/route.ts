import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || (session.user as Record<string, unknown>).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { nom, prix, delai, recommande, badge, actif, features } = await request.json()

  const pack = await prisma.pack.update({
    where: { id: params.id },
    data: {
      ...(nom !== undefined && { nom }),
      ...(prix !== undefined && { prix }),
      ...(delai !== undefined && { delai }),
      ...(recommande !== undefined && { recommande }),
      ...(badge !== undefined && { badge }),
      ...(actif !== undefined && { actif }),
    },
  })

  if (features && Array.isArray(features)) {
    await prisma.packFeature.deleteMany({ where: { packId: params.id } })
    await prisma.packFeature.createMany({
      data: features.map((f: { label: string; inclus: boolean; ordre: number }, i: number) => ({
        packId: params.id,
        label: f.label,
        inclus: f.inclus,
        ordre: f.ordre ?? i,
      })),
    })
  }

  const updated = await prisma.pack.findUnique({
    where: { id: params.id },
    include: { features: { orderBy: { ordre: 'asc' } } },
  })

  return NextResponse.json({ success: true, data: updated })
}
