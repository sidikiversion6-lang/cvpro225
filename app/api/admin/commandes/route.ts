import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendConfirmationEmail } from '@/lib/resend'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as Record<string, unknown>).role !== 'admin') return null
  return session
}

export async function PATCH(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id, statut, livraison_url, livraison_note } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (statut) data.statut = statut
  if (livraison_url) data.livraison_url = livraison_url
  if (livraison_note) data.livraison_note = livraison_note
  if (statut === 'completed') data.delivered_at = new Date()

  const commande = await prisma.commande.update({ where: { id }, data })

  if (statut === 'completed') {
    await prisma.notification.create({
      data: { type: 'commande', titre: `Commande ${commande.ref} livrée`, message: `La commande ${commande.ref} a été marquée comme livrée.`, lien: `/admin/commandes/${id}` },
    })

    sendConfirmationEmail({
      ref: commande.ref, service: commande.service, pack: commande.pack,
      prenom: commande.prenom, nom: commande.nom, email: commande.email,
      telephone: commande.telephone, ville: commande.ville || '', montant: commande.montant,
    }).catch(() => {})
  }

  return NextResponse.json({ success: true, data: commande })
}
