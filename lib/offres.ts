/**
 * SOURCE DE VÉRITÉ UNIQUE des offres et des prix CVPro225.
 *
 * Utilisée par l'affichage (Tarifs, pages services, commande, SEO, CV Checker)
 * ET par le calcul du montant envoyé au paiement (côté serveur uniquement).
 *
 * Offre de lancement : pilotée par LAUNCH_OFFER_END_DATE="AAAA-MM-JJ" (variable
 * serveur, lue à chaque appel). Date incluse, heure d'Abidjan (UTC+0, sans
 * heure d'été). Le lendemain, les prix normaux s'appliquent partout, sans
 * redéploiement. Variable absente ou invalide = prix normaux.
 *
 * Le montant d'une commande est figé à sa création (commandes.montant) :
 * changer les prix ici n'affecte jamais les commandes existantes.
 */

export type OffreId = 'cv-pro-ats' | 'cv-pro-ats-lettre' | 'jobassist'
export type OffreService = 'cv' | 'job'

export interface Offre {
  id: OffreId
  service: OffreService
  nom: string
  accroche: string
  delai: string
  prixNormal: number
  prixLancement: number
  /** Mise en avant visuelle + badge « Le plus choisi ». */
  plusChoisi: boolean
  features: string[]
}

export const OFFRES: readonly Offre[] = [
  {
    id: 'cv-pro-ats',
    service: 'cv',
    nom: 'CV Pro ATS',
    accroche: 'Un CV optimisé qui passe les filtres ATS',
    delai: '48h',
    prixNormal: 15000,
    prixLancement: 10000,
    plusChoisi: false,
    features: [
      'CV professionnel PDF + DOCX',
      'Optimisation ATS avancée + rapport',
      'Mots-clés adaptés à votre secteur',
      'Retouches incluses',
    ],
  },
  {
    id: 'cv-pro-ats-lettre',
    service: 'cv',
    nom: 'CV Pro ATS + Lettre de motivation',
    accroche: 'Le duo complet pour postuler sereinement',
    delai: '48h',
    prixNormal: 20000,
    prixLancement: 15000,
    plusChoisi: true,
    features: [
      'Tout le CV Pro ATS',
      'Lettre de motivation personnalisée',
      'Adaptée à votre secteur et au poste visé',
      'Retouches incluses',
    ],
  },
  {
    id: 'jobassist',
    service: 'job',
    nom: 'JobAssist',
    accroche: 'L’accompagnement complet jusqu’à l’entretien',
    delai: '72h',
    prixNormal: 35000,
    prixLancement: 25000,
    plusChoisi: false,
    features: [
      'CV Pro ATS',
      'Lettre de motivation personnalisée',
      'Optimisation du profil LinkedIn',
      'Coaching entretien',
    ],
  },
] as const

export const EXPRESS = {
  nom: 'Option Express',
  delai: '24h',
  /** Même prix pendant et après le lancement. */
  prix: 5000,
  description: 'Livraison prioritaire en 24h',
} as const

export const LAUNCH_BADGE = 'Offre de lancement'
export const PLUS_CHOISI_BADGE = 'Le plus choisi'

/**
 * Anciens identifiants de packs (liens, favoris, commandes historiques).
 * Les anciens packs Express séparés deviennent l'offre + l'option Express.
 */
const LEGACY_PACKS: Record<string, { offre: OffreId; express: boolean }> = {
  standard: { offre: 'cv-pro-ats', express: false },
  'cv-express': { offre: 'cv-pro-ats', express: true },
  'pack-3': { offre: 'jobassist', express: false },
  'job-express': { offre: 'jobassist', express: true },
}

export function getOffre(id: string | null | undefined): Offre | undefined {
  return OFFRES.find((o) => o.id === id)
}

/** Résout un identifiant actuel ou ancien. undefined si inconnu. */
export function resolvePack(id: string | null | undefined): { offre: Offre; express: boolean } | undefined {
  if (!id) return undefined
  const direct = getOffre(id)
  if (direct) return { offre: direct, express: false }
  const legacy = LEGACY_PACKS[id]
  return legacy ? { offre: getOffre(legacy.offre)!, express: legacy.express } : undefined
}

