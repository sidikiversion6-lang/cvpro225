'use client'

import Link from 'next/link'
import PricingCard from '@/components/ui/PricingCard'
import type { PricingFeature } from '@/components/ui/PricingCard'
import AccordionFAQ from '@/components/ui/AccordionFAQ'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

/* ── Données ── */

const CV_PACKS = [
  {
    label: 'CV Pro ATS', price: '15 000', delay: '48h', featured: true,
    badge: 'Formule unique',
    ctaHref: '/commander?service=cv&pack=standard',
    features: [
      { text: 'CV professionnel PDF + DOCX', included: true },
      { text: 'Optimisation ATS avancée + rapport', included: true },
      { text: 'Mots-clés adaptés à votre secteur', included: true },
      { text: 'Retouches incluses', included: true },
    ] as PricingFeature[],
  },
]

const JOB_PACKS = [
  {
    label: 'JobAssist', price: '30 000', delay: '72h', featured: true,
    badge: 'Formule unique',
    ctaHref: '/commander?service=job&pack=pack-3',
    features: [
      { text: 'Tout le CV Pro ATS, plus :', included: true },
      { text: 'Lettre de motivation personnalisée', included: true },
      { text: 'Optimisation du profil LinkedIn', included: true },
      { text: 'Coaching candidature', included: true },
    ] as PricingFeature[],
  },
]


const FAQ_ITEMS = [
  { question: 'Comment se passe le paiement ?', answer: 'Le paiement s\'effectue à la commande via Orange Money, MTN MoMo, virement bancaire ou PayDunya.' },
  { question: 'Puis-je commander plusieurs services en même temps ?', answer: 'Oui, et nous proposons une réduction de 10% sur le deuxième service commandé simultanément. Contactez-nous sur WhatsApp pour obtenir votre devis combiné.' },
  { question: 'Y a-t-il des frais cachés ?', answer: 'Non. Le prix affiché est le prix final. Les retouches incluses dans votre pack sont comprises dans ce tarif. Seules les options supplémentaires (ex : traduction, urgence) font l\'objet d\'un devis séparé.' },
  { question: 'Proposez-vous des tarifs réduits pour les étudiants ?', answer: 'Oui. Sur présentation d\'une carte d\'étudiant valide, nous accordons une réduction de 15% sur le CV Pro ATS.' },
  { question: 'Puis-je obtenir une facture pour mon entreprise ?', answer: 'Absolument. Une facture officielle est émise pour toute commande. Précisez lors de votre commande les informations de facturation de votre entreprise.' },
]

const GUARANTEES = [
  { icon: '✅', title: 'Livraison garantie', text: 'Nous respectons les délais annoncés ou nous vous remboursons intégralement.' },
  { icon: '🔄', title: 'Retouches incluses', text: 'Chaque pack inclut des retouches. Vous êtes satisfait ou on recommence.' },
  { icon: '🔒', title: 'Données sécurisées', text: 'Vos documents sont chiffrés et supprimés sous 90 jours après livraison.' },
]

const PAYMENTS = [
  { icon: 'OM', bg: '#0F7B5A', label: 'Orange Money', sub: 'Côte d\'Ivoire' },
  { icon: 'MTN', bg: '#FFCC00', label: 'MTN MoMo', sub: 'Mobile Money', textColor: '#0F172A' },
  { icon: '🏦', bg: '#E5E7EB', label: 'Virement bancaire', sub: 'Banques locales', emoji: true },
  { icon: 'PD', bg: '#2563EB', label: 'PayDunya', sub: 'Carte & Mobile' },
]

/* ── Composant page ── */

