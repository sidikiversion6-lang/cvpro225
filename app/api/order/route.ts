import { NextRequest, NextResponse } from 'next/server'
import { creerCommande, defaultDeps, validerClient, clip, CommandeInvalide } from '@/lib/commandes'
import { getOffre } from '@/lib/offres'
import { PAYMENT_UNAVAILABLE_MESSAGE } from '@/lib/paydunya'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_CV_BYTES = 5 * 1024 * 1024
const CV_TYPES = /\.(pdf|docx)$/i

/**
 * Commande depuis le formulaire /commander (FormData).
 *
 * Champs : offre, express, nomComplet, whatsappNumber, email (optionnel),
 * hasCV ('true' | 'false'), cv (si hasCV). Champs de brief optionnels
 * (sector, jobTitle, experienceYears, education, briefNote) : acceptés si
 * envoyés, plus demandés par le formulaire.
 * Tout montant / nom d'offre envoyé par le navigateur est IGNORÉ : le montant
 * est calculé côté serveur (lib/offres.ts).
 */
export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'Requête invalide.' }, { status: 400 })
  }
  const get = (k: string) => clip(formData.get(k), 500)

  const offreId = get('offre')
  if (!getOffre(offreId)) {
    return NextResponse.json({ success: false, error: 'Offre inconnue.' }, { status: 400 })
  }
  const client = {
    nomComplet: get('nomComplet'),
    telephone: get('whatsappNumber'),
    email: get('email') || null,
  }
  const invalid = validerClient(client)
  if (invalid) return NextResponse.json({ success: false, error: invalid }, { status: 400 })

  const aUnCv = formData.get('hasCV') === 'true'
  let cv: { filename: string; content: Buffer } | null = null
  if (aUnCv) {
    const file = formData.get('cv')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: 'CV manquant.' }, { status: 400 })
    }
    if (file.size > MAX_CV_BYTES || !CV_TYPES.test(file.name)) {
      return NextResponse.json({ success: false, error: 'CV : PDF ou DOCX, 5 Mo maximum.' }, { status: 400 })
    }
    cv = {
      filename: file.name.replace(/[^\w.\- ]+/g, '_').slice(0, 120),
      content: Buffer.from(await file.arrayBuffer()),
    }
  }

  // Brief optionnel (n'est plus demandé par le formulaire)
  const brief: Record<string, string> = {}
  for (const [k, f] of [['secteur', 'sector'], ['poste', 'jobTitle'], ['experience', 'experienceYears'], ['formation', 'education'], ['notes', 'briefNote']] as const) {
    const v = clip(formData.get(f), 2000)
    if (v) brief[k] = v
  }

  try {
    const result = await creerCommande(
      { offre: offreId, express: formData.get('express') === 'true', ...client, aUnCv, cv, brief },
      await defaultDeps(),
    )

    console.log(`[order] ${result.ref} — ${result.detail.offreNom}${result.detail.express ? ' + Express' : ''} — ${result.montant} FCFA — CV ${aUnCv ? 'oui' : 'non'} — email ${client.email ? 'oui' : 'non'} — paiement ${result.payment}`)

    return NextResponse.json(
      result.payment === 'paydunya'
        ? { success: true, ref: result.ref, montant: result.montant, payment: 'paydunya', checkout_url: result.checkoutUrl }
        : {
            success: true, ref: result.ref, montant: result.montant, payment: 'whatsapp',
            message: result.reason === 'not_configured'
              ? PAYMENT_UNAVAILABLE_MESSAGE
              : 'Le paiement en ligne est momentanément indisponible. Contactez-nous sur WhatsApp pour finaliser votre commande.',
          },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof CommandeInvalide) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    console.error('[order] Erreur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la commande. Réessayez ou contactez-nous sur WhatsApp.' },
      { status: 500 },
    )
  }
}
