'use client'

import { useState, useEffect } from 'react'
import { formatPrix } from '@/lib/commande-config'

interface Feature { id: string; label: string; inclus: boolean; ordre: number }
interface PackData { id: string; slug: string; nom: string; prix: number; delai: string; recommande: boolean; badge: string | null; actif: boolean; features: Feature[] }
interface ServiceData { id: string; slug: string; nom: string; icone: string; couleur: string; packs: PackData[] }

export default function AdminPrixPage() {
  const [services, setServices] = useState<ServiceData[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then((d) => setServices(d.data || []))
  }, [])

  function updatePack(svcIdx: number, packIdx: number, field: string, value: unknown) {
    setServices((prev) => {
      const next = [...prev]
      const packs = [...next[svcIdx].packs]
      packs[packIdx] = { ...packs[packIdx], [field]: value }
      next[svcIdx] = { ...next[svcIdx], packs }
      return next
    })
  }

  function updateFeature(svcIdx: number, packIdx: number, featIdx: number, field: string, value: unknown) {
    setServices((prev) => {
      const next = [...prev]
      const features = [...next[svcIdx].packs[packIdx].features]
      features[featIdx] = { ...features[featIdx], [field]: value }
      next[svcIdx].packs[packIdx] = { ...next[svcIdx].packs[packIdx], features }
      return next
    })
  }

  async function savePack(pack: PackData) {
    setSaving(pack.id)
    await fetch(`/api/admin/packs/${pack.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: pack.nom, prix: pack.prix, delai: pack.delai,
        recommande: pack.recommande, badge: pack.badge, actif: pack.actif,
        features: pack.features,
      }),
    })
    setSaving(null)
  }

  if (!services.length) return <div className="py-20 text-center text-gray-400">Chargement...</div>

  const svc = services[activeTab]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-dark">Tarifs & Prix des packs</h1>
        <p className="mt-1 text-sm text-gray-500">Les modifications sont appliquées immédiatement sur le site</p>
      </div>

      <div className="mb-6 flex gap-2">
        {services.map((s, i) => (
          <button key={s.id} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === i ? 'text-white' : 'bg-white text-gray-600 border'}`}
            style={activeTab === i ? { backgroundColor: s.couleur } : undefined}>
            <span>{s.icone}</span> {s.nom}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {svc.packs.map((pack, pIdx) => (
          <div key={pack.id} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <input value={pack.nom} onChange={(e) => updatePack(activeTab, pIdx, 'nom', e.target.value)}
                className="font-heading text-lg font-bold text-dark border-b border-transparent focus:border-primary outline-none" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={pack.recommande} onChange={(e) => updatePack(activeTab, pIdx, 'recommande', e.target.checked)} className="accent-primary" />
                  Recommandé
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={pack.actif} onChange={(e) => updatePack(activeTab, pIdx, 'actif', e.target.checked)} className="accent-vert" />
                  Actif
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Prix (FCFA)</label>
                <input type="number" value={pack.prix} onChange={(e) => updatePack(activeTab, pIdx, 'prix', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-center font-heading text-xl font-bold text-dark outline-none focus:border-primary" />
                <p className="mt-1 text-center text-xs text-gray-400">{formatPrix(pack.prix)}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Délai</label>
                <input value={pack.delai} onChange={(e) => updatePack(activeTab, pIdx, 'delai', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Badge</label>
                <input value={pack.badge || ''} onChange={(e) => updatePack(activeTab, pIdx, 'badge', e.target.value || null)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary" placeholder="ex: Recommandé" />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-gray-500">Fonctionnalités incluses</p>
              <div className="space-y-2">
                {pack.features.map((f, fIdx) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <button onClick={() => updateFeature(activeTab, pIdx, fIdx, 'inclus', !f.inclus)}
                      className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${f.inclus ? 'bg-vert' : 'bg-gray-300'}`}>
                      {f.inclus ? '✓' : '✗'}
                    </button>
                    <input value={f.label} onChange={(e) => updateFeature(activeTab, pIdx, fIdx, 'label', e.target.value)}
                      className="flex-1 rounded border border-transparent px-2 py-1 text-sm text-gray-700 outline-none focus:border-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => savePack(pack)} disabled={saving === pack.id}
              className="gp-btn gp-btn-primary mt-4 rounded-lg text-sm font-bold" style={{ backgroundColor: svc.couleur }}>
              {saving === pack.id ? 'Sauvegarde...' : 'Sauvegarder ce pack'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
