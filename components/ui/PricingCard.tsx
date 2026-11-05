import Link from 'next/link'

export interface PricingFeature {
  text: string
  included: boolean
}

interface Props {
  label: string
  subtitle?: string
  price: string
  currency?: string
  delay?: string
  features: PricingFeature[]
  featured?: boolean
  accentColor?: string
  ctaText?: string
  ctaHref: string
  badge?: string
  savingsBadge?: string
}

export default function PricingCard({
  label,
  subtitle,
  price,
  currency = 'FCFA',
  delay,
  features,
  featured = false,
  accentColor = '#0F7B5A',
  ctaText = 'Commander',
  ctaHref,
  badge,
  savingsBadge,
}: Props) {
  return (
    <div
      className={`relative flex h-full w-full flex-col rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? 'z-10 scale-105 shadow-xl ring-2'
          : 'border border-gray-200 shadow-sm hover:shadow-lg'
      }`}
      style={featured ? { borderColor: accentColor, boxShadow: `0 8px 30px ${accentColor}20` } : undefined}
    >
      {badge && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {badge}
        </div>
      )}

      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-dark">{label}</h3>
        {delay && (
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
            {delay}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mb-2 text-xs text-gray-500">{subtitle}</p>
      )}

      {savingsBadge && (
        <span
          className="mb-1 inline-block w-fit rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {savingsBadge}
        </span>
      )}

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-extrabold" style={{ color: accentColor }}>
          {price}
        </span>
        <span className="text-sm font-medium text-gray-400">{currency}</span>
      </div>

      <div className="my-5 h-px bg-gray-100" />

      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-gray-700' : 'text-gray-300'}`}>
            {f.included ? (
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-vert" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className={f.included ? '' : 'line-through'}>{f.text}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className="gp-btn mt-auto w-full text-center text-sm font-semibold"
        style={
          featured
            ? { backgroundColor: accentColor, color: 'white' }
            : { border: `2px solid ${accentColor}`, color: accentColor, backgroundColor: 'transparent' }
        }
      >
        {ctaText}
      </Link>
    </div>
  )
}
