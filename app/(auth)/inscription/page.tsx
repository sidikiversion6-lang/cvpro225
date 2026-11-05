'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InscriptionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', password: '', confirmPassword: '' })
  const [cgv, setCgv] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const pwdStrength = () => {
    const p = form.password
    if (p.length < 8) return { label: 'Trop court', color: '#CE1126', width: '20%' }
    const hasUpper = /[A-Z]/.test(p)
    const hasDigit = /[0-9]/.test(p)
    if (hasUpper && hasDigit && p.length >= 10) return { label: 'Fort', color: '#009460', width: '100%' }
    if (hasUpper || hasDigit) return { label: 'Moyen', color: '#D97706', width: '60%' }
    return { label: 'Faible', color: '#CE1126', width: '33%' }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (form.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return }
    if (!/[A-Z]/.test(form.password)) { setError('Le mot de passe doit contenir au moins 1 majuscule'); return }
    if (!/[0-9]/.test(form.password)) { setError('Le mot de passe doit contenir au moins 1 chiffre'); return }
    if (!cgv) { setError('Veuillez accepter les conditions générales'); return }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Erreur')

      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
  const strength = pwdStrength()

  return (
    <div className="flex min-h-screen">
      {/* Colonne gauche */}
      <div className="hidden flex-col justify-between bg-dark p-12 lg:flex lg:w-1/2">
        <div className="max-w-sm">
          <h2 className="font-heading text-3xl font-extrabold text-white">Créez votre espace client gratuitement</h2>
          <p className="mt-4 text-white/50">Suivez vos commandes, téléchargez vos documents et communiquez avec notre équipe.</p>
        </div>
        <div className="flex gap-1.5">
          <div className="h-2 w-8 rounded-full bg-rouge" /><div className="h-2 w-8 rounded-full bg-jaune" /><div className="h-2 w-8 rounded-full bg-vert" />
        </div>
      </div>

      {/* Colonne droite */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 block text-center text-2xl font-extrabold lg:hidden">
            <span className="text-dark">Pro</span><span className="text-primary">224</span>
          </Link>

          <h1 className="font-heading text-2xl font-black text-dark">Créer un compte</h1>
          <p className="mt-1 text-sm text-gray-500">Rejoignez CVPro225 en quelques secondes</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Prénom *</label>
                <input value={form.prenom} onChange={(e) => update('prenom', e.target.value)} required className={inputCls} placeholder="Votre prénom" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Nom *</label>
                <input value={form.nom} onChange={(e) => update('nom', e.target.value)} required className={inputCls} placeholder="Votre nom" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required className={inputCls} placeholder="votre@email.com" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Téléphone WhatsApp *</label>
              <input type="tel" value={form.telephone} onChange={(e) => update('telephone', e.target.value)} required className={inputCls} placeholder="+225 07 99 07 62 41" />
              <p className="mt-1 text-xs text-gray-400">Nous vous contacterons sur ce numéro</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Mot de passe *</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required className={inputCls} placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre" />
              {form.password && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-gray-200"><div className="h-full rounded-full transition-all" style={{ width: strength.width, backgroundColor: strength.color }} /></div>
                  <p className="mt-1 text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Confirmer le mot de passe *</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required className={inputCls} placeholder="Retapez votre mot de passe" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary" />
              <span className="text-xs text-gray-600">
                J&apos;accepte les <Link href="/cgv" className="font-medium text-primary hover:underline">Conditions Générales</Link> et la <Link href="/confidentialite" className="font-medium text-primary hover:underline">Politique de confidentialité</Link>
              </span>
            </label>

            {error && <p className="rounded-lg bg-rouge/5 px-4 py-2 text-sm text-rouge">{error}</p>}

            <button type="submit" disabled={loading} className="gp-btn gp-btn-primary w-full rounded-full py-3.5 font-bold disabled:opacity-50">
              {loading ? 'Création en cours...' : 'Créer mon compte →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ? <Link href="/login" className="font-semibold text-primary hover:underline">Se connecter →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
