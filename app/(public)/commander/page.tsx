import type { Metadata } from 'next'
import { Suspense } from 'react'
import CommandeForm from '@/components/commander/CommandeForm'

export const metadata: Metadata = {
  title: 'Commander — CVPro225',
  description: 'Commandez votre service CVPro225 : CV Pro, JobAssist ou TenderPro.',
}

export default function CommanderPage() {
  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-20">
      <Suspense fallback={<div className="py-20 text-center text-gray-400">Chargement...</div>}>
        <CommandeForm />
      </Suspense>
    </section>
  )
}
