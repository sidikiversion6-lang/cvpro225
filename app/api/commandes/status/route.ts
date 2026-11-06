import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ref = searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ error: 'Paramètre ref requis' }, { status: 400 })
  }

  const commande = await prisma.commande.findUnique({
    where: { ref },
    select: { ref: true, statut: true, service: true, pack: true, paydunya_status: true, a_un_cv: true, email: true },
  })

  if (!commande) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  // Route publique (par référence) : jamais l'email lui-même, seulement des booléens.
  const { email, ...rest } = commande
  return NextResponse.json({ ...rest, email_fourni: Boolean(email) })
}
