import { redirect } from 'next/navigation'
import { ligneCommande } from '@/lib/commande-detail'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SERVICE_COLORS } from '@/types/commande'

const EMOJIS: Record<string, string> = { cv: '📄', visa: '🛂', job: '💼', tender: '📋' }

export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const documents = await prisma.commande.findMany({
    where: { userId: session.user.id as string, statut: 'completed', livraison_url: { not: null } },
    orderBy: { delivered_at: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-dark">Mes documents</h1>
        <p className="mt-1 text-sm text-gray-500">Retrouvez tous vos documents livrés par CVPro225</p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center shadow-sm">
          <span className="text-4xl text-gray-300">📄</span>
          <p className="mt-4 text-sm text-gray-400">Vos documents apparaîtront ici une fois vos commandes livrées.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {documents.map((d) => {
            const color = SERVICE_COLORS[d.service as keyof typeof SERVICE_COLORS] || '#0F7B5A'
            const emoji = EMOJIS[d.service] || '📄'
            const date = d.delivered_at ? new Date(d.delivered_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

            return (
              <div key={d.id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${color}10` }}>
                  {emoji}
                </div>
                <h3 className="font-heading text-sm font-bold text-dark">
                  {ligneCommande(d).libelle}
                </h3>
                {date && <p className="mt-1 text-xs text-gray-400">Livré le {date}</p>}
                <p className="text-xs text-gray-400">Réf: {d.ref}</p>
                <a
                  href={d.livraison_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gp-btn gp-btn-primary mt-4 w-full rounded-lg text-center text-xs"
                >
                  Télécharger
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
