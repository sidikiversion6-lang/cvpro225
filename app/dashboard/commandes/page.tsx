import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CommandeCard from '@/components/dashboard/CommandeCard'

export default async function CommandesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const commandes = await prisma.commande.findMany({
    where: { userId: session.user.id as string },
    orderBy: { created_at: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-dark">Mes commandes</h1>
        <p className="mt-1 text-sm text-gray-500">({commandes.length} commande{commandes.length > 1 ? 's' : ''})</p>
      </div>

      {commandes.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center shadow-sm">
          <span className="text-4xl text-gray-300">📦</span>
          <p className="mt-4 text-sm text-gray-400">Aucune commande pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {commandes.map((c) => (
            <CommandeCard
              key={c.id}
              id={c.id}
              ref={c.ref}
              service={c.service}
              pack={c.pack}
              montant={c.montant}
              details={c.details}
              statut={c.statut}
              created_at={c.created_at}
              livraison_url={c.livraison_url}
            />
          ))}
        </div>
      )}
    </div>
  )
}
