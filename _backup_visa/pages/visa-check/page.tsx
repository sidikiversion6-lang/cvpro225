import { PAGE_METADATA } from '@/lib/seo'
import Link from 'next/link'
import { visaCheck as data } from '@/content/services'
import ServiceHero from '@/components/services/ServiceHero'
import PricingTable from '@/components/services/PricingTable'
import ServiceTestimonials from '@/components/services/ServiceTestimonials'
import FAQAccordion from '@/components/services/FAQAccordion'
import VisaSimulator from '@/components/visa/VisaSimulator'
import ServiceSidebar from '@/components/services/ServiceSidebar'
import ServiceSteps from '@/components/services/ServiceSteps'
import ServiceBenefits from '@/components/services/ServiceBenefits'

const C = data.couleur

export const metadata = PAGE_METADATA.visaCheck

const STEPS = [
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    titre: 'Envoyez votre dossier',
    description: 'Transmettez vos documents via notre espace client sécurisé ou WhatsApp crypté.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
    titre: 'Analyse & score',
    description: 'Score de conformité sur 100 avec rapport détaillé et liste des documents manquants.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    titre: 'Formulaires & RDV',
    description: 'Nous remplissons les formulaires officiels et réservons votre rendez-vous consulaire.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    titre: 'Dépôt à l\'ambassade',
    description: 'Suivi complet jusqu\'au dépôt, avec préparation à l\'entretien si nécessaire.',
  },
]

const BENEFITS = [
  'Analyse complète de votre dossier selon l\'ambassade visée',
  'Score de conformité sur 100 avec recommandations détaillées',
  'Remplissage des formulaires officiels (France-Visas, DS-160, IRCC...)',
  'Prise de rendez-vous consulaire sur plateformes officielles',
  'Obtention des documents annexes (hôtel, billet, assurance)',
  'Préparation à l\'entretien consulaire si nécessaire',
]

const POURQUOI = [
  'Équipe spécialisée en démarches consulaires internationales',
  'Expérience avec toutes les destinations majeures (France, USA, Canada, Schengen, Turquie)',
  'Transmission sécurisée et confidentialité de vos documents',
  'Accompagnement personnalisé jusqu\'au dépôt',
  'Taux de réussite élevé grâce à un audit rigoureux',
]

export default function VisaCheckPage() {
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+224600000000'

  return (
    <>
      <ServiceHero data={data.hero} accentColor={C} />

      {/* Catalogue services + image hero */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-1">
              <ServiceSidebar active="visa-check" accentColor={C} />
            </div>
            <div className="lg:col-span-2">
              <div
                className="w-full h-64 sm:h-80 lg:h-[480px]"
                style={{
                  backgroundImage: 'url(/visa1.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <h2 className="mt-8 font-heading text-2xl font-extrabold text-[#0d1f35] sm:text-3xl leading-tight">
                {data.accroche.titre}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                {data.accroche.texte}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Étapes spécifiques */}
      <section className="bg-gray-50 py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C }}>
              COMMENT ÇA MARCHE
            </p>
            <h2 className="font-heading text-3xl font-extrabold text-[#0d1f35] sm:text-4xl">
              Notre processus en 4 étapes
            </h2>
          </div>
          <ServiceSteps steps={STEPS} accentColor={C} />
        </div>
      </section>

      {/* Simulateur */}
      <section id="simulateur" className="scroll-mt-20 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: `${C}12`, color: C }}>
              Outil gratuit
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">
              Testez votre dossier en <span style={{ color: C }}>30 secondes</span>
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Sélectionnez votre destination et cochez vos documents. Le score s&apos;affiche en temps réel.
            </p>
          </div>
          <VisaSimulator />
        </div>
      </section>

      {/* Bénéfices avec image */}
      <section className="bg-gray-50 py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <ServiceBenefits
            image="/visa2.png"
            titre="Les avantages de notre Visa Check"
            benefits={BENEFITS}
            accentColor={C}
          />
        </div>
      </section>

      {/* Packs */}
      <section id="packs" className="scroll-mt-20 bg-white py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-4 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Nos <span style={{ color: C }}>formules</span>
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500">
            De l&apos;analyse simple à l&apos;accompagnement complet jusqu&apos;au dépôt.
          </p>
          <PricingTable data={data.packs} service="visa" accentColor={C} />
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-gray-50 py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-10 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Destinations & <span style={{ color: C }}>plateformes</span>
          </h2>
          <div className="mx-auto max-w-[1200px] overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 font-heading text-xs font-semibold uppercase tracking-wider text-gray-400">Destination</th>
                  <th className="px-5 py-3 font-heading text-xs font-semibold uppercase tracking-wider text-gray-400">Plateforme RDV</th>
                  <th className="px-5 py-3 font-heading text-xs font-semibold uppercase tracking-wider text-gray-400">Formulaire officiel</th>
                </tr>
              </thead>
              <tbody>
                {data.destinations.map((d, i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                    <td className="px-5 py-3 font-medium text-dark">{d.destination}</td>
                    <td className="px-5 py-3 text-gray-600">{d.plateforme}</td>
                    <td className="px-5 py-3 text-gray-600">{d.formulaire}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-white py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-10 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Ils ont obtenu leur <span style={{ color: C }}>visa</span>
          </h2>
          <ServiceTestimonials items={data.temoignages} accentColor={C} />
        </div>
      </section>

      {/* Pourquoi + FAQ 2 colonnes */}
      <section className="bg-gray-50 py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">
                Pourquoi nous faire <span style={{ color: C }}>confiance</span> ?
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-0.5 w-12" style={{ backgroundColor: C }} />
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C }} />
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C }} />
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C }} />
                </div>
              </div>
              <div className="mt-8 space-y-4">
                {POURQUOI.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                    <span style={{ color: C }} className="mt-0.5 text-lg" aria-hidden="true">✦</span>
                    <p className="text-sm font-medium text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">
                Questions <span style={{ color: C }}>fréquentes</span>
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-0.5 w-12" style={{ backgroundColor: C }} />
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C }} />
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C }} />
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C }} />
                </div>
              </div>
              <div className="mt-8">
                <FAQAccordion items={data.faq} accentColor={C} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16" style={{ backgroundColor: C }}>
        <div className="gp-container text-center">
          <h2 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            {data.ctaFinal.titre}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="#simulateur"
              className="gp-btn gp-btn-lg bg-white font-bold hover:bg-white/90"
              style={{ color: C }}
            >
              {data.ctaFinal.btnPrincipal.label}
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gp-btn gp-btn-lg border-2 border-white text-white hover:bg-white/10"
            >
              {data.ctaFinal.btnSecondaire.label}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
