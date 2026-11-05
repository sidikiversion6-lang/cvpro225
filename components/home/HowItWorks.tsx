const STEPS = [
  {
    num: 1,
    title: 'Commandez',
    description:
      'Choisissez votre service, sélectionnez un pack et remplissez le formulaire en ligne.',
    icon: '🛒',
  },
  {
    num: 2,
    title: 'On prépare',
    description:
      'Nos experts traitent votre demande avec soin sous 24 à 48 heures.',
    icon: '⚙️',
  },
  {
    num: 3,
    title: 'Vous recevez',
    description:
      'Recevez vos documents finalisés par email et via votre espace client.',
    icon: '✅',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="gp-container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-extrabold text-dark sm:text-4xl">
            Comment ça <span className="text-primary">marche</span> ?
          </h2>
          <p className="mt-4 text-gray-500">
            Un processus simple en 3 étapes pour obtenir vos documents professionnels.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Ligne de connexion desktop */}
          <div
            className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gray-200 lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 left-[16.66%] right-[16.66%] bg-gray-200" />
          </div>

          {/* Ligne de connexion mobile */}
          <div
            className="absolute bottom-0 left-10 top-0 w-0.5 bg-gray-200 lg:hidden"
            aria-hidden="true"
          />

          <div className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="flex gap-5 lg:flex-col lg:items-center lg:text-center">
                {/* Cercle numéroté */}
                <div className="relative z-10 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-dark text-xs font-bold text-white">
                    {step.num}
                  </span>
                </div>

                {/* Texte */}
                <div className="pt-1 lg:pt-0">
                  <h3 className="font-heading text-xl font-bold text-dark">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
