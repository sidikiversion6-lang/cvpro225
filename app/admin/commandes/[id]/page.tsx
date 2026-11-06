import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ligneCommande, lienCollecteInfos } from '@/lib/commande-detail'
import { formatFcfa } from '@/lib/offres'
import StatusBadge from '@/components/dashboard/StatusBadge'
import CommandeStatutForm from '@/components/admin/CommandeStatutForm'

export const dynamic = 'force-dynamic'

const fmt = (d: Date | null) =>
  d ? d.toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan', dateStyle: 'medium', timeStyle: 'short' }) : '—'

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-50 py-2.5 sm:flex-row sm:gap-4">
      <dt className="w-44 flex-shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-dark">{children}</dd>
    </div>
  )
}

/** Détail d'une commande (accès admin : protégé par app/admin/layout.tsx). */
export default async function AdminCommandeDetailPage({ params }: { params: { id: string } }) {
  const c = await prisma.commande.findUnique({ where: { id: params.id } })
  if (!c) notFound()

  const l = ligneCommande(c)
  const d = (c.details && typeof c.details === 'object' ? c.details : {}) as Record<string, unknown>
  const nom = (typeof d.nom_complet === 'string' && d.nom_complet) || [c.prenom, c.nom].filter(Boolean).join(' ')
  const tel = c.telephone.replace(/\D/g, '')
  const brief = (['secteur', 'poste', 'experience', 'formation', 'notes'] as const).filter((k) => typeof d[k] === 'string' && d[k])

  return (
    <div>
      <Link href="/admin/commandes" className="text-sm text-gray-500 hover:text-dark">← Commandes</Link>

      <div className="mb-6 mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-black text-dark">Commande {c.ref}</h1>
        <StatusBadge statut={c.statut} />
        {c.a_un_cv === false && (
          <span className="rounded-full bg-rouge/10 px-3 py-1 text-xs font-bold text-rouge">⚠️ Pas de CV — à contacter sur WhatsApp</span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-heading text-base font-bold text-dark">Commande</h2>
            <dl>
              <Ligne label="Offre">{l.offreNom}{l.tarif === 'lancement' && <span className="ml-2 text-xs text-amber-700">(prix de lancement)</span>}</Ligne>
              <Ligne label="Option Express">{l.express ? `Oui (+${formatFcfa(l.prixExpress ?? 0)})` : 'Non'}</Ligne>
              <Ligne label="Montant">
                <strong>{formatFcfa(c.montant)}</strong>
                {l.prixOffre !== null && <span className="ml-2 text-xs text-gray-500">({formatFcfa(l.prixOffre)}{l.express ? ` + ${formatFcfa(l.prixExpress ?? 0)}` : ''})</span>}
              </Ligne>
              <Ligne label="Délai">{l.delai || '—'}</Ligne>
              <Ligne label="Créée le">{fmt(c.created_at)}</Ligne>
              <Ligne label="Payée le">{fmt(c.paid_at)}{c.paydunya_status && <span className="ml-2 text-xs text-gray-500">PayDunya : {c.paydunya_status}</span>}</Ligne>
              <Ligne label="Livrée le">{fmt(c.delivered_at)}</Ligne>
            </dl>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-heading text-base font-bold text-dark">Client</h2>
            <dl>
              <Ligne label="Nom complet">{nom || '—'}</Ligne>
              <Ligne label="WhatsApp">
                <a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" className="font-medium text-vert hover:underline">+{tel}</a>
              </Ligne>
              <Ligne label="Email">{c.email || <em className="text-gray-400">non fourni (aucun email client envoyé)</em>}</Ligne>
              <Ligne label="A un CV">{c.a_un_cv === true ? 'Oui' : c.a_un_cv === false ? 'Non' : '—'}</Ligne>
              <Ligne label="CV">
                {c.cv_fichier ? (
                  <a href={`/api/admin/commandes/cv?id=${c.id}`} className="font-medium text-primary hover:underline">📄 Télécharger (lien valable 15 min)</a>
                ) : typeof d.cv_purge_le === 'string' ? (
                  <span className="text-gray-500">Supprimé le {fmt(new Date(d.cv_purge_le))} (conservation 90 jours après livraison)</span>
                ) : c.a_un_cv ? (
                  <span className="text-gray-500">Fourni, non stocké : voir la pièce jointe de l’email admin</span>
                ) : '—'}
              </Ligne>
              {brief.map((k) => <Ligne key={k} label={k[0].toUpperCase() + k.slice(1)}>{String(d[k])}</Ligne>)}
            </dl>
            {c.a_un_cv === false && (
              <a href={lienCollecteInfos(c)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
                💬 Demander ses informations sur WhatsApp (message pré-rempli)
              </a>
            )}
          </section>
        </div>

        <section className="h-fit rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-heading text-base font-bold text-dark">Changer le statut</h2>
          <CommandeStatutForm id={c.id} statut={c.statut} livraisonUrl={c.livraison_url} livraisonNote={c.livraison_note} emailClient={Boolean(c.email)} />
        </section>
      </div>
    </div>
  )
}
