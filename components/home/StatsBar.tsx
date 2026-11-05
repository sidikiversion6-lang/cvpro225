interface Differentiator {
  icon: string
  titre: string
  texte: string
}

const DIFFERENTIATORS: Differentiator[] = [
  {
    icon: '⚡',
    titre: 'Réponse en 2h',
    texte: 'Notre équipe répond sur WhatsApp en moins de 2 heures, du lundi au samedi.',
  },
  {
    icon: '🇨🇮',
    titre: '100% Côte d\'Ivoire',
    texte: 'Nous connaissons le marché ivoirien, les recruteurs locaux et les attentes des ambassades.',
  },
  {
    icon: '✅',
    titre: 'Satisfait ou refait',
    texte: 'CV non convaincant ? Nous le retravaillons gratuitement jusqu\'à votre satisfaction.',
  },
]

export default function StatsBar() {
  return (
    <section className="bg-white border-y border-gray-200">
      <div className="mx-auto w-full max-w-[1400px] px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {DIFFERENTIATORS.map((d, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-3 px-6 py-10 text-center ${
                i !== DIFFERENTIATORS.length - 1 ? 'sm:border-r border-gray-200' : ''
              }`}
            >
              <span className="text-4xl sm:text-5xl" aria-hidden="true">{d.icon}</span>
              <h3 className="font-heading text-xl font-extrabold text-[#0F172A]">{d.titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{d.texte}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
