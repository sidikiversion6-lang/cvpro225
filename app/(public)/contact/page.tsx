import { PAGE_METADATA } from '@/lib/seo'
import Link from 'next/link'
import PageHero from '@/components/ui/PageHero'
import ContactForm from '@/components/contact/ContactForm'

export const metadata = PAGE_METADATA.contact

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'
const EMAIL = 'contact@cvpro225.com'

export default function ContactPage() {
  return (
    <>
      {/* SECTION 1 — Hero */}
      <PageHero
        tag="Contactez-nous"
        title="On est là pour vous aider"
        subtitle="Réponse en 2h sur WhatsApp, en heures ouvrables"
      />

      {/* SECTION 2 — Canaux de contact */}
      <section className="bg-[#FAFAF9] py-16">
        <div className="gp-container grid gap-6 md:grid-cols-3">

          {/* WhatsApp */}
          <div className="relative rounded-2xl border-2 border-vert bg-white p-8">
            <span className="absolute right-4 top-4 rounded-full bg-vert px-3 py-0.5 text-[0.6875rem] font-bold text-white">
              Recommandé
            </span>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-vert/10">
              <svg className="h-7 w-7 text-vert" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-bold text-dark">WhatsApp</h3>
            <p className="mt-1 text-sm text-gray-500">Le moyen le plus rapide. Réponse sous 30 minutes.</p>
            <p className="mt-3 text-sm font-medium text-dark">{WHATSAPP}</p>
            <a
              href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour, je souhaite en savoir plus sur vos services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gp-btn gp-btn-whatsapp mt-4 w-full rounded-full"
            >
              Démarrer la conversation
            </a>
            <p className="mt-3 text-xs text-gray-400">Disponible 8h–20h, 7j/7</p>
          </div>

          {/* Email */}
          <div className="rounded-2xl bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              ✉️
            </div>
            <h3 className="font-heading text-lg font-bold text-dark">Email</h3>
            <p className="mt-1 text-sm text-gray-500">Pour les demandes détaillées ou les documents. Réponse sous 24h.</p>
            <p className="mt-3 text-sm font-medium text-dark">{EMAIL}</p>
            <a
              href={`mailto:${EMAIL}`}
              className="gp-btn gp-btn-outline mt-4 w-full rounded-full"
            >
              Envoyer un email
            </a>
            <p className="mt-3 text-xs text-gray-400">Réponse sous 24h ouvrables</p>
          </div>

          {/* Adresse */}
          <div className="rounded-2xl bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rouge/10 text-2xl">
              📍
            </div>
            <h3 className="font-heading text-lg font-bold text-dark">Adresse</h3>
            <p className="mt-1 text-sm text-gray-500">Nous recevons sur rendez-vous uniquement à Abidjan.</p>
            <p className="mt-3 text-sm font-medium text-dark">Abidjan, République de Côte d&apos;Ivoire</p>
            <a
              href="https://maps.google.com/?q=Abidjan+C%C3%B4te+d%27Ivoire"
              target="_blank"
              rel="noopener noreferrer"
              className="gp-btn mt-4 w-full rounded-full border-2 border-rouge text-rouge hover:bg-rouge hover:text-white"
            >
              Voir sur la carte
            </a>
            <p className="mt-3 text-xs text-gray-400">Sur rendez-vous uniquement</p>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Formulaire + Infos */}
      <section className="bg-white py-24">
        <div className="gp-container grid gap-16 lg:grid-cols-5">

          {/* Formulaire (3/5) */}
          <div className="lg:col-span-3">
            <h2 className="font-heading text-2xl font-extrabold text-dark">Envoyez-nous un message</h2>
            <p className="mt-2 mb-8 text-sm text-gray-500">
              Décrivez votre besoin et nous vous recontactons rapidement.
            </p>
            <ContactForm />
          </div>

          {/* Infos complémentaires (2/5) */}
          <div className="space-y-8 lg:col-span-2">

            {/* Horaires */}
            <div className="rounded-2xl bg-gray-50 p-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕐</span>
                <h3 className="font-heading text-base font-bold text-dark">Nos horaires</h3>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Lundi – Vendredi</span>
                  <span className="font-medium text-dark">8h00 – 20h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium text-dark">9h00 – 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-medium text-dark">10h00 – 16h00</span>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-vert">
                <span className="h-2 w-2 rounded-full bg-vert" />
                WhatsApp disponible 7j/7
              </p>
            </div>

            {/* Délais */}
            <div className="rounded-2xl bg-gray-50 p-6">
              <h3 className="font-heading text-base font-bold text-dark">Délais de réponse</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span className="text-gray-600">WhatsApp : <span className="font-medium text-dark">Moins de 30 min</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span className="text-gray-600">Email : <span className="font-medium text-dark">Moins de 24h</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span className="text-gray-600">Formulaire : <span className="font-medium text-dark">Moins de 24h</span></span>
                </div>
              </div>
            </div>

            {/* Liens FAQ */}
            <div className="rounded-2xl bg-gray-50 p-6">
              <h3 className="font-heading text-base font-bold text-dark">Questions fréquentes</h3>
              <div className="mt-4 space-y-2">
                <Link href="/services/cv-pro#faq" className="block text-sm font-medium text-primary hover:underline">
                  Comment commander un CV ? →
                </Link>
                <Link href="/services/job-assist#faq" className="block text-sm font-medium text-primary hover:underline">
                  Comment fonctionne JobAssist ? →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — WhatsApp CTA urgent */}
      <section className="py-12" style={{ background: 'linear-gradient(135deg, #075E54, #128C7E)' }}>
        <div className="gp-container flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <svg className="h-10 w-10 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Besoin d&apos;une réponse immédiate ?</h3>
              <p className="mt-1 text-sm text-white/80">
                Écrivez-nous maintenant sur WhatsApp. Une vraie personne vous répond en moins de 2 heures.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gp-btn rounded-full bg-white px-8 py-4 font-bold text-[#075E54] hover:bg-white/90"
          >
            Ouvrir WhatsApp →
          </a>
        </div>
      </section>
    </>
  )
}
