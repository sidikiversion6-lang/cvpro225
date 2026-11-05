import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as Record<string, unknown>).role !== 'admin') return null
  return session
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const data = await prisma.siteConfig.findMany({ orderBy: { groupe: 'asc' } })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { cle, valeur } = await request.json()
  if (!cle) return NextResponse.json({ error: 'Clé requise' }, { status: 400 })
  const config = await prisma.siteConfig.update({ where: { cle }, data: { valeur } })
  return NextResponse.json({ success: true, data: config })
}
