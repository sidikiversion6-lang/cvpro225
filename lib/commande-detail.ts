import { LABELS_PACK } from '@/types/commande'
import { EXPRESS, resolvePack } from '@/lib/offres'

/**
 * Détail d'une commande ENREGISTRÉE, lu dans commandes.details (prix figés à la
 * création) — jamais recalculé avec les prix du jour. Utilisé par les emails,
 * la facture PayDunya et le back-office : même libellé partout.
 */
export interface Ligne {
  libelle: string
  offreNom: string
  express: boolean
  prixOffre: number | null
  prixExpress: number | null
  delai: string | null
  tarif: 'lancement' | 'normal' | null
}

export function ligneCommande(c: { pack: string; details?: unknown }): Ligne {
  const d = (c.details && typeof c.details === 'object' ? c.details : {}) as Record<string, unknown>
  const resolved = resolvePack(c.pack)
  const express = d.express === true || d.express === 'true' || Boolean(resolved?.express)
  const offreNom = typeof d.offre_nom === 'string' ? d.offre_nom : resolved?.offre.nom ?? LABELS_PACK[c.pack] ?? c.pack
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
  return {
    libelle: express ? `${offreNom} + ${EXPRESS.nom}` : offreNom,
    offreNom,
    express,
    prixOffre: num(d.prix_offre),
    prixExpress: num(d.prix_express),
    delai: typeof d.delai === 'string' ? d.delai : null,
    tarif: d.tarif === 'lancement' || d.tarif === 'normal' ? d.tarif : null,
  }
}


/** Lien WhatsApp admin -> client sans CV, avec le message de collecte pré-rempli. */
export function lienCollecteInfos(c: { telephone: string; prenom: string; nom: string; details?: unknown }): string {
  const d = (c.details && typeof c.details === 'object' ? c.details : {}) as Record<string, unknown>
  const nom = (typeof d.nom_complet === 'string' && d.nom_complet) || `${c.prenom} ${c.nom}`.trim()
  const msg = `Bonjour ${nom}, merci pour votre commande CVPro225 ! Pour rédiger votre CV, pouvez-vous nous envoyer : votre poste recherché, vos expériences, vos formations et vos compétences ?`
  return `https://wa.me/${c.telephone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`
}