// ---------------------------------------------------------------------------
// Offre de lancement
// ---------------------------------------------------------------------------

/** Fin EXCLUSIVE (lendemain 00:00 à Abidjan = UTC) de l'offre, ou null. */
export function getLaunchEnd(raw: string | undefined = process.env.LAUNCH_OFFER_END_DATE): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((raw || '').trim())
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const end = new Date(Date.UTC(y, mo - 1, d + 1))
  // Rejette 2026-02-31 & co (Date.UTC « déborde » silencieusement)
  const check = new Date(Date.UTC(y, mo - 1, d))
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null
  return end
}

export function isLaunchActive(now: Date = new Date(), raw?: string): boolean {
  const end = getLaunchEnd(raw ?? process.env.LAUNCH_OFFER_END_DATE)
  return end !== null && now.getTime() < end.getTime()
}

/** Dernier jour de l'offre, ex. « 31 décembre 2026 », ou null. */
export function launchEndLabel(raw?: string): string | null {
  const end = getLaunchEnd(raw ?? process.env.LAUNCH_OFFER_END_DATE)
  if (!end) return null
  const last = new Date(end.getTime() - 1)
  return last.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// ---------------------------------------------------------------------------
// Prix et montant (le SEUL calcul du montant à payer)
// ---------------------------------------------------------------------------

export function prixOffre(offre: Offre, now: Date = new Date()): number {
  return isLaunchActive(now) ? offre.prixLancement : offre.prixNormal
}

export interface MontantDetail {
  offre: OffreId
  offreNom: string
  express: boolean
  prixOffre: number
  prixExpress: number
  montant: number
  tarif: 'lancement' | 'normal'
  delai: string
}

/**
 * Montant d'une commande, calculé côté serveur. Jamais à partir d'un montant
 * venant du navigateur. Lève une erreur si l'offre est inconnue.
 */
export function computeMontant(offreId: string, express: boolean, now: Date = new Date()): MontantDetail {
  const offre = getOffre(offreId)
  if (!offre) throw new Error(`Offre inconnue : ${offreId}`)
  const launch = isLaunchActive(now)
  const p = launch ? offre.prixLancement : offre.prixNormal
  const e = express ? EXPRESS.prix : 0
  return {
    offre: offre.id,
    offreNom: offre.nom,
    express,
    prixOffre: p,
    prixExpress: e,
    montant: p + e,
    tarif: launch ? 'lancement' : 'normal',
    delai: express ? EXPRESS.delai : offre.delai,
  }
}

/** Vue sérialisable des offres au prix courant, à passer aux composants client. */
export interface OffreAffichee extends Offre {
  prix: number
  /** Prix normal à barrer pendant le lancement, sinon null. */
  prixBarre: number | null
}

export function offresAffichees(now: Date = new Date()): OffreAffichee[] {
  const launch = isLaunchActive(now)
  return OFFRES.map((o) => ({
    ...o,
    features: [...o.features],
    prix: launch ? o.prixLancement : o.prixNormal,
    prixBarre: launch ? o.prixNormal : null,
  }))
}

export function prixMin(now: Date = new Date()): number {
  return Math.min(...OFFRES.map((o) => prixOffre(o, now)))
}

export function formatFcfa(n: number): string {
  // Espace fine insécable comme séparateur de milliers (fr-FR) -> espace simple
  return n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' FCFA'
}

export function formatNombre(n: number): string {
  return n.toLocaleString('fr-FR').replace(/ | /g, ' ')
}

/** Libellé complet d'une ligne de commande, identique partout (site, paiement, emails, admin). */
export function libelleCommande(offreId: string, express: boolean): string {
  const r = resolvePack(offreId)
  const nom = r?.offre.nom ?? offreId
  return express || r?.express ? `${nom} + ${EXPRESS.nom}` : nom
}
