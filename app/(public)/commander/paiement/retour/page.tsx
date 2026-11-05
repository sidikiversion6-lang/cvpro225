'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

function RetourContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || ''
  const [statut, setStatut] = useState<'loading' | 'confirmed' | 'pending'>('loading')

  useEffect(() => {
    if (!ref) { setStatut('pending'); return }

    async function check() {
      try {
        const res = await fetch(`/api/commandes/status?ref=${ref}`)
        const json = await res.json()
        setStatut(json.statut === 'confirmed' ? 'confirmed' : 'pending')
      } catch {
        setStatut('pending')
      }
    }
    check()
  }, [ref])

  const waMessage = `Bonjour, j'ai payé ma commande réf ${ref}. Pouvez-vous confirmer la prise en charge ?`

  if (statut === 'loading') {
    return (
      <section className="min-h-screen bg-[#FAFAF9] pt-32 pb-20">
        <div className="gp-container mx-auto max-w-md text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          <p className="mt-4 text-gray-500">Vérification du paiement...</p>
        </div>
      </section>
    )
  }

  if (statut === 'confirmed') {
    return (
      <section className="min-h-screen bg-[#FAFAF9] pt-32 pb-20">
        <div className="gp-container mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-vert/10 text-5xl">✅</div>
          <h1 className="font-heading text-3xl font-black text-dark">Paiement confirmé !</h1>
          <p className="mt-3 text-gray-500">Votre paiement a été reçu. Votre commande est maintenant en cours de traitement.</p>
          <div className="mx-auto mt-6 inline-block rounded-xl bg-gray-200 px-6 py-3 font-mono text-lg font-bold text-dark">
            Réf : {ref}
          </div>
          <p className="mt-3 text-sm text-gray-400">Un email de confirmation a été envoyé à votre adresse.</p>

          <div className="mx-auto mt-10 max-w-sm text-left">
            <div className="relative space-y-6 pl-8">
              <div className="absolute bottom-2 left-3 top-2 w-0.5 bg-gray-200" />
              <div className="relative"><div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-vert ring-4 ring-[#FAFAF9]" /><p className="text-sm font-bold text-vert">✅ Commande reçue</p></div>
              <div className="relative"><div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-vert ring-4 ring-[#FAFAF9]" /><p className="text-sm font-bold text-vert">✅ Paiement confirmé</p></div>
              <div className="relative"><div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-[#FAFAF9]" /><p className="text-sm font-medium text-dark">⏳ Traitement en cours</p></div>
              <div className="relative"><div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-[#FAFAF9]" /><p className="text-sm text-gray-500">⏳ Livraison</p></div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`}
              target="_blank" rel="noopener noreferrer"
              className="gp-btn gp-btn-lg gp-btn-whatsapp rounded-full font-bold"
            >
              Suivre sur WhatsApp →
            </a>
            <Link href="/" className="gp-btn gp-btn-lg gp-btn-outline rounded-full font-bold">Retour à l&apos;accueil</Link>
          </div>
        </div>
      </section>
    )
  }

  // Pending
  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-32 pb-20">
      <div className="gp-container mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-5xl">⏳</div>
        <h1 className="font-heading text-2xl font-black text-dark">Vérification du paiement...</h1>
        <p className="mt-3 text-sm text-gray-500">
          Votre paiement est en cours de vérification. Cela peut prendre quelques minutes.
        </p>
        <button onClick={() => window.location.reload()} className="gp-btn gp-btn-primary mt-6 rounded-full font-bold">
          Actualiser
        </button>
        <p className="mt-4 text-xs text-gray-400">
          Si le problème persiste,{' '}
          <a href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
            contactez-nous sur WhatsApp
          </a>.
        </p>
      </div>
    </section>
  )
}

export default function RetourPaiementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF9] pt-32 text-center text-gray-400">Chargement...</div>}>
      <RetourContent />
    </Suspense>
  )
}
