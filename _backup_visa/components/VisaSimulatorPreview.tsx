import Link from 'next/link'

const DESTINATIONS = ['🇫🇷 France', '🇺🇸 USA', '🇨🇦 Canada', '🇹🇷 Turquie', '🇪🇺 Schengen']

export default function VisaSimulatorPreview() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="gp-container">
        <div className="overflow-hidden rounded-3xl bg-dark shadow-xl lg:grid lg:grid-cols-2">
          {/* Texte */}
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Visa Check
            </span>

            <h2 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
              Votre dossier visa est-il{' '}
              <span className="text-primary">complet</span> ?
            </h2>

            <p className="mt-4 max-w-md leading-relaxed text-gray-400">
              Simulez gratuitement votre score de préparation avant de
              déposer votre demande. Identifiez les documents manquants
              en quelques clics.
            </p>

            {/* Destinations */}
            <div className="mt-6 flex flex-wrap gap-2">
              {DESTINATIONS.map((dest) => (
                <span
                  key={dest}
                  className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70"
                >
                  {dest}
                </span>
              ))}
            </div>

            <Link
              href="/services/visa-check"
              className="gp-btn gp-btn-primary gp-btn-lg mt-8 w-fit"
            >
              Tester mon dossier gratuitement
            </Link>
          </div>

          {/* Visuel score */}
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-vert/10" />
            <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm">
              {/* Gauge circulaire */}
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="#009460"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52 * 0.78} ${2 * Math.PI * 52}`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-heading text-4xl font-extrabold text-white">78</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <span className="rounded-full bg-vert/20 px-4 py-1 text-sm font-semibold text-vert">
                Bon dossier
              </span>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>✅ 8 documents</span>
                <span>⚠️ 2 manquants</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
