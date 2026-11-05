import Link from 'next/link'
import type { ServiceHero as ServiceHeroType } from '@/content/services'

interface Props {
  data: ServiceHeroType
  accentColor: string
}

export default function ServiceHero({ data, accentColor }: Props) {
  const isWhatsApp = data.ctaSecondaire.href === '#whatsapp'
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

  return (
    <section className="bg-dark pt-32 pb-16 lg:pb-20">
      <div className="gp-container">
        <div className="mx-auto max-w-[1200px] text-center">
          <span
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {data.badge}
          </span>

          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            {data.titre}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-gray-400 sm:text-lg">
            {data.sousTitre}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={data.ctaPrincipal.href}
              className="gp-btn gp-btn-lg font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {data.ctaPrincipal.label}
            </Link>
            {isWhatsApp ? (
              <a
                href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gp-btn gp-btn-lg gp-btn-whatsapp"
              >
                {data.ctaSecondaire.label}
              </a>
            ) : (
              <Link
                href={data.ctaSecondaire.href}
                className="gp-btn gp-btn-lg border-2 border-white/60 text-white hover:bg-white/10"
              >
                {data.ctaSecondaire.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
