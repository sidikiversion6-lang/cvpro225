import type { Metadata } from 'next'
import { Suspense } from 'react'
import CommandeForm from '@/components/commander/CommandeForm'
import {
  EXPRESS,
  LAUNCH_BADGE,
  PLUS_CHOISI_BADGE,
  isLaunchActive,
  launchEndLabel,
  offresAffichees,
} from '@/lib/offres'
import { isPaydunyaConfigured } from '@/lib/paydunya'

export const metadata: Metadata = {
  title: 'Commander — CVPro225',
  description: 'Commandez votre CV Pro ATS, CV + Lettre de motivation ou JobAssist. Option Express 24h.',
}

// Prix calculés à chaque requête : la fin de l'offre de lancement s'applique sans redéploiement.
export const dynamic = 'force-dynamic'

export default function CommanderPage() {
  const launch = isLaunchActive()
  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-20">
      <Suspense fallback={<div className="py-20 text-center text-gray-400">Chargement...</div>}>
        <CommandeForm
          offres={offresAffichees()}
          express={{ nom: EXPRESS.nom, prix: EXPRESS.prix, delai: EXPRESS.delai, description: EXPRESS.description }}
          launchBadge={launch ? LAUNCH_BADGE : null}
          plusChoisiBadge={PLUS_CHOISI_BADGE}
          finLancement={launch ? launchEndLabel() : null}
          paymentOnline={isPaydunyaConfigured()}
        />
      </Suspense>
    </section>
  )
}
