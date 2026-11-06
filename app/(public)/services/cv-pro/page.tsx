import { metaCvPro } from '@/lib/seo'
import Link from 'next/link'
import { cvPro as data } from '@/content/services'
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
  return metaCvPro()
}

const STEPS = [
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    titre: 'Vous commandez',
    description: 'Choisissez votre offre et remplissez le formulaire en ligne ou contactez-nous sur WhatsApp. Pas besoin de CV existant.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
      </svg>
    ),
    titre: 'On rédige pour vous',
    description: 'Notre équipe analyse votre parcours, identifie les mots-clés de votre secteur et rédige un CV ATS optimisé.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    titre: 'Vous validez',
    description: 'Vous recevez votre CV par email. Si quelque chose ne vous convient pas, on ajuste : les retouches sont incluses.',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    titre: 'Vous êtes prêt(e)',
    description: 'Vous recevez vos fichiers finaux en PDF et DOCX. Vous pouvez postuler en toute confiance.',
  },
]

const BENEFITS = [
  'CV professionnel livré en PDF et DOCX modifiables',
  'Structure optimisée ATS compatible avec les logiciels de recrutement',
  'Mise en page sobre, moderne et lisible par les humains',
  'Mots-clés sectoriels adaptés à votre domaine d\'activité',
  'Version française et/ou anglaise selon votre cible',
  'Retouches incluses jusqu\'à satisfaction complète',
]

export default function CvProPage() {
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

  return (
    <>
      <ServiceHero data={data.hero} accentColor={C} />

      {/* Catalogue services + image hero */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-1">
              <ServiceSidebar active="cv-pro" accentColor={C} />
            </div>
            <div className="lg:col-span-2">
              <div
                className="w-full h-64 sm:h-80 lg:h-[480px]"
                style={{
                  backgroundImage: 'url(/cv1.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
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

      {/* Étapes spécifiques au service */}
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
            image="/cv2.png"
            titre="Les avantages de notre CV Pro ATS"
            benefits={BENEFITS}
            accentColor={C}
          />
        </div>
      </section>

      {/* Packs tarifaires */}
      <section id="packs" className="scroll-mt-20 bg-gray-50 py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-4 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Choisissez votre <span style={{ color: C }}>offre</span>
          </h2>
          <p className="mb-10 text-center text-base text-gray-500">
            Toutes les offres incluent un CV professionnel livré en PDF et DOCX.
          </p>
          <OffresGrid ids={['cv-pro-ats', 'cv-pro-ats-lettre']} />

          <div className="mt-12">
            <PaymentModalities />
          </div>
        </div>
      </section>

      {/* Témoignages — masqués tant que nous n'avons pas de vrais avis (lib/site-config.ts) */}
      {SITE_CONFIG.showTestimonials && (
      <section className="bg-white py-14 lg:py-20">
        <div className="gp-container">
          <h2 className="mb-10 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Ce qu&apos;en disent nos <span style={{ color: C }}>clients</span>
          </h2>
          <ServiceTestimonials items={data.temoignages} accentColor={C} />
        </div>
      </section>
      )}

      {/* Pourquoi nous + FAQ sur deux colonnes */}
      <section className="bg-gray-50 py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Colonne gauche : Pourquoi nous */}
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
                {data.pourquoi.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                    <span style={{ color: C }} className="mt-0.5 text-lg" aria-hidden="true">✦</span>
                    <p className="text-sm font-medium text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite : FAQ */}
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
