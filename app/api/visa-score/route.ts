import { NextResponse } from 'next/server'
import { z } from 'zod'
import { DESTINATIONS, calculateVisaScore } from '@/lib/visa-config'
import type { DestinationVisa } from '@/types/visa'

const schema = z.object({
  destination: z.string().refine(
    (val): val is DestinationVisa => DESTINATIONS.includes(val as DestinationVisa),
    { message: 'Destination non supportée' }
  ),
  docs: z.array(z.string()),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { destination, docs } = parsed.data
    const result = calculateVisaScore(destination as DestinationVisa, docs)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
