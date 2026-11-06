'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUTS: Array<{ value: string; label: string }> = [
  { value: 'pending', label: 'En attente (non payée)' },
  { value: 'confirmed', label: 'Confirmée (payée)' },
  { value: 'processing', label: 'En cours de rédaction' },
  { value: 'completed', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

export default function CommandeStatutForm({ id, statut, livraisonUrl, livraisonNote, emailClient }: {
  id: string
  statut: string
  livraisonUrl: string | null
  livraisonNote: string | null
  emailClient: boolean
}) {
  const router = useRouter()
  const [s, setS] = useState(statut)
  const [url, setUrl] = useState(livraisonUrl || '')
  const [note, setNote] = useState(livraisonNote || '')
  const [etat, setEtat] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [erreur, setErreur] = useState('')

  async function enregistrer() {
    setEtat('saving')
    setErreur('')
    try {
      const res = await fetch('/api/admin/commandes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut: s, livraison_url: url, livraison_note: note }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erreur')
      setEtat('ok')
      router.refresh()
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur')
      setEtat('error')
    }
  }

  const passeLivree = s === 'completed' && statut !== 'completed'

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="statut" className="mb-1 block text-sm font-semibold text-dark">Statut</label>
        <select id="statut" value={s} onChange={(e) => setS(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
          {STATUTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="url" className="mb-1 block text-sm font-semibold text-dark">Lien de livraison <span className="font-normal text-gray-400">(optionnel)</span></label>
        <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-semibold text-dark">Note au client <span className="font-normal text-gray-400">(optionnelle)</span></label>
        <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      </div>
      {passeLivree && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          Passer en « Livrée » enregistre la date de livraison (le CV stocké sera supprimé 90 jours plus tard)
          {emailClient ? ' et envoie l’email de livraison au client.' : '. Pas d’email client : prévenez-le sur WhatsApp.'}
        </p>
      )}
      <button type="button" onClick={enregistrer} disabled={etat === 'saving'} className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary-600 disabled:opacity-50">
        {etat === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      {etat === 'ok' && <p className="text-sm text-vert">✓ Enregistré</p>}
      {etat === 'error' && <p className="text-sm text-rouge">{erreur}</p>}
    </div>
  )
}
