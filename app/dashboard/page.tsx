import { redirect } from 'next/navigation'
import { ligneCommande } from '@/lib/commande-detail'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { LABELS_SERVICE } from '@/types/commande'
import { formatPrix } from '@/lib/commande-config'

const EMOJIS: Record<string, string> = { cv: '📄', visa: '🛂', job: '💼', tender: '📋' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id as string
  const prenom = (session.user as Record<string, unknown>).prenom as string || ''

  const [total, enCours, livrees, unread, recent] = await Promise.all([
    prisma.commande.count({ where: { userId } }),
    prisma.commande.count({ where: { userId, statut: { in: ['confirmed', 'processing'] } } }),
    prisma.commande.count({ where: { userId, statut: 'completed' } }),
    prisma.message.count({ where: { commande: { userId }, auteur: 'admin', lu: false } }),
    prisma.commande.findMany({ where: { userId }, orderBy: { created_at: 'desc' }, take: 5 }),
  ])

  const stats = [
    { label: 'Commandes totales', value: total, icon: '📦', color: '#0F7B5A' },
    { label: 'En cours', value: enCours, icon: '⚙️', color: '#2563EB' },
    { label: 'Livrées', value: livrees, icon: '✅', color: '#009460' },
    { label: 'Messages non lus', value: unread, icon: '💬', color: unread > 0 ? '#CE1126' : '#9CA3AF' },
  ]

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-black text-dark">Bonjour {prenom} 👋</h1>
        <p className="mt-1 text-sm text-gray-500">{today}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="font-heading text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-dark">Dernières commandes</h2>
          <Link href="/dashboard/commandes" className="text-sm font-medium text-primary hover:underline">Voir tout →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center shadow-sm">
            <span className="text-4xl text-gray-300">📦</span>
            <p className="mt-4 font-heading text-sm font-bold text-gray-400">Vous n&apos;avez pas encore de commande</p>
            <Link href="/commander" className="gp-btn gp-btn-primary mt-4 rounded-full text-sm font-bold">Commander un service</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">Référence</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Pack</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.ref}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span>{EMOJIS[c.service] || '📄'}</span>
                        <span className="font-medium text-dark">{LABELS_SERVICE[c.service as keyof typeof LABELS_SERVICE]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ligneCommande(c).libelle}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3 font-medium text-dark">{formatPrix(c.montant)}</td>
                    <td className="px-4 py-3"><StatusBadge statut={c.statut} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/commandes/${c.id}`} className="text-xs font-medium text-primary hover:underline">Voir</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
