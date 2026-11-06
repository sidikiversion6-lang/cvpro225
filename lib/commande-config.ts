import { formatFcfa } from '@/lib/offres'

export function generateRef(): string {
  const d = new Date()
  const dateStr = d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `CVP-${dateStr}-${rand}`
}

/** Format monétaire unique (délégué à lib/offres.ts). */
export function formatPrix(montant: number): string {
  return formatFcfa(montant)
}

export const SECTEURS = [
  'Mines & Ressources naturelles',
  'Banque & Finance',
  'Télécommunications',
  'ONG & Humanitaire',
  'Administration publique',
  'BTP & Ingénierie',
  'Santé',
  'Éducation & Formation',
  'Autre',
]
