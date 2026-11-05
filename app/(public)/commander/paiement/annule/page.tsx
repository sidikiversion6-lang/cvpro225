'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

function AnnuleContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || ''

  const waMessage = `Bonjour, je souhaite payer ma commande réf ${ref} via mobile money. Pouvez-vous m'envoyer les instructions ?`

  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-32 pb-20">
      <div className="gp-container mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rouge/10 text-5xl">
          ❌
        </div>

        <h1 className="font-heading text-2xl font-black text-dark">Paiement annulé</h1>
        <p className="mt-3 text-sm text-gray-500">
          Votre commande a été enregistrée mais le paiement n&apos;a pas été complété. Vous pouvez réessayer quand vous voulez.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link href={`/commander?ref=${ref}`} className="gp-btn gp-btn-primary rounded-full font-bold">
            Réessayer le paiement
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`}
            target="_blank" rel="noopener noreferrer"
            className="gp-btn gp-btn-whatsapp rounded-full font-bold"
          >
            Payer via WhatsApp
          </a>
        </div>

        <div className="mt-8 rounded-xl bg-white p-4 text-sm text-gray-500">
          <p>
            Votre commande {ref && <span className="font-mono font-bold text-dark">({ref})</span>} est sauvegardée. Vous avez 48h pour finaliser le paiement.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function AnnulePaiementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF9] pt-32 text-center text-gray-400">Chargement...</div>}>
      <AnnuleContent />
    </Suspense>
  )
}
