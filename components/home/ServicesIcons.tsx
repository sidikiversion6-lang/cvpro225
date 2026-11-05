import Link from 'next/link'

const SERVICES = [
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="#0F172A" strokeWidth={1.5} viewBox="0 0 64 64">
        <rect x="12" y="8" width="40" height="48" rx="2" />
        <line x1="20" y1="20" x2="44" y2="20" />
        <line x1="20" y1="28" x2="44" y2="28" />
        <line x1="20" y1="36" x2="36" y2="36" />
        <circle cx="46" cy="46" r="8" />
        <path d="M43 46l2 2 4-4" />
      </svg>
    ),
    categorie: 'DOCUMENT',
    titre: 'CV Pro ATS',
    description: 'Un CV professionnel optimisé pour passer les filtres automatiques des recruteurs internationaux.',
    href: '/services/cv-pro',
  },
  {
    icon: (
      <svg className="h-16 w-16" fill="none" stroke="#0F172A" strokeWidth={1.5} viewBox="0 0 64 64">
        <circle cx="32" cy="20" r="10" />
        <path d="M12 52c0-11 9-20 20-20s20 9 20 20" />
        <path d="M40 32l6 6-6 6" />
        <path d="M46 38H30" />
      </svg>
    ),
    categorie: 'EMPLOI',
    titre: 'JobAssist',
    description: 'Accompagnement complet pour vos candidatures : lettre de motivation, profil LinkedIn, coaching.',
    href: '/services/job-assist',
  },
]

export default function ServicesIcons() {
  return (
    <section className="bg-gray-50 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1400px] px-8">
        {/* En-tête */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              COMMENT NOUS AIDONS NOS CLIENTS
            </p>
            <h2 className="font-heading text-4xl font-extrabold text-[#0F172A] leading-tight lg:text-5xl">
              Des Services de Qualité Pour Votre Réussite
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-0.5 w-12 bg-primary" />
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed lg:pt-8">
            Nous mettons à votre disposition une équipe qualifiée pour vous aider à atteindre vos objectifs professionnels. Nos consultants expérimentés vous accompagnent dans toutes vos démarches.
          </p>
        </div>

        {/* Cartes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-0">
          {SERVICES.map((s, i) => (
            <Link key={i} href={s.href} className="group block bg-white border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 relative">
              <div className="mb-6">{s.icon}</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{s.categorie}</p>
              <h3 className="font-heading text-xl font-bold text-[#0F172A] mb-3 group-hover:text-primary transition-colors">{s.titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
