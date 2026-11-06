/**
 * Informations légales de l'éditeur — À COMPLÉTER avant publication définitive.
 * Rien n'est inventé ici : chaque champ inconnu reste un marqueur visible.
 */
export const A_COMPLETER = '[À COMPLÉTER]'

export const LEGAL = {
  raisonSociale: A_COMPLETER,
  formeJuridique: A_COMPLETER,
  rccm: A_COMPLETER,
  siege: A_COMPLETER,
  emailLegal: A_COMPLETER,
  /** Date de dernière mise à jour des CGV et de la politique de confidentialité. */
  miseAJour: '6 novembre 2026',
} as const

export const WHATSAPP_CONTACT = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'
