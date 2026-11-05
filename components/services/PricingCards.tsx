'use client'

import Link from 'next/link'

export interface Pack {
  nom: string
  prix: number
  devise: string
  features: string[]
  recommande: boolean
}

interface PricingCardsProps {
  packs: Pack[]
  service: string
  accentColor?: string
}

export default function PricingCards({ packs, service, accentColor = '#0F7B5A' }: PricingCardsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack) => (
        <div
          key={pack.nom}
          className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            pack.recommande ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
          }`}
        >
          {pack.recommande && (
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              Recommandé
            </div>
          )}

          <h3 className="font-heading text-lg font-bold text-dark">{pack.nom}</h3>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-heading text-4xl font-extrabold" style={{ color: accentColor }}>
              {pack.prix.toLocaleString('fr-CI')}
            </span>
            <span className="text-sm font-medium text-gray-500">{pack.devise}</span>
          </div>

          <ul className="mt-6 flex-1 space-y-3">
            {pack.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={`/commander?service=${service}&pack=${encodeURIComponent(pack.nom)}`}
            className={`gp-btn mt-6 w-full text-center ${
              pack.recommande ? 'gp-btn-primary' : 'gp-btn-outline'
            }`}
          >
            Choisir ce pack
          </Link>
        </div>
      ))}
    </div>
  )
}
