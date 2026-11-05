import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkPaydunyaStatus } from '@/lib/paydunya'
import { sendConfirmationEmail, sendAdminNotification } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const invoiceToken = body?.data?.invoice?.token || body?.invoice?.token
    if (!invoiceToken) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    const status = await checkPaydunyaStatus(invoiceToken)

    const commande = await prisma.commande.findFirst({
      where: { paydunya_token: invoiceToken },
    })

    if (!commande) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    if (status.status === 'completed') {
      await prisma.commande.update({
        where: { id: commande.id },
        data: {
          statut: 'confirmed',
          paydunya_status: 'completed',
          paid_at: new Date(),
        },
      })

      const emailData = {
        ref: commande.ref,
        service: commande.service,
        pack: commande.pack,
        prenom: commande.prenom,
        nom: commande.nom,
        email: commande.email,
        telephone: commande.telephone,
        ville: commande.ville || '',
        montant: commande.montant,
        message: commande.message || '',
      }

      Promise.allSettled([
        sendConfirmationEmail(emailData),
        sendAdminNotification(emailData),
      ]).catch(() => {})

      console.log(`[PayDunya] Paiement confirmé: ${commande.ref}`)
    }

    if (status.status === 'cancelled' || status.status === 'failed') {
      await prisma.commande.update({
        where: { id: commande.id },
        data: {
          statut: 'cancelled',
          paydunya_status: status.status,
        },
      })

      console.log(`[PayDunya] Paiement ${status.status}: ${commande.ref}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook PayDunya] Erreur:', error)
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 500 })
  }
}
