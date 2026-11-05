import type {
  DestinationVisa,
  DestinationConfig,
  VisaScoreResult,
  VisaLevel,
  ScoreLevelConfig,
} from '@/types/visa'

export const DESTINATIONS: DestinationVisa[] = ['france', 'usa', 'canada', 'turquie', 'schengen']

const CONFIGS: Record<DestinationVisa, DestinationConfig> = {
  france: {
    label: 'France',
    flag: '🇫🇷',
    platform: 'Capago / TLScontact',
    platformUrl: 'https://www.capago.eu',
    formLabel: 'France-Visas',
    formUrl: 'https://france-visas.gouv.fr',
    documents: [
      { id: 'passeport', label: 'Passeport valide (6 mois après séjour)', points: 20, obligatoire: true, description: 'Doit être valide au moins 3 mois après la fin du séjour prévu' },
      { id: 'photos', label: 'Photos d\'identité biométriques (x2)', points: 5, obligatoire: true },
      { id: 'formulaire_france_visas', label: 'Formulaire France-Visas rempli et signé', points: 15, obligatoire: true, description: 'À remplir sur france-visas.gouv.fr' },
      { id: 'assurance_voyage', label: 'Assurance voyage (min. 30 000 €)', points: 10, obligatoire: true },
      { id: 'billet_avion', label: 'Réservation billet aller-retour', points: 8, obligatoire: true },
      { id: 'reservation_hotel', label: 'Réservation hôtel ou lettre d\'invitation', points: 8, obligatoire: true },
      { id: 'releves_bancaires', label: 'Relevés bancaires 3 derniers mois', points: 12, obligatoire: true },
      { id: 'lettre_employeur', label: 'Lettre employeur ou justificatif activité', points: 8, obligatoire: true },
      { id: 'justif_domicile', label: 'Justificatif de domicile en Guinée', points: 5, obligatoire: false },
      { id: 'itineraire', label: 'Itinéraire détaillé du voyage', points: 5, obligatoire: false },
      { id: 'attestation_scolarite', label: 'Attestation de scolarité (si étudiant)', points: 4, obligatoire: false },
    ],
  },

  usa: {
    label: 'États-Unis',
    flag: '🇺🇸',
    platform: 'CGI Federal (USVisaScheduling)',
    platformUrl: 'https://www.ustraveldocs.com',
    formLabel: 'Formulaire DS-160',
    formUrl: 'https://ceac.state.gov',
    documents: [
      { id: 'passeport', label: 'Passeport valide', points: 20, obligatoire: true },
      { id: 'formulaire_ds160', label: 'Formulaire DS-160 complété en ligne', points: 20, obligatoire: true, description: 'À remplir sur ceac.state.gov avant le RDV' },
      { id: 'photo_us', label: 'Photo format visa américain', points: 5, obligatoire: true },
      { id: 'confirmation_rdv', label: 'Confirmation de rendez-vous consulaire', points: 15, obligatoire: true },
      { id: 'frais_visa', label: 'Preuve de paiement des frais de visa (MRV)', points: 10, obligatoire: true },
      { id: 'releves_bancaires', label: 'Relevés bancaires 3 derniers mois', points: 12, obligatoire: true },
      { id: 'lettre_emploi', label: 'Lettre d\'emploi ou justificatif d\'activité', points: 8, obligatoire: true },
      { id: 'lettre_invitation', label: 'Lettre d\'invitation (si applicable)', points: 5, obligatoire: false },
      { id: 'billet_avion', label: 'Réservation de billet aller-retour', points: 5, obligatoire: false },
    ],
  },

  canada: {
    label: 'Canada',
    flag: '🇨🇦',
    platform: 'VFS Global',
    platformUrl: 'https://www.vfsglobal.ca',
    formLabel: 'Formulaire IRCC en ligne',
    formUrl: 'https://www.canada.ca/fr/immigration',
    documents: [
      { id: 'passeport', label: 'Passeport valide', points: 20, obligatoire: true },
      { id: 'photos', label: 'Photos d\'identité format Canada', points: 5, obligatoire: true },
      { id: 'formulaire_ircc', label: 'Formulaire IRCC en ligne complété', points: 15, obligatoire: true },
      { id: 'preuves_fonds', label: 'Preuves de fonds suffisants', points: 15, obligatoire: true },
      { id: 'lettre_emploi_etudes', label: 'Lettre d\'emploi ou d\'études', points: 10, obligatoire: true },
      { id: 'billet_avion', label: 'Réservation de billet aller-retour', points: 8, obligatoire: false },
      { id: 'hebergement', label: 'Hébergement confirmé', points: 8, obligatoire: false },
      { id: 'assurance_medicale', label: 'Assurance médicale voyage', points: 10, obligatoire: true },
      { id: 'liens_guinee', label: 'Preuves de liens avec la Guinée', points: 9, obligatoire: false, description: 'Propriété, famille, emploi stable en Guinée' },
    ],
  },

  turquie: {
    label: 'Turquie',
    flag: '🇹🇷',
    platform: 'BLS International',
    platformUrl: 'https://www.blsinternational.com',
    formLabel: 'Formulaire ambassade Turquie',
    formUrl: 'https://www.evisa.gov.tr',
    documents: [
      { id: 'passeport', label: 'Passeport valide (6 mois minimum)', points: 25, obligatoire: true },
      { id: 'photos', label: 'Photos d\'identité récentes', points: 5, obligatoire: true },
      { id: 'formulaire', label: 'Formulaire de demande de visa', points: 15, obligatoire: true },
      { id: 'billet_avion', label: 'Billet d\'avion aller-retour', points: 15, obligatoire: true },
      { id: 'reservation_hotel', label: 'Réservation hôtel confirmée', points: 15, obligatoire: true },
      { id: 'releves_bancaires', label: 'Justificatif financier (relevés bancaires)', points: 15, obligatoire: true },
      { id: 'assurance_voyage', label: 'Assurance voyage', points: 10, obligatoire: true },
    ],
  },

  schengen: {
    label: 'Espace Schengen',
    flag: '🇪🇺',
    platform: 'TLScontact / VFS Global',
    platformUrl: 'https://www.tlscontact.com',
    formLabel: 'Formulaire Schengen unifié',
    formUrl: '',
    documents: [
      { id: 'passeport', label: 'Passeport valide (3 mois après séjour)', points: 20, obligatoire: true },
      { id: 'photos', label: 'Photos biométriques récentes (x2)', points: 5, obligatoire: true },
      { id: 'formulaire_schengen', label: 'Formulaire Schengen rempli et signé', points: 15, obligatoire: true },
      { id: 'assurance_schengen', label: 'Assurance voyage Schengen (min. 30 000 €)', points: 10, obligatoire: true },
      { id: 'billet_avion', label: 'Réservation billet aller-retour', points: 8, obligatoire: true },
      { id: 'hebergement', label: 'Hébergement confirmé (hôtel ou invitation)', points: 8, obligatoire: true },
      { id: 'releves_bancaires', label: 'Relevés bancaires 3 derniers mois', points: 12, obligatoire: true },
      { id: 'lettre_employeur', label: 'Lettre d\'employeur ou justificatif', points: 8, obligatoire: true },
      { id: 'justif_domicile', label: 'Justificatif de domicile en Guinée', points: 5, obligatoire: false },
      { id: 'itineraire', label: 'Itinéraire du voyage', points: 4, obligatoire: false },
      { id: 'liens_pays_origine', label: 'Preuves de liens avec pays d\'origine', points: 5, obligatoire: false },
    ],
  },
}

