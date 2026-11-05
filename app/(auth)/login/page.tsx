'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-sm text-dark outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'

  return (
    <div className="flex min-h-screen">
      {/* Colonne gauche — visuelle */}
      <div className="hidden flex-col justify-between bg-dark p-12 lg:flex lg:w-1/2">
        <div className="max-w-sm">
          <h2 className="font-heading text-3xl font-extrabold text-white">
            Votre partenaire professionnel en Côte d&apos;Ivoire
          </h2>
          <div className="mt-8 space-y-4">
            {['Suivez vos commandes en temps réel', 'Téléchargez vos documents livrés', 'Communiquez avec votre conseiller'].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <svg className="h-5 w-5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span className="text-sm text-white/70">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-2 w-8 rounded-full bg-rouge" />
          <div className="h-2 w-8 rounded-full bg-jaune" />
          <div className="h-2 w-8 rounded-full bg-vert" />
        </div>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 block text-center text-2xl font-extrabold lg:hidden">
            <span className="text-dark">Pro</span><span className="text-primary">224</span>
          </Link>

          <h1 className="font-heading text-2xl font-black text-dark">Bon retour !</h1>
          <p className="mt-1 text-sm text-gray-500">Connectez-vous à votre espace client</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Adresse email</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400">✉️</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" className={inputCls} />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-dark">Mot de passe</label>
                <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-primary hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400">🔒</span>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={inputCls} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-3.5 text-xs text-gray-400 hover:text-gray-600">
                  {showPwd ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg bg-rouge/5 px-4 py-2 text-sm text-rouge">{error}</p>}

            <button type="submit" disabled={loading} className="gp-btn gp-btn-primary w-full rounded-full py-3.5 font-bold disabled:opacity-50">
              {loading ? 'Connexion en cours...' : 'Se connecter →'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <a
            href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour, je souhaite accéder à mon espace client.')}`}
            target="_blank" rel="noopener noreferrer"
            className="gp-btn gp-btn-whatsapp w-full rounded-full py-3.5 font-bold"
          >
            Accéder via WhatsApp
          </a>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="font-semibold text-primary hover:underline">Créez-en un gratuitement →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  )
}
