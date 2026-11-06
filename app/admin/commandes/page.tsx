import { prisma } from '@/lib/prisma'
import { ligneCommande, lienCollecteInfos } from '@/lib/commande-detail'
import Link from 'next/link'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { formatPrix } from '@/lib/commande-config'

export default async function AdminCommandesPage({ searchParams }: { searchParams: { statut?: string; service?: string; filtre?: string } }) {
  const aContacter = searchParams.filtre === 'a-contacter'
  const where: Record<string, unknown> = {}
  if (searchParams.statut) where.statut = searchParams.statut
  if (searchParams.service) where.service = searchParams.service
  // « À contacter » : commandes PAYÉES dont le client n'a pas fourni de CV
  if (aContacter) {
    where.a_un_cv = false
    where.paid_at = { not: null }
  }

  const commandes = await prisma.commande.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: 100,
  })

  const statuts = ['pending', 'confirmed', 'processing', 'completed', 'cancelled']

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-dark">Commandes</h1>
          <p className="mt-1 text-sm text-gray-500">{commandes.length} commande(s)</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/commandes" className={`rounded-full px-4 py-1.5 text-xs font-semibold ${!searchParams.statut && !aContacter ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>
          Toutes
        </Link>
        <Link href="/admin/commandes?filtre=a-contacter" className={`rounded-full px-4 py-1.5 text-xs font-semibold ${aContacter ? 'bg-rouge text-white' : 'border border-rouge/40 bg-white text-rouge'}`}>
          ⚠️ À contacter (payées sans CV)
        </Link>
        {statuts.map((s) => (
          <Link key={s} href={`/admin/commandes?statut=${s}`} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${searchParams.statut === s ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>
            <StatusBadge statut={s} />
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
              <th className="px-4 py-3">Réf</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">CV</th>
              <th className="px-4 py-3">Service / Pack</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.ref}</td>
                <td className="px-4 py-3 font-medium text-dark">{[c.prenom, c.nom].filter(Boolean).join(' ')}</td>
                <td className="px-4 py-3 text-gray-500">
                  <a href={`https://wa.me/${c.telephone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="block text-xs font-medium text-vert hover:underline">+{c.telephone}</a>
                  <span className="text-xs">{c.email || <em className="text-gray-400">pas d’email</em>}</span>
                </td>
                <td className="px-4 py-3">
                  {c.a_un_cv === false ? (
                    <a href={lienCollecteInfos(c)} target="_blank" rel="noopener noreferrer" className="inline-block whitespace-nowrap rounded-full bg-rouge/10 px-2.5 py-1 text-xs font-bold text-rouge hover:bg-rouge/20">
                      ⚠️ Pas de CV — à contacter sur WhatsApp
                    </a>
                  ) : c.cv_fichier ? (
                    <a href={`/api/admin/commandes/cv?id=${c.id}`} className="text-xs font-medium text-primary hover:underline">📄 Télécharger</a>
                  ) : c.a_un_cv ? (
                    <span className="text-xs text-gray-400">fourni (email admin)</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {ligneCommande(c).libelle}
                </td>
                <td className="px-4 py-3 font-medium text-dark">{formatPrix(c.montant)}</td>
                <td className="px-4 py-3"><StatusBadge statut={c.statut} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/commandes/${c.id}`} className="text-xs font-medium text-primary hover:underline">Gérer</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {commandes.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">Aucune commande trouvée</div>
        )}
      </div>
    </div>
  )
}
