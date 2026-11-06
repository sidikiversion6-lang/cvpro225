import { metaTarifs } from '@/lib/seo'

// Prix dans la description : calculés à chaque requête (offre de lancement)
export const dynamic = 'force-dynamic'
export function generateMetadata() {
  return metaTarifs()
}

export default function TarifsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
