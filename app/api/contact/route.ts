import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'


const schema = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().optional(),
  service: z.string().min(1),
  message: z.string().min(20),
})

const SERVICE_LABELS: Record<string, string> = {
  cv: 'CV Pro ATS',
  job: 'JobAssist',
  tender: 'TenderPro',
  autre: 'Renseignement général',
}

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

    const data = parsed.data
    const serviceLabel = SERVICE_LABELS[data.service] || data.service

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'CVPro225 <noreply@cvpro225.com>',
      to: process.env.ADMIN_EMAIL || 'contact@cvpro225.com',
      reply_to: data.email,
      subject: `📩 Nouveau message — ${serviceLabel} — ${data.nom}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#0F7B5A">Nouveau message de contact</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;color:#6b7280;border-bottom:1px solid #eee">Nom</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${data.nom}</td></tr>
            <tr><td style="padding:8px;color:#6b7280;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
            <tr><td style="padding:8px;color:#6b7280;border-bottom:1px solid #eee">Téléphone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.telephone || '—'}</td></tr>
            <tr><td style="padding:8px;color:#6b7280;border-bottom:1px solid #eee">Service</td><td style="padding:8px;border-bottom:1px solid #eee">${serviceLabel}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px">
            <p style="color:#6b7280;font-size:13px;margin:0 0 8px">Message :</p>
            <p style="margin:0;white-space:pre-wrap">${data.message}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /contact] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
