import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  buildPaydunyaParams,
  createPaydunyaInvoice,
  isPaydunyaConfigured,
  paymentUnavailableBody,
} from '@/lib/paydunya'

const schema = z.object({
  commande_id: z.string().min(1, 'ID commande requis'),
})

export async function POST(request: Request) {
  if (!isPaydunyaConfigured()) {
    return NextResponse.json(paymentUnavailableBody(), { status: 503 })
  }
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { commande_id } = parsed.data

    const commande = await prisma.commande.findUnique({
      where: { id: commande_id },
    })

    if (!commande) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    if (commande.statut !== 'pending') {
      return NextResponse.json(
        { error: 'Cette commande ne peut plus être payée' },
        { status: 409 }
      )
    }

    const params = buildPaydunyaParams(commande)
    const result = await createPaydunyaInvoice(params)

    await prisma.commande.update({
      where: { id: commande_id },
      data: {
        paydunya_token: result.invoice_token,
        paydunya_status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      payment_url: result.checkout_url,
    })
  } catch (error) {
    console.error('[API /paiement] Erreur:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'initiation du paiement" },
      { status: 500 }
    )
  }
}
