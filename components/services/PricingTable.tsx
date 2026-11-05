import Link from 'next/link'
import type { PacksSection } from '@/content/services'

interface Props {
  data: PacksSection
  service: string
  accentColor?: string
}

export default function PricingTable({ data, service, accentColor = '#0F7B5A' }: Props) {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-4 font-heading text-xs font-semibold uppercase tracking-wider text-gray-400">
                Inclus
              </th>
              {data.colonnes.map((col) => (
                <th key={col.nom} className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    {col.recommande && (
                      <span
                        className="mb-1 rounded-full px-3 py-0.5 text-[0.6875rem] font-bold text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        Populaire
                      </span>
                    )}
                    <span className="font-heading text-base font-bold text-dark">{col.nom}</span>
                    <span className="text-xs font-semibold" style={{ color: accentColor }}>
                      {col.prix}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lignes.map((ligne, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{ligne.label}</td>
                {ligne.valeurs.map((val, j) => (
                  <td key={j} className="px-4 py-3.5 text-center text-sm">
                    {val === '✓' ? (
                      <svg className="mx-auto h-5 w-5" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20" aria-label="Inclus">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : val === '—' ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <span className="font-medium text-gray-700">{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-100">
              <td className="px-5 py-4" />
              {data.colonnes.map((col) => (
                <td key={col.nom} className="px-4 py-4 text-center">
                  <Link
                    href={`/commander?service=${service}&pack=${encodeURIComponent(col.nom)}`}
                    className="gp-btn w-full text-center text-sm"
                    style={
                      col.recommande
                        ? { backgroundColor: accentColor, color: 'white' }
                        : { border: `2px solid ${accentColor}`, color: accentColor }
                    }
                  >
                    Choisir
                  </Link>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {data.note && (
        <p className="mt-4 text-center text-xs text-gray-500 italic">
          {data.note}
        </p>
      )}
    </div>
  )
}
