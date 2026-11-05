'use client'

import { useState, useEffect } from 'react'

interface Config { id: string; cle: string; valeur: string; type: string; groupe: string; label: string }

const GROUPES = [
  { key: 'contact', label: 'Contact & Coordonnées' },
  { key: 'accueil', label: 'Page d\'accueil' },
  { key: 'stats', label: 'Statistiques' },
  { key: 'systeme', label: 'Système' },
]

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [activeGroupe, setActiveGroupe] = useState('contact')
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((d) => setConfigs(d.data || []))
  }, [])

  function updateValue(cle: string, valeur: string) {
    setConfigs((prev) => prev.map((c) => c.cle === cle ? { ...c, valeur } : c))
  }

  async function saveConfig(config: Config) {
    setSaving(config.cle)
    await fetch('/api/admin/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cle: config.cle, valeur: config.valeur }),
    })
    setSaving(null)
    setSaved(config.cle)
    setTimeout(() => setSaved(null), 2000)
  }

  const filtered = configs.filter((c) => c.groupe === activeGroupe)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-dark">Configuration du site</h1>
        <p className="mt-1 text-sm text-gray-500">Paramètres globaux de CVPro225</p>
      </div>

      <div className="mb-6 flex gap-2">
        {GROUPES.map((g) => (
          <button key={g.key} onClick={() => setActiveGroupe(g.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeGroupe === g.key ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>
            {g.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((config) => (
          <div key={config.cle} className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-dark">{config.label}</label>
            {config.type === 'textarea' ? (
              <textarea value={config.valeur} onChange={(e) => updateValue(config.cle, e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary" />
            ) : config.type === 'boolean' ? (
              <div className="flex items-center gap-3">
                <button onClick={() => updateValue(config.cle, config.valeur === 'true' ? 'false' : 'true')}
                  className={`relative h-6 w-11 rounded-full transition-colors ${config.valeur === 'true' ? 'bg-vert' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${config.valeur === 'true' ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-gray-600">{config.valeur === 'true' ? 'Activé' : 'Désactivé'}</span>
              </div>
            ) : (
              <input type={config.type === 'email' ? 'email' : config.type === 'url' ? 'url' : 'text'}
                value={config.valeur} onChange={(e) => updateValue(config.cle, e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary" />
            )}
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => saveConfig(config)} disabled={saving === config.cle}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {saving === config.cle ? 'Sauvegarde...' : saved === config.cle ? 'Sauvegardé ✓' : 'Sauvegarder'}
              </button>
              <span className="text-xs text-gray-400">Clé : {config.cle}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-gray-400">Aucune configuration dans ce groupe</div>}
      </div>
    </div>
  )
}
