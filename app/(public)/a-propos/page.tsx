import { PAGE_METADATA } from '@/lib/seo'
import Link from 'next/link'
import PageHero from '@/components/ui/PageHero'
import SectionTag from '@/components/ui/SectionTag'

export const metadata = PAGE_METADATA.aPropos

const TIMELINE = [
  { year: '2023', title: 'L\'idée', text: 'Constat des difficultés professionnelles vécues par les Ivoiriens au quotidien.' },
  { year: '2024', title: 'Le lancement', text: 'Lancement des premiers services CV Pro et JobAssist à Abidjan.' },
  { year: '2024', title: 'La croissance', text: 'Plus de 500 clients accompagnés. Ajout de JobAssist et TenderPro.' },
  { year: '2025', title: 'L\'ambition', text: 'Extension aux régions de Côte d\'Ivoire et à la diaspora africaine.' },
]

const VALUES = [
  { icon: '🤝', color: '#0F7B5A', title: 'Accessibilité', text: 'Des services professionnels à la portée de tous les Ivoiriens, quelle que soit leur situation.' },
  { icon: '⭐', color: '#F6BE00', title: 'Excellence', text: 'Nous ne livrons que ce que nous sommes fiers de signer. Qualité garantie ou remboursé.' },
  { icon: '💬', color: '#009460', title: 'Proximité', text: 'Une vraie personne derrière chaque commande. Pas de bot, pas de réponse automatique.' },
  { icon: '🔒', color: '#0F172A', title: 'Confiance', text: 'Vos données sont protégées. Nous ne vendons ni ne partageons vos informations.' },
]

const STATS = [
  { value: '500+', label: 'Clients accompagnés' },
  { value: '96%', label: 'Taux de satisfaction' },
  { value: '4', label: 'Services disponibles' },
  { value: '48h', label: 'Délai moyen de livraison' },
]

const TEAM = [
  { initials: 'JN', name: 'Jean Nosco', role: 'Fondateur & Directeur', color: '#0F7B5A' },
  { initials: 'AB', name: 'Aya Brou', role: 'Responsable CV & RH', color: '#009460' },
  { initials: 'KY', name: 'Konan Yao', role: 'Expert Visa & Immigration', color: '#2563EB' },
  { initials: 'AG', name: 'Adjoua Gnamien', role: 'Chargée Emploi & Candidatures', color: '#CE1126' },
  { initials: 'IK', name: 'Ismaël Koffi', role: 'Expert Appels d\'Offres', color: '#7C3AED' },
]

const WHY_US = [
  { title: '100% ivoirien et local', text: 'Nous connaissons les réalités du marché ivoirien, les ambassades locales et les pratiques des recruteurs en Côte d\'Ivoire.' },
  { title: 'Disponibles sur WhatsApp', text: 'Pas besoin d\'un ordinateur. Commandez, suivez et recevez vos livrables directement sur WhatsApp.' },
  { title: 'Tarifs adaptés au marché local', text: 'Des prix pensés pour le pouvoir d\'achat ivoirien, sans compromis sur la qualité.' },
  { title: 'Équipe humaine et réactive', text: 'Réponse sous 30 minutes en heures ouvrables. Toujours une vraie personne.' },
  { title: 'Satisfaction garantie', text: 'Retouches incluses et remboursement intégral si vous n\'êtes pas satisfait.' },
]

