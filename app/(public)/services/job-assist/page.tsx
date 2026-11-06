import { metaJobAssist } from '@/lib/seo'
import Link from 'next/link'
import { jobAssist as data } from '@/content/services'
import ServiceHero from '@/components/services/ServiceHero'
import ServiceTestimonials from '@/components/services/ServiceTestimonials'
import FAQAccordion from '@/components/services/FAQAccordion'
import ServiceSidebar from '@/components/services/ServiceSidebar'
import ServiceSteps from '@/components/services/ServiceSteps'
import ServiceBenefits from '@/components/services/ServiceBenefits'
import OffresGrid from '@/components/offres/OffresGrid'
import { SITE_CONFIG } from '@/lib/site-config'
import PaymentModalities from '@/components/services/PaymentModalities'

const C = data.couleur

// Prix lus à chaque requête : la fin de l'offre de lancement s'applique sans redéploiement.
export const dynamic = 'force-dynamic'
export function generateMetadata() {
  return metaJobAssist()
}

const STEPS = [
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    titre: 'Commandez en ligne',
    description: 'Choisissez JobAssist (option Express 24h possible) et payez en ligne en toute sécurité.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    titre: 'Partagez votre profil',
    description: 'Envoyez votre CV, ou échangez avec un conseiller sur WhatsApp si vous n\'en avez pas encore.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
    titre: 'Vos documents rédigés',
    description: 'CV Pro ATS, lettre de motivation et profil LinkedIn optimisé, livrés en 72h (24h en Express).',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    titre: 'Coaching entretien',
    description: 'Questions fréquentes par secteur, simulation et conseils de présentation pour réussir l\'entretien.',
  },
]

const BENEFITS = [
  'CV Pro ATS avec mots-clés adaptés à votre secteur',
  'Lettre de motivation personnalisée pour le poste visé',
  'Profil LinkedIn optimisé, cohérent avec votre CV',
  'Coaching entretien : questions fréquentes, simulation, conseils',
  'Livraison en 72h, ou 24h avec l\'option Express',
  'Satisfait ou refait : retouches gratuites jusqu\'à votre satisfaction',
]

const POURQUOI = [
  'CV optimisés pour les logiciels ATS utilisés par les recruteurs',
  'Documents adaptés aux attentes des recruteurs en Côte d\'Ivoire et à l\'international',
  'Un conseiller joignable sur WhatsApp, réponse en 2h',
  'Expertise sectorielle : banque, télécoms, ONG, mines, administration',
  'Satisfait ou refait : nous retravaillons vos documents gratuitement',
]

export default function JobAssistPage() {
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

  return (
    <>
      <ServiceHero data={data.hero} accentColor={C} />

      {/* Catalogue services + image hero */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-1">
              <ServiceSidebar active="job-assist" accentColor={C} />
            </div>
            <div className="lg:col-span-2">
              <div className="w-full h-64 sm:h-80 lg:h-[480px] overflow-hidden bg-gray-50">
                <img
                  src="/emploi1.png"
                  alt="JobAssist"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="mt-8 font-heading text-2xl font-extrabold text-[#0F172A] sm:text-3xl leading-tight">
                {data.accroche.titre}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                {data.accroche.texte}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section className="bg-gray-50 py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C }}>
              COMMENT ÇA MARCHE
            </p>
            <h2 className="font-heading text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Notre processus en 4 étapes
            </h2>
          </div>
          <ServiceSteps steps={STEPS} accentColor={C} />
        </div>
      </section>

      {/* Bénéfices avec image */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <ServiceBenefits
            image="/emploi2.png"
            titre="Les avantages de notre JobAssist"
            benefits={BENEFITS}
            accentColor={C}
          />
        </div>
      </section>

      {/* Packs */}
      <section id="packs" className="scroll-mt-20 bg-gray-50 py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-4 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Notre <span style={{ color: C }}>offre</span>
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500">
            CV, lettre de motivation, profil LinkedIn et coaching entretien : tout pour décrocher le poste.
          </p>

          <OffresGrid ids={['jobassist']} />

          <div className="mt-12">
            <PaymentModalities />
          </div>
        </div>
      </section>

      {/* Secteurs */}
      <section id="secteurs" className="scroll-mt-20 bg-white py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-10 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Secteurs <span style={{ color: C }}>accompagnés</span>
          </h2>
          <div className="mx-auto max-w-[1200px] overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 font-heading text-xs font-semibold uppercase tracking-wider text-gray-400">Secteur</th>
                  <th className="px-5 py-3 font-heading text-xs font-semibold uppercase tracking-wider text-gray-400">Exemples d&apos;employeurs en Côte d&apos;Ivoire</th>
                </tr>
              </thead>
              <tbody>
                {data.secteurs.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                    <td className="px-5 py-3 font-medium text-dark">{s.secteur}</td>
                    <td className="px-5 py-3 text-gray-600">{s.sources}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Témoignages — masqués tant que nous n'avons pas de vrais avis (lib/site-config.ts) */}
      {SITE_CONFIG.showTestimonials && (
      <section className="bg-gray-50 py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-10 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Ils ont trouvé un <span style={{ color: C }}>emploi</span>
          </h2>
          <ServiceTestimonials items={data.temoignages} accentColor={C} />
        </div>
      </section>
      )}

      {/* Pourquoi + FAQ 2 colonnes */}
      <section className="bg-white py-14 lg:py-20">
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
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 shadow-sm">
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
              href={data.ctaFinal.btnPrincipal.href}
              className="gp-btn gp-btn-lg bg-white font-bold hover:bg-white/90"
              style={{ color: C }}
            >
              {data.ctaFinal.btnPrincipal.label}
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gp-btn gp-btn-lg gp-btn-whatsapp"
            >
              {data.ctaFinal.btnSecondaire.label}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
