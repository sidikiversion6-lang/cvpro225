import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendDeliveryEmail } from '@/lib/resend'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as Record<string, unknown>).role !== 'admin') return null
  return session
}

const STATUTS = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'] as const

export async function PATCH(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { id, statut } = body as { id?: string; statut?: string }
  const livraison_url = typeof body.livraison_url === 'string' ? body.livraison_url.trim() : undefined
  const livraison_note = typeof body.livraison_note === 'string' ? body.livraison_note.trim().slice(0, 2000) : undefined
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  if (statut && !(STATUTS as readonly string[]).includes(statut)) {
    return NextResponse.json({ error: 'Statut inconnu' }, { status: 400 })
  }
  if (livraison_url && !/^https?:\/\//i.test(livraison_url)) {
    return NextResponse.json({ error: 'Lien de livraison invalide (http:// ou https://)' }, { status: 400 })
  }

  const avant = await prisma.commande.findUnique({ where: { id }, select: { statut: true } })
  if (!avant) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  // Livraison : seulement au PREMIER passage à « completed » (date de livraison =
  // départ des 90 jours de conservation du CV ; email et notification envoyés une fois).
  const livreeMaintenant = statut === 'completed' && avant.statut !== 'completed'

  const data: Record<string, unknown> = {}
  if (statut) data.statut = statut
  if (livraison_url !== undefined) data.livraison_url = livraison_url || null
  if (livraison_note !== undefined) data.livraison_note = livraison_note || null
  if (livreeMaintenant) data.delivered_at = new Date()

  const commande = await prisma.commande.update({ where: { id }, data })

  if (livreeMaintenant) {
    await prisma.notification.create({
      data: { type: 'commande', titre: `Commande ${commande.ref} livrée`, message: `La commande ${commande.ref} a été marquée comme livrée.`, lien: `/admin/commandes/${id}` },
    })

    if (commande.email) sendDeliveryEmail({
      ref: commande.ref, service: commande.service, pack: commande.pack,
      prenom: commande.prenom, nom: commande.nom, email: commande.email,
      telephone: commande.telephone, ville: commande.ville || '', montant: commande.montant,
      details: commande.details, livraison_url: commande.livraison_url, livraison_note: commande.livraison_note,
    }).catch((e) => console.error('[admin] email livraison non envoyé', e))
  }

  return NextResponse.json({ success: true, data: commande })
}
