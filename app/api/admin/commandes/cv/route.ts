import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { signedCvUrl } from '@/lib/cv-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Téléchargement du CV d'une commande (admin uniquement) : redirige vers une URL signée de 15 min. */
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as Record<string, unknown>).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  const c = await prisma.commande.findUnique({ where: { id }, select: { cv_fichier: true } })
  if (!c?.cv_fichier) return NextResponse.json({ error: 'Aucun CV stocké pour cette commande' }, { status: 404 })
  try {
    return NextResponse.redirect(await signedCvUrl(c.cv_fichier))
  } catch (err) {
    console.error('[admin] URL signée CV indisponible', err)
    return NextResponse.json({ error: 'CV indisponible' }, { status: 502 })
  }
}
