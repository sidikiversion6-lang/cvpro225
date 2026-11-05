import type { ServiceType, PackType } from '@/types/commande'

export function generateRef(): string {
  const d = new Date()
  const dateStr = d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `GP-${dateStr}-${rand}`
}

export function formatPrix(montant: number): string {
  return montant.toLocaleString('fr-FR') + ' FCFA'
}

export function getPacksByService(service: ServiceType): PackType[] {
  const packs: Record<ServiceType, PackType[]> = {
    cv: ['standard', 'cv-express'],
    visa: ['analyse', 'assistance', 'complet'],
    job: ['pack-3', 'job-express'],
    tender: ['par-dossier', 'mensuel-tender', 'annuel'],
  }
  return packs[service]
}

export const PACK_FEATURES: Record<string, string[]> = {
  basic:            ['CV PDF + DOCX', 'Optimisation ATS basique', '1 retouche · 72h'],
  standard:         ['CV optimisé ATS + lettre de motivation', 'Rapport ATS détaillé + mots-clés', 'Optimisation LinkedIn · retouches incluses'],
  'cv-express':     ['Tout le pack standard', 'Livraison prioritaire en 24h'],
  premium:          ['CV + lettre + LinkedIn', 'ATS avancée + rapport', '3 retouches · 24h'],
  analyse:          ['Score conformité 100%', 'Documents manquants', 'Recommandations'],
  assistance:       ['Formulaire officiel', 'Prise de RDV consulaire', 'Suivi partiel'],
  complet:          ['Formulaire + RDV + hôtel', 'Préparation entretien', 'Suivi complet'],
  'candidature-1':  ['CV adapté + lettre', 'Soumission plateforme', '1 candidature'],
  'pack-3':         ['Candidature complète sur mesure', 'CV adapté + lettre par offre', 'Veille, suivi et prépa entretien'],
  'job-express':    ['Tout le pack standard', 'Livraison prioritaire en 48h'],
  mensuel:          ['Candidatures illimitées', 'Veille quotidienne', 'Entretiens illimités'],
  'par-dossier':    ['Dossier complet', 'Vérification conformité', 'Analyse éligibilité'],
  'mensuel-tender': ['2 dossiers/mois', 'Alertes AO 1 secteur', 'Modèles réutilisables'],
  annuel:           ['4 dossiers/mois', 'Alertes 3 secteurs', 'Accompagnement prioritaire'],
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
