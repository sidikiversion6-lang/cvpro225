import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const profileSchema = z.object({
  prenom: z.string().min(2).optional(),
  nom: z.string().min(2).optional(),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
})

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const data = parsed.data

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 })
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id as string } })
      if (!user?.password) {
        return NextResponse.json({ error: 'Impossible de changer le mot de passe' }, { status: 400 })
      }

      const valid = await bcrypt.compare(data.currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 403 })
      }

      const hashed = await bcrypt.hash(data.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id as string },
        data: { password: hashed },
      })

      return NextResponse.json({ success: true, message: 'Mot de passe mis à jour' })
    }

    const updateData: Record<string, string> = {}
    if (data.prenom) updateData.prenom = data.prenom
    if (data.nom) updateData.nom = data.nom
    if (data.telephone !== undefined) updateData.telephone = data.telephone
    if (data.ville !== undefined) updateData.ville = data.ville

    await prisma.user.update({
      where: { id: session.user.id as string },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API profil] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
