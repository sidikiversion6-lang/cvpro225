import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { OFFRES } from '@/lib/offres'
import { PAYMENT_UNAVAILABLE_MESSAGE } from '@/lib/paydunya'
import {
  creerCommande,
  defaultDeps,
  validerClient,
  CommandeInvalide,
} from '@/lib/commandes'

/**
 * API JSON de création de commande (même logique que /api/order).
 * Seules les offres de lib/offres.ts sont acceptées ; le montant est calculé
 * côté serveur. Un champ "montant" éventuel est ignoré (non lu par le schéma).
 */
const schema = z.object({
  offre: z.enum(OFFRES.map((o) => o.id) as [string, ...string[]]),
  express: z.boolean().optional().default(false),
  nom_complet: z.string().trim().min(2).max(100),
  telephone: z.string().trim().min(8).max(30),
  email: z.string().trim().toLowerCase().email().max(200).optional().nullable(),
  a_un_cv: z.boolean().optional().default(false),
  ville: z.string().trim().max(100).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalide' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }
  const data = parsed.data
  const client = { nomComplet: data.nom_complet, telephone: data.telephone, email: data.email ?? null }
  const invalid = validerClient(client)
  if (invalid) return NextResponse.json({ success: false, error: invalid }, { status: 400 })

  try {
    const session = await auth()
    const result = await creerCommande(
      {
        offre: data.offre, express: data.express, ...client, aUnCv: data.a_un_cv,
        ville: data.ville, message: data.message, userId: (session?.user?.id as string) || null,
      },
      await defaultDeps(),
    )
    return NextResponse.json(
      result.payment === 'paydunya'
        ? { success: true, ref: result.ref, montant: result.montant, requires_payment: true, checkout_url: result.checkoutUrl }
        : { success: true, ref: result.ref, montant: result.montant, requires_payment: false, payment: 'whatsapp', message: PAYMENT_UNAVAILABLE_MESSAGE },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof CommandeInvalide) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    console.error('[API /commandes] Erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création de la commande' }, { status: 500 })
  }
}

/** Commandes de l'utilisateur CONNECTÉ uniquement (plus de lecture par email arbitraire). */
export async function GET() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  try {
    const commandes = await prisma.commande.findMany({
      where: { email: email.toLowerCase() },
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json({ data: commandes })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
