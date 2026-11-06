import { computeMontant, getOffre, type MontantDetail } from '@/lib/offres'
import { generateRef } from '@/lib/commande-config'
import type { CommandeEmail, AdminExtra } from '@/lib/resend'
import type { PaydunyaCreateInvoiceParams } from '@/lib/paydunya'

/**
 * Création d'une commande — logique commune à /api/order (formulaire du site)
 * et /api/commandes (API JSON).
 *
 * SÉCURITÉ : le montant est TOUJOURS calculé ici, côté serveur, à partir de
 * lib/offres.ts (offre + option Express + date de lancement). Aucun montant ni
 * libellé venant du navigateur n'est lu. Le montant et son détail sont figés
 * en base : la facture PayDunya et la vérification de l'IPN s'appuient dessus.
 *
 * Parcours court : nom complet + WhatsApp obligatoires, email OPTIONNEL
 * (sans email : aucun email client), CV optionnel (a_un_cv).
 */

export interface CvFichier {
  filename: string
  content: Buffer
}

export interface NouvelleCommande {
  offre: string
  express: boolean
  nomComplet: string
  /** Saisie brute ; normalisée au format international 225XXXXXXXXXX. */
  telephone: string
  email?: string | null
  aUnCv: boolean
  cv?: CvFichier | null
  ville?: string
  message?: string
  userId?: string | null
  /** Données de brief éventuelles (API) : stockées dans details. */
  brief?: Record<string, string>
}

export type ResultatCommande =
  | { ok: true; ref: string; montant: number; detail: MontantDetail; payment: 'paydunya'; checkoutUrl: string }
  | { ok: true; ref: string; montant: number; detail: MontantDetail; payment: 'whatsapp'; reason: 'not_configured' | 'paydunya_error' }

interface CommandeRow {
  id: string
  ref: string
  service: string
  pack: string
  montant: number
  nom: string
  prenom: string
  email: string | null
  telephone: string
  ville: string | null
  message: string | null
  details: unknown
  a_un_cv: boolean | null
}

export interface CommandeDeps {
  now: () => Date
  createCommande: (data: {
    ref: string; service: string; pack: string; nom: string; prenom: string; email: string | null
    telephone: string; ville: string; statut: 'pending'; mode_paiement: string; montant: number
    details: Record<string, unknown>; message: string; userId: string | null
    a_un_cv: boolean; cv_fichier: string | null
  }) => Promise<CommandeRow>
  setPaydunyaToken: (id: string, token: string) => Promise<void>
  storeCv: (ref: string, file: CvFichier) => Promise<string>
  paydunyaConfigured: () => boolean
  createInvoice: (p: PaydunyaCreateInvoiceParams) => Promise<{ invoice_token: string; checkout_url: string }>
  buildParams: (c: CommandeRow) => PaydunyaCreateInvoiceParams
  sendAdmin: (c: CommandeEmail, extra: AdminExtra) => Promise<unknown>
  sendClient: (c: CommandeEmail & { email: string }, opts: { paymentUrl?: string }) => Promise<unknown>
  log: (msg: string, err?: unknown) => void
}

export class CommandeInvalide extends Error {}

const BRIEF_LABELS: Record<string, string> = {
  cv_filename: 'Fichier CV',
  secteur: 'Secteur',
  poste: 'Poste recherché',
  experience: 'Expérience',
  formation: 'Formation',
  notes: 'Notes',
}

// ---------------------------------------------------------------------------
// Validation / normalisation des champs client
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Numéro ivoirien : 10 chiffres (espaces, points, tirets acceptés à la saisie),
 * avec ou sans indicatif +225 / 00225. Renvoie 225XXXXXXXXXX, ou null si invalide.
 */
export function normaliserTelephoneCI(raw: string | null | undefined): string | null {
  let d = String(raw ?? '').replace(/\D/g, '')
  if (d.startsWith('00225')) d = d.slice(5)
  else if (d.startsWith('225') && d.length === 13) d = d.slice(3)
  return /^\d{10}$/.test(d) ? `225${d}` : null
}

/** « Konan Kouassi » -> prénom « Konan », nom « Kouassi » (colonnes existantes conservées). */
export function decouperNomComplet(nomComplet: string): { prenom: string; nom: string } {
  const parts = nomComplet.trim().split(/\s+/)
  return { prenom: parts[0] || '', nom: parts.slice(1).join(' ') }
}

export function validerClient(f: { nomComplet?: string; telephone?: string; email?: string | null }): string | null {
  const nom = (f.nomComplet || '').trim()
  if (nom.length < 2 || nom.length > 100) return 'Nom complet manquant.'
  if (!normaliserTelephoneCI(f.telephone)) return 'Numéro WhatsApp invalide : 10 chiffres attendus (ex. 07 00 00 00 00).'
  const email = (f.email || '').trim()
  if (email && (!EMAIL_RE.test(email) || email.length > 200)) return 'Email invalide.'
  return null
}

export function clip(v: unknown, max = 2000): string {
  return String(v ?? '').trim().slice(0, max)
}

// ---------------------------------------------------------------------------
// Création
// ---------------------------------------------------------------------------

