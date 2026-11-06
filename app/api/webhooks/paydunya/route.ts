import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkPaydunyaStatus, isPaydunyaConfigured } from '@/lib/paydunya'
import { handlePaydunyaIpn, type IpnStatus } from '@/lib/paydunya-ipn'
import { sendPaymentReceiptEmail, sendAdminNotification } from '@/lib/resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // PayDunya non configuré : aucun IPN ne peut être authentique (pas de MASTER_KEY).
  if (!isPaydunyaConfigured()) {
    return NextResponse.json({ received: false, outcome: 'paydunya_not_configured' }, { status: 503 })
  }
  try {
    const raw = await request.text()

    const result = await handlePaydunyaIpn(raw, request.headers.get('content-type'), {
      masterKey: process.env.PAYDUNYA_MASTER_KEY || '',
      confirmInvoice: checkPaydunyaStatus,

      findCommandeByToken: (token) =>
        prisma.commande.findUnique({
          where: { paydunya_token: token },
          select: { id: true, ref: true, montant: true, paid_at: true },
        }),

      // Transition atomique : seule la première notification "completed" passe.
      markPaidIfUnpaid: async (id) => {
        const { count } = await prisma.commande.updateMany({
          where: { id, paid_at: null },
          data: { statut: 'confirmed', paydunya_status: 'completed', paid_at: new Date() },
        })
        return count === 1
      },

      markCancelledIfUnpaid: async (id, status: IpnStatus) => {
        const { count } = await prisma.commande.updateMany({
          where: { id, paid_at: null, statut: { not: 'cancelled' } },
          data: { statut: 'cancelled', paydunya_status: status },
        })
        return count === 1
      },

      // Reçu client + notification admin, avec le montant VÉRIFIÉ (= commandes.montant,
      // égal au montant confirmé par l'API PayDunya, sinon on ne serait pas ici).
      sendPaidEmails: async (id) => {
        const c = await prisma.commande.findUniqueOrThrow({ where: { id } })
        const emailData = {
          ref: c.ref,
          service: c.service,
          pack: c.pack,
          prenom: c.prenom,
          nom: c.nom,
          email: c.email,
          telephone: c.telephone,
          ville: c.ville || '',
          montant: c.montant,
          message: c.message || '',
          details: c.details,
          aUnCv: c.a_un_cv,
        }
        const tasks: Promise<unknown>[] = [sendAdminNotification(emailData, 'payee')]
        // Reçu client seulement si un email a été fourni (optionnel).
        if (c.email) tasks.push(sendPaymentReceiptEmail({ ...emailData, email: c.email }, { paidAt: c.paid_at ?? new Date() }))
        // Back-office : client payé sans CV -> à contacter sur WhatsApp.
        if (c.a_un_cv === false) {
          tasks.push(prisma.notification.create({
            data: {
              type: 'a_contacter',
              titre: `⚠️ Pas de CV — à contacter sur WhatsApp (${c.ref})`,
              message: `${[c.prenom, c.nom].filter(Boolean).join(' ')} a payé ${c.montant} FCFA sans fournir de CV : recueillir ses informations sur WhatsApp (+${c.telephone}).`,
              lien: '/admin/commandes?filtre=a-contacter',
            },
          }))
        }
        await Promise.allSettled(tasks)
      },

      log: (msg) => console.log(msg),
    })

    return NextResponse.json(result.body, { status: result.httpStatus })
  } catch (error) {
    // Erreur transitoire (API PayDunya, base) : 500 pour permettre un renvoi de l'IPN.
    console.error('[Webhook PayDunya] Erreur:', error)
    return NextResponse.json({ received: false, outcome: 'error' }, { status: 500 })
  }
}
