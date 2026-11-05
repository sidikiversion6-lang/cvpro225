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
  const data = await prisma.notification.findMany({ orderBy: { created_at: 'desc' }, take: 50 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await request.json()
  if (id) {
    await prisma.notification.update({ where: { id }, data: { lu: true } })
  } else {
    await prisma.notification.updateMany({ where: { lu: false }, data: { lu: true } })
  }
  return NextResponse.json({ success: true })
}