export async function creerCommande(input: NouvelleCommande, deps: CommandeDeps): Promise<ResultatCommande> {
  const offre = getOffre(input.offre)
  if (!offre) throw new CommandeInvalide('Offre inconnue')
  const invalid = validerClient(input)
  if (invalid) throw new CommandeInvalide(invalid)

  const telephone = normaliserTelephoneCI(input.telephone)!
  const email = (input.email || '').trim().toLowerCase() || null
  const { prenom, nom } = decouperNomComplet(input.nomComplet)
  const aUnCv = input.aUnCv === true
  const detail = computeMontant(offre.id, input.express === true, deps.now())
  const ref = generateRef()
  const brief: Record<string, string> = { ...(input.brief || {}) }

  // CV : stocké (bucket privé) ; en cas d'échec, il reste joint à l'email admin.
  let cvFichier: string | null = null
  if (aUnCv && input.cv) {
    brief.cv_filename = input.cv.filename
    try {
      cvFichier = await deps.storeCv(ref, input.cv)
    } catch (err) {
      deps.log(`[commande] CV non stocké pour ${ref} (reste en pièce jointe admin)`, err)
    }
  }

  const row = await deps.createCommande({
    ref,
    service: offre.service,
    pack: offre.id,
    nom,
    prenom,
    email,
    telephone,
    ville: input.ville || '',
    statut: 'pending',
    mode_paiement: 'paydunya',
    montant: detail.montant,
    details: {
      ...brief,
      nom_complet: input.nomComplet.trim(),
      offre: detail.offre,
      offre_nom: detail.offreNom,
      express: detail.express,
      prix_offre: detail.prixOffre,
      prix_express: detail.prixExpress,
      tarif: detail.tarif,
      delai: detail.delai,
    },
    message: input.message || '',
    userId: input.userId ?? null,
    a_un_cv: aUnCv,
    cv_fichier: cvFichier,
  })

  let checkoutUrl: string | undefined
  let reason: 'not_configured' | 'paydunya_error' = 'not_configured'
  if (deps.paydunyaConfigured()) {
    try {
      const invoice = await deps.createInvoice(deps.buildParams(row))
      await deps.setPaydunyaToken(row.id, invoice.invoice_token)
      checkoutUrl = invoice.checkout_url
    } catch (err) {
      reason = 'paydunya_error'
      deps.log(`[commande] PayDunya indisponible pour ${row.ref}, repli WhatsApp`, err)
    }
  }

  const emailData: CommandeEmail = {
    ref: row.ref, service: row.service, pack: row.pack, prenom: row.prenom, nom: row.nom,
    email: row.email, telephone: row.telephone, ville: row.ville, montant: row.montant,
    message: row.message, details: row.details, aUnCv: row.a_un_cv,
  }
  const sends: Array<[string, Promise<unknown>]> = [
    ['admin', deps.sendAdmin(emailData, {
      brief: Object.entries(brief).map(([k, v]) => [BRIEF_LABELS[k] || k, v] as [string, string]),
      attachments: input.cv ? [{ filename: input.cv.filename, content: input.cv.content }] : undefined,
      paymentUrl: checkoutUrl,
    })],
  ]
  // Pas d'email client : aucun email (jamais d'adresse inventée).
  if (row.email) sends.push(['client', deps.sendClient({ ...emailData, email: row.email }, { paymentUrl: checkoutUrl })])

  const results = await Promise.allSettled(sends.map(([, p]) => p))
  results.forEach((r, i) => {
    const who = sends[i][0]
    if (r.status === 'rejected') deps.log(`[commande] email ${who} non envoyé pour ${row.ref}`, r.reason)
    else if (r.value && typeof r.value === 'object' && 'error' in r.value && (r.value as { error: unknown }).error)
      deps.log(`[commande] email ${who} refusé par Resend pour ${row.ref}`, (r.value as { error: unknown }).error)
  })

  return checkoutUrl
    ? { ok: true, ref: row.ref, montant: row.montant, detail, payment: 'paydunya', checkoutUrl }
    : { ok: true, ref: row.ref, montant: row.montant, detail, payment: 'whatsapp', reason }
}

/** Dépendances réelles (Prisma, Storage, PayDunya, Resend). Import paresseux. */
export async function defaultDeps(): Promise<CommandeDeps> {
  const [{ prisma }, pd, mail, storage] = await Promise.all([
    import('@/lib/prisma'),
    import('@/lib/paydunya'),
    import('@/lib/resend'),
    import('@/lib/cv-storage'),
  ])
  return {
    now: () => new Date(),
    createCommande: (data) => prisma.commande.create({ data: { ...data, details: data.details as object } }),
    setPaydunyaToken: async (id, token) => {
      await prisma.commande.update({ where: { id }, data: { paydunya_token: token, paydunya_status: 'pending' } })
    },
    storeCv: storage.storeCv,
    paydunyaConfigured: pd.isPaydunyaConfigured,
    createInvoice: pd.createPaydunyaInvoice,
    buildParams: pd.buildPaydunyaParams,
    sendAdmin: (c, extra) => mail.sendAdminNotification(c, 'nouvelle', extra),
    sendClient: mail.sendOrderReceivedEmail,
    log: (msg, err) => console.error(msg, err ?? ''),
  }
}
