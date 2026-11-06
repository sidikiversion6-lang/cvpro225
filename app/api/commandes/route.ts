import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateRef } from '@/lib/commande-config'
import { PRIX_PACKS, LABELS_SERVICE, LABELS_PACK } from '@/types/commande'
import { sendConfirmationEmail, sendAdminNotification, sendEmailVirement } from '@/lib/resend'
import {
  createPaydunyaInvoice,
  buildPaydunyaParams,
  isPaydunyaConfigured,
  paymentUnavailableBody,
} from '@/lib/paydunya'

const ONLINE_PAYMENT_MODES = ['orange_money', 'mtn_momo', 'paydunya']

const schema = z.object({
  service: z.enum(['cv', 'visa', 'job', 'tender']),
  pack: z.string().min(1),
  nom: z.string().min(2),
  prenom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(8),
  ville: z.string().optional().default(''),
  message: z.string().optional().default(''),
  mode_paiement: z.string().optional(),
  details: z.record(z.string()).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Paiement en ligne demandé mais PayDunya pas configuré : on refuse proprement
    // AVANT de créer la commande (pas de commande "pending" orpheline).
    if (ONLINE_PAYMENT_MODES.includes(data.mode_paiement || '') && !isPaydunyaConfigured()) {
      return NextResponse.json(paymentUnavailableBody(), { status: 503 })
    }

    const session = await auth()
    const ref = generateRef()
    const montant = PRIX_PACKS[data.pack] || 0

    const commande = await prisma.commande.create({
      data: {
        ref,
        service: data.service,
        pack: data.pack,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        ville: data.ville,
        statut: 'pending',
        mode_paiement: data.mode_paiement,
        montant,
        details: data.details || {},
        message: data.message,
        userId: (session?.user?.id as string) || null,
      },
    })

    const emailData = {
      ref: commande.ref,
      service: data.service,
      pack: data.pack,
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      ville: data.ville,
      montant,
      message: data.message,
    }

    // Paiement via PayDunya (Orange Money, MTN MoMo, PayDunya)
    if (ONLINE_PAYMENT_MODES.includes(data.mode_paiement || '')) {
      try {
        const serviceLabel = LABELS_SERVICE[data.service as keyof typeof LABELS_SERVICE] || data.service
        const packLabel = LABELS_PACK[data.pack] || data.pack

        const paydunyaParams = buildPaydunyaParams({
          ref: commande.ref,
          service: serviceLabel,
          pack: packLabel,
          montant,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
        })

        const invoice = await createPaydunyaInvoice(paydunyaParams)

        await prisma.commande.update({
          where: { ref: commande.ref },
          data: {
            paydunya_token: invoice.invoice_token,
            paydunya_status: 'pending',
          },
        })

        return NextResponse.json(
          { success: true, ref: commande.ref, montant, checkout_url: invoice.checkout_url, requires_payment: true },
          { status: 201 }
        )
      } catch (error) {
        console.error('[PayDunya] Erreur:', error)
        // Commande créée mais paiement échoué — on continue sans redirection
        Promise.allSettled([
          sendConfirmationEmail(emailData),
          sendAdminNotification(emailData),
        ]).catch(() => {})

        return NextResponse.json(
          { success: true, ref: commande.ref, montant, requires_payment: false, payment_error: true },
          { status: 201 }
        )
      }
    }

    // Virement bancaire
    if (data.mode_paiement === 'virement') {
      Promise.allSettled([
        sendEmailVirement(emailData),
        sendAdminNotification(emailData),
      ]).catch(() => {})

      return NextResponse.json(
        { success: true, ref: commande.ref, montant, requires_payment: false, virement: true },
        { status: 201 }
      )
    }

    // Pas de mode de paiement spécifié — commande simple
    Promise.allSettled([
      sendConfirmationEmail(emailData),
      sendAdminNotification(emailData),
    ]).catch(() => {})

    return NextResponse.json(
      { success: true, ref: commande.ref, montant },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API /commandes] Erreur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Paramètre email requis' }, { status: 400 })
    }

    const commandes = await prisma.commande.findMany({
      where: { email },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ data: commandes })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
