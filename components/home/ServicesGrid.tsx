import Link from 'next/link'

const SERVICES = [
  {
    emoji: '📄',
    title: 'CV Pro ATS',
    description:
      'Un CV professionnel optimisé pour passer les filtres automatiques des recruteurs internationaux.',
    href: '/services/cv-pro',
    color: 'border-primary bg-primary-50 text-primary',
    hoverBg: 'group-hover:bg-primary',
  },
  {
    emoji: '💼',
    title: 'JobAssist',
    description:
      'Accompagnement complet pour vos candidatures : lettre de motivation, profil LinkedIn, coaching.',
    href: '/services/job-assist',
    color: 'border-jaune bg-jaune/10 text-jaune-dark',
    hoverBg: 'group-hover:bg-jaune',
  },
]

export default function ServicesGrid() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="gp-container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-extrabold text-dark sm:text-4xl">
            Nos <span className="text-primary">services</span>
          </h2>
          <p className="mt-4 text-gray-500">
            Des solutions professionnelles adaptées au marché ivoirien et international.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Accent top */}
              <div
                className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${service.hoverBg}`}
              />

              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border text-2xl ${service.color}`}
              >
                {service.emoji}
              </div>

              <h3 className="font-heading text-lg font-bold text-dark">
                {service.title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
                {service.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
                En savoir plus
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
