import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { LABELS_SERVICE, LABELS_PACK, SERVICE_COLORS } from '@/types/commande'
import { formatPrix } from '@/lib/commande-config'

const SERVICE_EMOJIS: Record<string, string> = { cv: '📄', visa: '🛂', job: '💼', tender: '📋' }

interface Props {
  id: string
  ref: string
  service: string
  pack: string
  montant: number
  statut: string
  created_at: string | Date
  livraison_url?: string | null
}

export default function CommandeCard({ id, ref, service, pack, montant, statut, created_at, livraison_url }: Props) {
  const date = new Date(created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const emoji = SERVICE_EMOJIS[service] || '📄'
  const serviceLabel = LABELS_SERVICE[service as keyof typeof LABELS_SERVICE] || service
  const packLabel = LABELS_PACK[pack] || pack
  const color = SERVICE_COLORS[service as keyof typeof SERVICE_COLORS] || '#0F7B5A'

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xl" style={{ backgroundColor: `${color}10` }}>
            {emoji}
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-dark">{serviceLabel} — {packLabel}</p>
            <p className="text-xs text-gray-400">Réf: {ref}</p>
          </div>
        </div>
        <StatusBadge statut={statut} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Commandé le {date}</span>
        <span className="font-semibold text-dark">{formatPrix(montant)}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/dashboard/commandes/${id}`} className="gp-btn gp-btn-sm flex-1 rounded-lg border border-gray-200 text-center text-xs text-gray-600 hover:bg-gray-50">
          Voir les détails
        </Link>
        {statut === 'completed' && livraison_url && (
          <a href={livraison_url} target="_blank" rel="noopener noreferrer" className="gp-btn gp-btn-sm flex-1 rounded-lg bg-vert text-center text-xs text-white hover:opacity-90">
            Télécharger
          </a>
        )}
      </div>
    </div>
  )
}
