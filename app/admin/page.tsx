import { prisma } from '@/lib/prisma'
import { ligneCommande } from '@/lib/commande-detail'
import Link from 'next/link'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { formatPrix } from '@/lib/commande-config'

export default async function AdminDashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    commandesToday, commandesTotal, pendingCount, clientsTotal, unreadMessages,
    revenueMonth, completedCount, recentCommandes,
  ] = await Promise.all([
    prisma.commande.count({ where: { created_at: { gte: today } } }),
    prisma.commande.count(),
    prisma.commande.count({ where: { statut: { in: ['pending', 'confirmed'] } } }),
    prisma.user.count({ where: { role: 'client' } }),
    prisma.message.count({ where: { auteur: 'client', lu: false } }),
    prisma.commande.aggregate({
      where: { statut: { in: ['confirmed', 'completed'] }, created_at: { gte: monthStart } },
      _sum: { montant: true },
    }),
    prisma.commande.count({ where: { statut: 'completed' } }),
    prisma.commande.findMany({ orderBy: { created_at: 'desc' }, take: 8, include: { user: { select: { prenom: true, nom: true } } } }),
  ])

  const revenue = revenueMonth._sum.montant || 0
  const convRate = commandesTotal > 0 ? Math.round((completedCount / commandesTotal) * 100) : 0

  const stats = [
    { label: 'Commandes aujourd\'hui', value: commandesToday, icon: '📦', color: '#0F7B5A' },
    { label: 'Revenus du mois', value: formatPrix(revenue), icon: '💰', color: '#009460' },
    { label: 'En attente', value: pendingCount, icon: '⏳', color: pendingCount > 0 ? '#CE1126' : '#9CA3AF', link: '/admin/commandes?statut=pending' },
    { label: 'Clients total', value: clientsTotal, icon: '👥', color: '#2563EB' },
    { label: 'Messages non lus', value: unreadMessages, icon: '💬', color: unreadMessages > 0 ? '#CE1126' : '#9CA3AF', link: '/admin/messages' },
    { label: 'Taux de conversion', value: `${convRate}%`, icon: '📈', color: '#7C3AED' },
  ]

  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-black text-dark">Tableau de bord Admin</h1>
        <p className="mt-1 text-sm text-gray-500">{dateStr}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="font-heading text-2xl font-black" style={{ color: s.color }}>
                {typeof s.value === 'number' ? s.value : s.value}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">{s.label}</p>
            {s.link && (
              <Link href={s.link} className="mt-1 block text-xs font-medium text-primary hover:underline">
                Voir →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-dark">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-sm font-medium text-primary hover:underline">Voir tout →</Link>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="px-4 py-3">Réf</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentCommandes.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.ref}</td>
                  <td className="px-4 py-3 text-dark">{c.prenom} {c.nom}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {ligneCommande(c).libelle}
                  </td>
                  <td className="px-4 py-3 font-medium text-dark">{formatPrix(c.montant)}</td>
                  <td className="px-4 py-3"><StatusBadge statut={c.statut} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
