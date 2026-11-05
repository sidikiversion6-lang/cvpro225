import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commandeId = searchParams.get('commandeId')
    const type = searchParams.get('type')

    if (type === 'conversations') {
      const commandes = await prisma.commande.findMany({
        where: { userId: session.user.id as string },
        include: {
          messages: { orderBy: { created_at: 'desc' }, take: 1 },
          _count: { select: { messages: { where: { auteur: 'admin', lu: false } } } },
        },
        orderBy: { updated_at: 'desc' },
      })

      const conversations = commandes
        .filter((c) => c.messages.length > 0)
        .map((c) => ({
          commandeId: c.id,
          ref: c.ref,
          service: c.service,
          lastMessage: c.messages[0]?.contenu || '',
          lastDate: c.messages[0]?.created_at?.toISOString() || '',
          unread: c._count.messages,
        }))

      return NextResponse.json({ data: conversations })
    }

    if (commandeId) {
      const commande = await prisma.commande.findFirst({
        where: { id: commandeId, userId: session.user.id as string },
      })
      if (!commande) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
      }

      const messages = await prisma.message.findMany({
        where: { commandeId },
        orderBy: { created_at: 'asc' },
      })

      return NextResponse.json({ data: messages })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { commandeId, contenu } = await request.json()
    if (!commandeId || !contenu?.trim()) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const commande = await prisma.commande.findFirst({
      where: { id: commandeId, userId: session.user.id as string },
    })
    if (!commande) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const message = await prisma.message.create({
      data: { commandeId, auteur: 'client', contenu: contenu.trim() },
    })

    return NextResponse.json({ success: true, data: message })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commandeId = searchParams.get('commandeId')
    if (!commandeId) {
      return NextResponse.json({ error: 'commandeId requis' }, { status: 400 })
    }

    await prisma.message.updateMany({
      where: { commandeId, auteur: 'admin', lu: false },
      data: { lu: true },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
