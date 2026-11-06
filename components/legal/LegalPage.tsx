import PageHero from '@/components/ui/PageHero'
import { A_COMPLETER, LEGAL } from '@/lib/legal'

/** Gabarit commun des pages légales (CGV, confidentialité). */
export default function LegalPage({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero tag="Informations légales" title={title} subtitle={subtitle} />
      <section className="bg-white py-14 lg:py-20">
        <div className="gp-container mx-auto max-w-3xl">
          <p className="mb-8 text-sm text-gray-500">Dernière mise à jour : {LEGAL.miseAJour}</p>
          <div className="space-y-10 text-[0.9375rem] leading-relaxed text-gray-700 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-dark [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_table]:w-full [&_td]:border-b [&_td]:border-gray-100 [&_td]:py-2 [&_td]:pr-4 [&_th]:border-b [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:text-xs [&_th]:uppercase [&_th]:text-gray-400 [&_ul]:mt-2 [&_ul]:space-y-1">
            {children}
          </div>
        </div>
      </section>
    </>
  )
}

/** Valeur légale : affiche un marqueur bien visible tant qu'elle n'est pas renseignée. */
export function Champ({ value }: { value: string }) {
  return value === A_COMPLETER
    ? <mark className="rounded bg-amber-100 px-1 font-semibold text-amber-900">{value}</mark>
    : <>{value}</>
}