export function getDestinationConfig(dest: DestinationVisa): DestinationConfig {
  return CONFIGS[dest]
}

export function getScoreLevelConfig(level: VisaLevel): ScoreLevelConfig {
  const levels: Record<VisaLevel, ScoreLevelConfig> = {
    low:    { label: 'Insuffisant', color: '#CE1126', bgColor: '#CE112610', message: 'Un accompagnement renforcé est indispensable.', emoji: '🚨' },
    medium: { label: 'Moyen',       color: '#C41E3A', bgColor: '#C41E3A10', message: 'Des documents importants sont manquants.', emoji: '⚠️' },
    good:   { label: 'Bon',         color: '#D4A300', bgColor: '#D4A30010', message: 'Quelques ajustements mineurs à prévoir.', emoji: '👍' },
    great:  { label: 'Excellent',   color: '#009460', bgColor: '#00946010', message: 'Votre dossier est prêt pour le dépôt !', emoji: '🎉' },
  }
  return levels[level]
}

export function calculateVisaScore(
  destination: DestinationVisa,
  checkedDocs: string[]
): VisaScoreResult {
  const config = CONFIGS[destination]
  const docs = config.documents
  const maxPoints = docs.reduce((sum, d) => sum + d.points, 0)
  const earned = docs
    .filter((d) => checkedDocs.includes(d.id))
    .reduce((sum, d) => sum + d.points, 0)

  const score = maxPoints > 0 ? Math.round((earned / maxPoints) * 100) : 0

  const missing = docs
    .filter((d) => d.obligatoire && !checkedDocs.includes(d.id))
    .map((d) => d.label)

  let level: VisaLevel
  if (score >= 90 && missing.length === 0) level = 'great'
  else if (score >= 70) level = 'good'
  else if (score >= 50) level = 'medium'
  else level = 'low'

  const levelConfig = getScoreLevelConfig(level)

  return {
    score,
    level,
    levelLabel: levelConfig.label,
    levelColor: levelConfig.color,
    message: levelConfig.message,
    missing,
    checkedCount: checkedDocs.length,
    totalCount: docs.length,
  }
}
