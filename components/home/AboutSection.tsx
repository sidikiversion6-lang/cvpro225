import Link from 'next/link'

export default function AboutSection() {
  return (
    <section className="bg-white py-14 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Image gauche */}
          <div className="relative mb-10 lg:mb-0">
            <div
              className="w-full h-64 sm:h-80 lg:h-[480px] rounded-sm bg-gray-200"
              style={{
                backgroundImage: 'url(/emploi1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Stats card overlay */}
            <div className="absolute -bottom-6 -right-4 max-w-[14rem] rounded-2xl border-2 border-gray-300 bg-white p-5 shadow-xl sm:-bottom-8 sm:-right-8 sm:p-6">
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                Analyse gratuite
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-bold leading-none text-primary md:text-7xl">30</span>
                <span className="text-xl font-semibold text-dark">sec</span>
              </div>
            </div>
          </div>

          {/* Contenu droite */}
          <div className="lg:pl-8 pt-6 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              POURQUOI CVPRO225
            </p>
            <h2 className="font-heading text-3xl font-extrabold text-[#0F172A] leading-tight lg:text-4xl xl:text-5xl">
              8 CV sur 10 sont rejetés avant d&apos;être lus
            </h2>

            {/* Ligne décorative */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-0.5 w-12 bg-primary" />
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
            </div>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed font-medium">
              Les recruteurs utilisent des logiciels ATS qui filtrent automatiquement les candidatures. Mauvais format, mots-clés absents, structure illisible par la machine : votre CV est écarté sans qu&apos;un humain l&apos;ouvre jamais.
            </p>
            <p className="mt-4 text-base text-gray-500 leading-relaxed">
              CVPro225 reconstruit votre CV pour passer ces filtres — puis convaincre le recruteur qui le lira ensuite. Optimisé pour le marché ivoirien et à l&apos;international.
            </p>

            <Link
              href="/outils/cv-check"
              className="mt-8 inline-flex items-center gap-3 bg-primary px-8 py-4 text-white font-semibold hover:bg-primary/90 transition-all duration-300"
            >
              <span>→</span> Analyser mon CV gratuitement
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
