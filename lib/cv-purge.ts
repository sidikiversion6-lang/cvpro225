/**
 * Purge des CV stockés (bucket privé "commandes-cv") — engagement affiché sur
 * la page Tarifs : « documents supprimés sous 90 jours après livraison ».
 *
 * Un CV est supprimé quand :
 *   - la commande a été LIVRÉE il y a plus de 90 jours (delivered_at) ;
 *   - ou elle n'a jamais été payée, ou a été annulée, et a été créée il y a
 *     plus de 90 jours (elle ne sera jamais livrée).
 * Une commande payée et en cours de traitement garde son CV.
 *
 * Après suppression du fichier : cv_fichier = NULL et details.cv_purge_le = date.
 * La commande elle-même (montant, statut, historique) n'est jamais supprimée.
 */

export const CV_RETENTION_JOURS = 90

export interface CvAPurger {
  id: string
  ref: string
  cv_fichier: string
  details: unknown
}

export interface PurgeDeps {
  /** Commandes avec un CV stocké et dont la date de référence est antérieure à `limite`. */
  trouver: (limite: Date) => Promise<CvAPurger[]>
  supprimerFichiers: (paths: string[]) => Promise<void>
  marquerPurge: (id: string, details: Record<string, unknown>) => Promise<void>
  log: (msg: string, err?: unknown) => void
}

export function limitePurge(now: Date): Date {
  return new Date(now.getTime() - CV_RETENTION_JOURS * 24 * 60 * 60 * 1000)
}

export async function purgerCvExpires(deps: PurgeDeps, now: Date = new Date()): Promise<{ purges: number; erreurs: number }> {
  const candidats = await deps.trouver(limitePurge(now))
  let purges = 0
  let erreurs = 0
  // Par lots : un échec n'empêche pas la purge des autres.
  for (let i = 0; i < candidats.length; i += 50) {
    const lot = candidats.slice(i, i + 50)
    try {
      await deps.supprimerFichiers(lot.map((c) => c.cv_fichier))
    } catch (err) {
      erreurs += lot.length
      deps.log(`[purge CV] échec de suppression d'un lot de ${lot.length} fichier(s)`, err)
      continue
    }
    for (const c of lot) {
      const details = (c.details && typeof c.details === 'object' ? c.details : {}) as Record<string, unknown>
      try {
        await deps.marquerPurge(c.id, { ...details, cv_purge_le: now.toISOString() })
        purges++
      } catch (err) {
        erreurs++
        deps.log(`[purge CV] fichier supprimé mais commande ${c.ref} non mise à jour`, err)
      }
    }
  }
  if (candidats.length) deps.log(`[purge CV] ${purges} CV supprimé(s), ${erreurs} erreur(s)`)
  return { purges, erreurs }
}

/** Dépendances réelles (Prisma + Supabase Storage). */
export async function purgeDepsReelles(): Promise<PurgeDeps> {
  const [{ prisma }, { getSupabaseAdmin }, { CV_BUCKET }] = await Promise.all([
    import('@/lib/prisma'),
    import('@/lib/cv-checker/supabase-client'),
    import('@/lib/cv-storage'),
  ])
  return {
    trouver: async (limite) => {
      const rows = await prisma.commande.findMany({
        where: {
          cv_fichier: { not: null },
          OR: [
            { delivered_at: { lt: limite } },
            { paid_at: null, created_at: { lt: limite } },
            { statut: 'cancelled', created_at: { lt: limite } },
          ],
        },
        select: { id: true, ref: true, cv_fichier: true, details: true },
        take: 500,
      })
      return rows.map((r) => ({ ...r, cv_fichier: r.cv_fichier! }))
    },
    supprimerFichiers: async (paths) => {
      const { error } = await getSupabaseAdmin().storage.from(CV_BUCKET).remove(paths)
      if (error) throw error
    },
    marquerPurge: async (id, details) => {
      await prisma.commande.update({ where: { id }, data: { cv_fichier: null, details: details as object } })
    },
    log: (msg, err) => (err ? console.error(msg, err) : console.log(msg)),
  }
}