export default function AProposPage() {
  return (
    <>
      {/* SECTION 1 — Hero */}
      <PageHero
        tag="Notre histoire"
        title="Nés en Côte d'Ivoire, construits pour les Ivoiriens"
        subtitle="CVPro225 est né d'un constat simple : trop de talents ivoiriens passent à côté d'opportunités professionnelles par manque d'accompagnement, pas par manque de compétences."
      />

      {/* SECTION 2 — Notre histoire */}
      <section className="bg-white py-24">
        <div className="gp-container grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionTag text="Notre histoire" />
            <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">
              Un problème vécu, une solution créée
            </h2>
            <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-gray-600">
              <p>
                Tout a commencé par une frustration partagée. Des amis, des collègues, des proches — tous compétents, tous motivés — qui n&apos;obtenaient pas de réponses à leurs candidatures. Des dossiers visa refusés pour des détails administratifs. Des entreprises qui rataient des appels d&apos;offres faute de l&apos;avoir su à temps.
              </p>
              <p>
                CVPro225 a été créé pour changer ça. Notre plateforme met à disposition des Ivoiriens — qu&apos;ils soient à Abidjan, en région ou dans la diaspora — des services professionnels qui étaient jusqu&apos;ici réservés à ceux qui avaient les bons contacts ou les moyens de se payer des consultants.
              </p>
              <p>
                Aujourd&apos;hui, nous accompagnons des centaines de clients chaque mois avec un seul objectif : que chaque Ivoirien qui nous fait confiance reparte avec une vraie valeur ajoutée.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl bg-[#FAFAF9] p-8">
            <div className="relative space-y-8 pl-8">
              <div className="absolute bottom-0 left-3 top-2 w-0.5 bg-primary/20" />
              {TIMELINE.map((t, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[1.375rem] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-[#FAFAF9]" />
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{t.year}</p>
                  <h3 className="mt-1 font-heading text-base font-bold text-dark">{t.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Valeurs */}
      <section className="bg-[#FAFAF9] py-24">
        <div className="gp-container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <SectionTag text="Nos valeurs" />
            <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">
              Ce qui guide chacune de nos actions
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl bg-white p-8 shadow-sm">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${v.color}10` }}
                >
                  {v.icon}
                </div>
                <h3 className="font-heading text-lg font-bold text-dark">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Chiffres */}
      <section className="bg-primary py-16">
        <div className="gp-container grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-4xl font-black text-white">{s.value}</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — Équipe */}
      <section className="bg-white py-24">
        <div className="gp-container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <SectionTag text="L'équipe" />
            <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">
              Des experts à votre service
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Une équipe ivoirienne passionnée par l&apos;accompagnement professionnel.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {TEAM.map((m) => (
              <div key={m.initials} className="rounded-xl bg-gray-50 p-6 text-center shadow-sm">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full font-heading text-lg font-bold text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {m.initials}
                </div>
                <h3 className="mt-4 font-heading text-sm font-bold text-dark">{m.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Pourquoi nous */}
      <section className="bg-dark py-24">
        <div className="gp-container grid items-start gap-16 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/50">
              Notre différence
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
              Ce qui nous distingue des autres prestataires
            </h2>

            <div className="mt-8 space-y-6">
              {WHY_US.map((w) => (
                <div key={w.title} className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white">{w.title}</h3>
                    <p className="mt-1 text-sm text-white/50">{w.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Témoignage mis en avant */}
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderLeft: '4px solid #0F7B5A' }}
          >
            <span className="font-heading text-5xl text-primary" aria-hidden="true">&ldquo;</span>
            <p className="mt-2 text-base leading-relaxed text-white/80">
              Ce qui m&apos;a convaincu, c&apos;est que l&apos;équipe connaît vraiment les réalités ivoiriennes. Ils savent exactement ce que les recruteurs locaux et internationaux attendent d&apos;un CV solide. C&apos;est ça la vraie valeur ajoutée.
            </p>
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-sm font-semibold text-white">Koffi N&apos;Guessan</p>
              <p className="text-xs text-white/40">CV Pro ATS — Pack Premium · Abidjan</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CTA Final */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #009460, #007A4F)' }}>
        <div className="gp-container mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-black text-white sm:text-4xl">
            Prêt(e) à avancer avec nous ?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Rejoignez les centaines d&apos;Ivoiriens qui nous font déjà confiance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/services/cv-pro" className="gp-btn gp-btn-lg bg-white font-bold text-vert hover:bg-white/90">
              Voir nos services
            </Link>
            <Link href="/contact" className="gp-btn gp-btn-lg border-2 border-white text-white hover:bg-white/10">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
