'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function ProfilPage() {
  const { data: session, update } = useSession()
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', ville: '' })
  const [pwd, setPwd] = useState({ current: '', nouveau: '', confirm: '' })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwdStatus, setPwdStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwdError, setPwdError] = useState('')

  useEffect(() => {
    if (session?.user) {
      const u = session.user as Record<string, unknown>
      setForm({
        prenom: (u.prenom as string) || '',
        nom: (u.nom as string) || '',
        telephone: (u.telephone as string) || '',
        ville: '',
      })
    }
  }, [session])

  const upd = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

  async function saveProfile() {
    setStatus('saving')
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('saved')
      update()
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    }
  }

  async function changePassword() {
    setPwdError('')
    if (pwd.nouveau !== pwd.confirm) { setPwdError('Les mots de passe ne correspondent pas'); return }
    if (pwd.nouveau.length < 8) { setPwdError('Minimum 8 caractères'); return }

    setPwdStatus('saving')
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.nouveau }),
      })
      const json = await res.json()
      if (!res.ok) { setPwdError(json.error || 'Erreur'); setPwdStatus('error'); return }
      setPwdStatus('saved')
      setPwd({ current: '', nouveau: '', confirm: '' })
      setTimeout(() => setPwdStatus('idle'), 3000)
    } catch {
      setPwdStatus('error')
    }
  }

  const initials = form.prenom && form.nom ? `${form.prenom[0]}${form.nom[0]}` : '?'

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 font-heading text-2xl font-black text-dark">Mon profil</h1>

      {/* Avatar */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="font-heading text-lg font-bold text-dark">{form.prenom} {form.nom}</p>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
      </div>

      {/* Infos */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-bold text-dark">Informations personnelles</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Prénom</label>
              <input value={form.prenom} onChange={(e) => upd('prenom', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Nom</label>
              <input value={form.nom} onChange={(e) => upd('nom', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Email</label>
            <input value={session?.user?.email || ''} disabled className={`${inputCls} bg-gray-50 text-gray-400`} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Téléphone WhatsApp</label>
            <input value={form.telephone} onChange={(e) => upd('telephone', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Ville</label>
            <input value={form.ville} onChange={(e) => upd('ville', e.target.value)} className={inputCls} placeholder="Abidjan, Bouaké..." />
          </div>
        </div>
        <button onClick={saveProfile} disabled={status === 'saving'} className="gp-btn gp-btn-primary mt-6 rounded-full px-8 font-bold">
          {status === 'saving' ? 'Enregistrement...' : status === 'saved' ? 'Profil mis à jour ✓' : 'Sauvegarder'}
        </button>
      </div>

      {/* Mot de passe */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-bold text-dark">Sécurité</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Mot de passe actuel</label>
            <input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Nouveau mot de passe</label>
            <input type="password" value={pwd.nouveau} onChange={(e) => setPwd((p) => ({ ...p, nouveau: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Confirmer</label>
            <input type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} className={inputCls} />
          </div>
        </div>
        {pwdError && <p className="mt-2 text-sm text-rouge">{pwdError}</p>}
        <button onClick={changePassword} disabled={pwdStatus === 'saving'} className="gp-btn mt-4 rounded-full border-2 border-dark px-8 font-bold text-dark hover:bg-dark hover:text-white">
          {pwdStatus === 'saving' ? 'Modification...' : pwdStatus === 'saved' ? 'Mot de passe changé ✓' : 'Changer le mot de passe'}
        </button>
      </div>
    </div>
  )
}
