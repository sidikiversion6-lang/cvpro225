'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { LABELS_SERVICE, LABELS_PACK } from '@/types/commande'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

function ConfirmationContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || 'CVP-XXXXXXXX'
  const service = params.get('service') || ''
  const pack = params.get('pack') || ''

  const serviceLabel = LABELS_SERVICE[service as keyof typeof LABELS_SERVICE] || service
  const packLabel = LABELS_PACK[pack] || pack

  const waMessage = `Bonjour, je viens de passer la commande réf ${ref} pour ${serviceLabel} — ${packLabel}. Pouvez-vous confirmer la réception ?`

  return (
    <section className="bg-[#FAFAF9] min-h-screen pt-32 pb-20">
      <div className="gp-container mx-auto max-w-2xl text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-vert/10 text-5xl">
          ✅
        </div>

        <h1 className="font-heading text-3xl font-black text-dark">
          Commande confirmée ! 🎉
        </h1>
        <p className="mt-3 text-gray-500">Votre commande a bien été reçue.</p>

        <div className="mx-auto mt-6 inline-block rounded-xl bg-gray-200 px-6 py-3 font-mono text-lg font-bold text-dark">
          Réf : {ref}
        </div>

        {service && (
          <p className="mt-3 text-sm text-gray-500">
            {serviceLabel} — {packLabel}
          </p>
        )}

        {/* Timeline prochaines étapes */}
        <div className="mx-auto mt-10 max-w-sm text-left">
          <div className="relative space-y-6 pl-8">
            <div className="absolute bottom-2 left-3 top-2 w-0.5 bg-gray-200" />

            <div className="relative">
              <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-vert ring-4 ring-[#FAFAF9]" />
              <p className="text-sm font-bold text-vert">✅ Commande reçue</p>
            </div>
            <div className="relative">
              <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-[#FAFAF9]" />
              <p className="text-sm font-medium text-dark">⏳ Confirmation WhatsApp sous 30 min</p>
            </div>
            <div className="relative">
              <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-[#FAFAF9]" />
              <p className="text-sm text-gray-500">⏳ Traitement par notre équipe</p>
            </div>
            <div className="relative">
              <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-[#FAFAF9]" />
              <p className="text-sm text-gray-500">⏳ Livraison dans les délais convenus</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gp-btn gp-btn-lg gp-btn-whatsapp rounded-full font-bold"
          >
            Confirmer sur WhatsApp →
          </a>
          <Link href="/" className="gp-btn gp-btn-lg gp-btn-outline rounded-full font-bold">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF9] pt-32 text-center text-gray-400">Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
