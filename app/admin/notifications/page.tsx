import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { created_at: 'desc' },
    take: 50,
  })

  const ICONS: Record<string, string> = {
    commande: '📦', paiement: '💰', message: '💬', systeme: '⚙️',
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-black text-dark">Notifications</h1>
        <form action="/api/admin/notifications/marquer-tout-lu" method="POST">
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Tout marquer comme lu
          </button>
        </form>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border p-4 transition-colors ${n.lu ? 'border-gray-100 bg-white' : 'border-primary/20 bg-primary/5'}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{ICONS[n.type] || '🔔'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-dark">{n.titre}</p>
                <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              {n.lien && (
                <Link href={n.lien} className="text-xs font-medium text-primary hover:underline">Voir →</Link>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="rounded-xl bg-white py-12 text-center text-sm text-gray-400">Aucune notification</div>
        )}
      </div>
    </div>
  )
}
