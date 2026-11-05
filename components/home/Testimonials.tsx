const TESTIMONIALS = [
  {
    nom: 'Prince Nosco',
    ville: 'Abidjan',
    service: 'CV Pro ATS',
    note: 5,
    texte:
      'Grâce à mon CV refait par CVPro225, j\'ai décroché 3 entretiens en une semaine. Le format ATS a fait toute la différence.',
  },
  {
    nom: 'Tina Kouane',
    ville: 'Bouaké',
    service: 'JobAssist',
    note: 5,
    texte:
      'J\'ai envoyé 15 candidatures sans réponse avant CVPro225. Après la refonte de ma lettre de motivation et l\'optimisation de mon profil, décroché un poste en 3 semaines.',
  },
  {
    nom: 'Naima Apouk',
    ville: 'Abidjan',
    service: 'JobAssist',
    note: 5,
    texte:
      'Accompagnement au top pour préparer mes entretiens. J\'ai décroché le poste que je visais. L\'équipe est réactive et professionnelle.',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? 'text-jaune' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="gp-container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-extrabold text-dark sm:text-4xl">
            Ce que disent nos <span className="text-primary">clients</span>
          </h2>
          <p className="mt-4 text-gray-500">
            Des centaines d&apos;Ivoiriens nous font confiance pour leurs projets professionnels.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.nom}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <Stars count={t.note} />

              <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                &ldquo;{t.texte}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-gray-50 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 font-heading text-sm font-bold text-primary">
                  {t.nom.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">{t.nom}</p>
                  <p className="text-xs text-gray-400">
                    {t.service} · {t.ville}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
