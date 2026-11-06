import {
  EXPRESS,
  OFFRES,
  formatFcfa,
  getLaunchEnd,
  isLaunchActive,
  launchEndLabel,
} from '@/lib/offres'

// Lecture seule, au prix du moment (offre de lancement évaluée à chaque requête).
export const dynamic = 'force-dynamic'

/**
 * Grille tarifaire — LECTURE SEULE.
 * La source de vérité est lib/offres.ts (affichage + montant envoyé au paiement).
 * L'ancienne édition en base (tables packs / service_configs) ne pilotait ni
 * l'affichage ni le paiement : elle a été retirée pour éviter toute confusion.
 */
export default function AdminPrixPage() {
  const launch = isLaunchActive()
  const raw = process.env.LAUNCH_OFFER_END_DATE
  const fin = launchEndLabel()
  const invalid = Boolean(raw) && !getLaunchEnd(raw)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-dark">Grille tarifaire</h1>
        <p className="mt-1 text-sm text-gray-500">
          Prix appliqués sur le site et envoyés à PayDunya. Modifiables dans <code>lib/offres.ts</code> (déploiement requis).
        </p>
      </div>

      <div className={`mb-6 rounded-xl border p-4 text-sm ${launch ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-gray-200 bg-white text-gray-700'}`}>
        {launch ? (
          <p><strong>Offre de lancement active</strong> jusqu’au {fin} inclus (heure d’Abidjan). Les prix normaux s’appliqueront automatiquement ensuite.</p>
        ) : (
          <p><strong>Prix normaux appliqués.</strong> {fin ? `L’offre de lancement s’est terminée le ${fin}.` : 'Aucune offre de lancement configurée.'}</p>
        )}
        <p className="mt-1 text-xs opacity-80">
          Variable serveur <code>LAUNCH_OFFER_END_DATE</code> = {raw ? <code>{raw}</code> : <em>non définie</em>}
          {invalid && <strong className="text-rouge"> — format invalide (attendu AAAA-MM-JJ) : prix normaux appliqués</strong>}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Offre</th>
              <th className="px-4 py-3">Identifiant</th>
              <th className="px-4 py-3">Délai</th>
              <th className="px-4 py-3 text-right">Prix normal</th>
              <th className="px-4 py-3 text-right">Prix de lancement</th>
              <th className="px-4 py-3 text-right">Appliqué</th>
            </tr>
          </thead>
          <tbody>
            {OFFRES.map((o) => (
              <tr key={o.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium text-dark">
                  {o.nom} {o.plusChoisi && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Le plus choisi</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id}</td>
                <td className="px-4 py-3">{o.delai}</td>
                <td className="px-4 py-3 text-right">{formatFcfa(o.prixNormal)}</td>
                <td className="px-4 py-3 text-right">{formatFcfa(o.prixLancement)}</td>
                <td className="px-4 py-3 text-right font-bold text-primary">{formatFcfa(launch ? o.prixLancement : o.prixNormal)}</td>
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3 font-medium text-dark">{EXPRESS.nom} (ajoutable à toute offre)</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">express</td>
              <td className="px-4 py-3">{EXPRESS.delai}</td>
              <td className="px-4 py-3 text-right">+ {formatFcfa(EXPRESS.prix)}</td>
              <td className="px-4 py-3 text-right">+ {formatFcfa(EXPRESS.prix)}</td>
              <td className="px-4 py-3 text-right font-bold text-primary">+ {formatFcfa(EXPRESS.prix)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Le montant d’une commande est figé à sa création : un changement de prix ou la fin de l’offre n’affecte pas les commandes existantes.
      </p>
    </div>
  )
}
