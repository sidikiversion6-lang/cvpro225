import { NextResponse } from 'next/server'

// Liveness probe for Docker/Traefik. Intentionally does not touch the DB,
// so a transient Supabase outage doesn't make Docker restart the app.
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ status: 'ok', uptime: Math.round(process.uptime()) })
}