export default function TarifsPage() {

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="bg-dark pt-40 pb-20">
        <div className="gp-container mx-auto max-w-[1200px] text-center">
          <span className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: '#0F7B5A15', color: '#0F7B5A' }}>
            Tarifs transparents
          </span>
          <h1 className="font-heading text-4xl font-black text-white sm:text-5xl">
            Des prix clairs, sans surprise
          </h1>
          <p className="mt-5 text-lg text-white/60">
            Tous nos services sont disponibles à la commande. Payez uniquement ce dont vous avez besoin, quand vous en avez besoin.
          </p>
          <p className="mt-3 text-sm text-white/40">
            Prix en Francs CFA (FCFA) · Paiement via Orange Money, MTN MoMo ou virement
          </p>
        </div>
      </section>

      {/* SECTION 3 — Packs */}
      <section className="bg-[#FAFAF9] pb-16 pt-10">
        <div className="gp-container">
          <div className="mx-auto grid max-w-3xl items-stretch gap-8 sm:grid-cols-2">
            {/* CV Pro ATS */}
            <div className="flex flex-col">
              <div className="mb-6 text-center">
                <h2 className="font-heading text-2xl font-extrabold text-dark">📄 CV Pro ATS</h2>
                <p className="mt-2 text-sm text-gray-500">Votre CV professionnel livré en 48h</p>
              </div>
              <div className="flex flex-1">
                <PricingCard {...CV_PACKS[0]} accentColor="#0F7B5A" />
              </div>
            </div>
            {/* JobAssist */}
            <div className="flex flex-col">
              <div className="mb-6 text-center">
                <h2 className="font-heading text-2xl font-extrabold text-dark">💼 JobAssist</h2>
                <p className="mt-2 text-sm text-gray-500">Votre assistant candidature personnel</p>
              </div>
              <div className="flex flex-1">
                <PricingCard {...JOB_PACKS[0]} accentColor="#D97706" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Moyens de paiement */}
      <section className="bg-white py-16">
        <div className="gp-container">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">Modes de paiement acceptés</h2>
            <p className="mt-3 text-sm text-gray-500">Payez comme vous voulez, en toute sécurité</p>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {PAYMENTS.map((p) => (
              <div key={p.label} className="flex flex-col items-center rounded-xl bg-gray-50 p-6 text-center">
                {p.emoji ? (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-2xl">
                    {p.icon}
                  </span>
                ) : (
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-black"
                    style={{ backgroundColor: p.bg, color: p.textColor || 'white' }}
                  >
                    {p.icon}
                  </span>
                )}
                <p className="mt-3 text-sm font-semibold text-dark">{p.label}</p>
                <p className="text-xs text-gray-400">{p.sub}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Paiement à la commande · Livraison rapide
          </p>
        </div>
      </section>

      {/* SECTION 5 — Garanties */}
      <section className="bg-dark py-16">
        <div className="gp-container">
          <h2 className="mb-10 text-center font-heading text-2xl font-extrabold text-white sm:text-3xl">
            Nos garanties
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {GUARANTEES.map((g) => (
              <div
                key={g.title}
                className="rounded-xl p-6 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span className="text-4xl">{g.icon}</span>
                <h3 className="mt-4 font-heading text-lg font-bold text-white">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — FAQ */}
      <section className="bg-[#FAFAF9] py-16">
        <div className="gp-container">
          <h2 className="mb-10 text-center font-heading text-2xl font-extrabold text-dark sm:text-3xl">
            Questions sur les tarifs
          </h2>
          <AccordionFAQ items={FAQ_ITEMS} />
        </div>
      </section>

      {/* SECTION 7 — CTA Final */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0F7B5A, #0B5E45)' }}>
        <div className="gp-container mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-black text-white sm:text-4xl">
            Pas encore sûr(e) par où commencer ?
          </h2>
          <p className="mt-4 text-lg text-white/85">
            Décrivez-nous votre situation sur WhatsApp. On vous conseille le service adapté et le pack le plus rentable pour vous.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour, je voudrais un conseil sur vos services et tarifs.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gp-btn mt-8 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 font-bold text-primary hover:bg-white/90"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Demander un conseil gratuit
          </a>
        </div>
      </section>
    </>
  )
}
