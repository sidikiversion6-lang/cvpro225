interface ServiceBenefitsProps {
  image: string
  titre: string
  benefits: string[]
  accentColor: string
}

export default function ServiceBenefits({ image, titre, benefits, accentColor }: ServiceBenefitsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div
        className="w-full h-64 sm:h-80 lg:h-[420px]"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div>
        <h3 className="font-heading text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
          {titre}
        </h3>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-0.5 w-12" style={{ backgroundColor: accentColor }} />
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          </div>
        </div>
        <ul className="mt-6 space-y-3">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 flex-shrink-0" style={{ color: accentColor }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base text-gray-700 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
