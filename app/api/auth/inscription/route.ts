import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  prenom: z.string().min(2),
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(8),
  password: z.string().min(8).regex(/[A-Z]/, '1 majuscule requise').regex(/[0-9]/, '1 chiffre requis'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Données invalides', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { prenom, nom, email, telephone, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: { prenom, nom, email, telephone, password: hashedPassword },
    })

    await prisma.commande.updateMany({
      where: { email, userId: null },
      data: { userId: newUser.id },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[API inscription] Erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
