import { OFFRES, EXPRESS, type OffreId } from '@/lib/offres'

export type ServiceType = 'cv' | 'visa' | 'job' | 'tender'

export type PackCV = OffreId | 'basic' | 'standard' | 'premium' | 'cv-express'
export type PackVisa = 'analyse' | 'assistance' | 'complet'
export type PackJob = 'candidature-1' | 'pack-3' | 'mensuel' | 'job-express'
export type PackTender = 'par-dossier' | 'mensuel-tender' | 'annuel'
export type PackType = PackCV | PackVisa | PackJob | PackTender

export type StatutCommande = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
export type ModePaiement = 'orange_money' | 'mtn_momo' | 'paydunya' | 'virement'

export interface CommandeFormData {
  service: ServiceType
  pack: PackType
  nom: string
  prenom: string
  email: string
  telephone: string
  ville: string
  secteur_activite?: string
  niveau_etudes?: string
  annees_experience?: string
  langue_cv?: 'francais' | 'anglais' | 'bilingue'
  cv_existant?: boolean
  destination_visa?: string
  date_voyage_prevue?: string
  motif_voyage?: string
  secteur_recherche?: string
  type_contrat?: string
  offre_url?: string
  secteur_entreprise?: string
  nom_entreprise?: string
  ao_url?: string
  mode_paiement?: ModePaiement
  message?: string
}

export interface Commande {
  id: string
  ref: string
  service: ServiceType
  pack: PackType
  nom: string
  prenom: string
  email: string
  telephone: string
  ville: string
  statut: StatutCommande
  mode_paiement?: ModePaiement
  montant: number
  details: Record<string, string>
  message?: string
  created_at: Date
  updated_at: Date
}

// Les prix ne sont PLUS définis ici : source unique = lib/offres.ts.

export const LABELS_SERVICE: Record<ServiceType, string> = {
  cv: 'CV Pro ATS',
  visa: 'Visa Check',
  job: 'JobAssist',
  tender: 'TenderPro',
}

/**
 * Libellés des packs pour l'affichage (back-office, dashboard, emails).
 * Offres actuelles (lib/offres.ts) + anciens identifiants, pour les commandes historiques.
 */
export const LABELS_PACK: Record<string, string> = {
  ...Object.fromEntries(OFFRES.map((o) => [o.id, o.nom])),
  standard: 'CV Pro ATS',
  'cv-express': `CV Pro ATS + ${EXPRESS.nom}`,
  'pack-3': 'JobAssist',
  'job-express': `JobAssist + ${EXPRESS.nom}`,
  basic: 'Basic',
  premium: 'Premium',
  analyse: 'Analyse',
  assistance: 'Assistance',
  complet: 'Pack Complet',
  'candidature-1': '1 Candidature',
  mensuel: 'Pack Mensuel',
  'par-dossier': 'Audit Express',
  'mensuel-tender': 'Montage Standard',
  annuel: 'Pack Premium',
}

export const SERVICE_COLORS: Record<ServiceType, string> = {
  cv: '#0F7B5A',
  visa: '#009460',
  job: '#D97706',
  tender: '#CE1126',
}
