import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as Record<string, unknown>).role !== 'admin') return null
  return session
}

export async function GET(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const commandeId = searchParams.get('commandeId')

  if (type === 'conversations') {
    const commandes = await prisma.commande.findMany({
      where: { messages: { some: {} } },
      include: {
        messages: { orderBy: { created_at: 'desc' }, take: 1 },
        _count: { select: { messages: { where: { auteur: 'client', lu: false } } } },
      },
      orderBy: { updated_at: 'desc' },
    })

    const data = commandes.map((c) => ({
      commandeId: c.id,
      ref: c.ref,
      service: c.service,
      clientNom: `${c.prenom} ${c.nom}`,
      clientEmail: c.email,
      lastMessage: c.messages[0]?.contenu || '',
      unread: c._count.messages,
    }))

    return NextResponse.json({ data })
  }

  if (commandeId) {
    const data = await prisma.message.findMany({
      where: { commandeId },
      orderBy: { created_at: 'asc' },
    })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
}

export async function POST(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { commandeId, contenu } = await request.json()
  if (!commandeId || !contenu?.trim()) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: { commandeId, auteur: 'admin', contenu: contenu.trim() },
  })

  return NextResponse.json({ success: true, data: message })
}

export async function PATCH(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const commandeId = searchParams.get('commandeId')
  if (!commandeId) return NextResponse.json({ error: 'commandeId requis' }, { status: 400 })

  await prisma.message.updateMany({
    where: { commandeId, auteur: 'client', lu: false },
    data: { lu: true },
  })

  return NextResponse.json({ success: true })
}
