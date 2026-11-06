import PricingCard from '@/components/ui/PricingCard'
import {
  EXPRESS,
  LAUNCH_BADGE,
  PLUS_CHOISI_BADGE,
  formatNombre,
  isLaunchActive,
  launchEndLabel,
  offresAffichees,
  type OffreId,
} from '@/lib/offres'

const ACCENT: Record<string, string> = { cv: '#0F7B5A', job: '#D97706' }

/**
 * Grille des offres au prix du moment (composant SERVEUR : lit
 * LAUNCH_OFFER_END_DATE à chaque rendu). La page qui l'utilise doit être
 * rendue dynamiquement pour que la fin de l'offre s'applique sans redéploiement.
 */
export default function OffresGrid({ ids, showExpress = true }: { ids?: OffreId[]; showExpress?: boolean }) {
  const offres = offresAffichees().filter((o) => !ids || ids.includes(o.id))
  const launch = isLaunchActive()
  const fin = launchEndLabel()
  const cols = offres.length >= 3 ? 'lg:grid-cols-3' : offres.length === 2 ? 'sm:grid-cols-2' : ''

  return (
    <div>
      {launch && (
        <p className="mx-auto mb-10 w-fit rounded-full bg-amber-100 px-5 py-2 text-center text-sm font-semibold text-amber-900">
          🎉 {LAUNCH_BADGE}{fin ? ` jusqu’au ${fin}` : ''} — profitez des prix réduits
        </p>
      )}
      <div className={`mx-auto grid max-w-6xl items-stretch gap-8 pt-4 ${cols} ${offres.length === 1 ? 'max-w-md' : ''}`}>
        {offres.map((o) => (
          <div key={o.id} className="flex">
            <PricingCard
              label={o.nom}
              subtitle={o.accroche}
              price={formatNombre(o.prix)}
              oldPrice={o.prixBarre !== null ? formatNombre(o.prixBarre) : undefined}
              launchBadge={o.prixBarre !== null ? LAUNCH_BADGE : undefined}
              delay={o.delai}
              featured={o.plusChoisi}
              badge={o.plusChoisi ? PLUS_CHOISI_BADGE : undefined}
              accentColor={ACCENT[o.service]}
              ctaText={o.plusChoisi ? 'Choisir cette offre' : 'Commander'}
              ctaHref={`/commander?offre=${o.id}`}
              priceNote={showExpress ? `Option Express ${EXPRESS.delai} : +${formatNombre(EXPRESS.prix)} FCFA` : undefined}
              features={o.features.map((text) => ({ text, included: true }))}
            />
          </div>
        ))}
      </div>
      {showExpress && (
        <div className="mx-auto mt-12 flex max-w-3xl items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl" aria-hidden="true">⚡</span>
          <div className="flex-1">
            <p className="font-heading font-bold text-dark">
              {EXPRESS.nom} — livraison en {EXPRESS.delai}
            </p>
            <p className="text-sm text-gray-500">Ajoutable à n’importe quelle offre au moment de la commande.</p>
          </div>
          <p className="whitespace-nowrap font-heading text-xl font-extrabold text-primary">+{formatNombre(EXPRESS.prix)} FCFA</p>
        </div>
      )}
    </div>
  )
}
