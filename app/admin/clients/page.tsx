import { prisma } from '@/lib/prisma'

export default async function AdminClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: 'client' },
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { commandes: true } } },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-dark">Clients</h1>
        <p className="mt-1 text-sm text-gray-500">{clients.length} client(s) inscrits</p>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Commandes</th>
              <th className="px-4 py-3">Inscription</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {c.prenom[0]}{c.nom[0]}
                    </div>
                    <span className="font-medium text-dark">{c.prenom} {c.nom}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.telephone || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{c.ville || '—'}</td>
                <td className="px-4 py-3 font-medium text-dark">{c._count.commandes}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">Aucun client inscrit</div>
        )}
      </div>
    </div>
  )
}
