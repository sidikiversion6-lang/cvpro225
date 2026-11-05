import { Resend } from 'resend'
import { LABELS_SERVICE, LABELS_PACK } from '@/types/commande'
import { formatPrix } from '@/lib/commande-config'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
const FROM = 'CVPro225 <noreply@cvpro225.com>'
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

interface CommandeEmail {
  ref: string
  service: string
  pack: string
  prenom: string
  nom: string
  email: string
  telephone: string
  ville?: string
  montant: number
  message?: string
}

export async function sendConfirmationEmail(c: CommandeEmail) {
  const serviceLabel = LABELS_SERVICE[c.service as keyof typeof LABELS_SERVICE] || c.service
  const packLabel = LABELS_PACK[c.pack] || c.pack

  return getResend().emails.send({
    from: FROM,
    to: c.email,
    subject: `Confirmation commande ${c.ref} — ${serviceLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0F7B5A;padding:24px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">CVPro225</h1>
        </div>
        <div style="padding:32px;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px">
          <h2 style="color:#0F172A;margin:0 0 16px">Bonjour ${c.prenom},</h2>
          <p style="color:#4b5563">Votre commande a bien été reçue !</p>
          <div style="background:#FAFAF9;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:4px 0"><strong>Référence :</strong> ${c.ref}</p>
            <p style="margin:4px 0"><strong>Service :</strong> ${serviceLabel}</p>
            <p style="margin:4px 0"><strong>Pack :</strong> ${packLabel}</p>
            <p style="margin:4px 0"><strong>Montant :</strong> ${formatPrix(c.montant)}</p>
          </div>
          <p style="color:#4b5563">Notre équipe vous contactera sous <strong>30 minutes</strong> sur WhatsApp au <strong>${c.telephone}</strong> pour confirmer et démarrer le traitement.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, commande ${c.ref} pour ${serviceLabel} — ${packLabel}`)}"
               style="background:#25D366;color:white;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">
              Confirmer sur WhatsApp
            </a>
          </div>
          <hr style="border:1px solid #eee;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px;text-align:center">
            CVPro225 — Abidjan, Côte d'Ivoire<br>contact@cvpro225.com
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendAdminNotification(c: CommandeEmail) {
  const serviceLabel = LABELS_SERVICE[c.service as keyof typeof LABELS_SERVICE] || c.service
  const packLabel = LABELS_PACK[c.pack] || c.pack

  return getResend().emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL || 'admin@cvpro225.com',
    subject: `[GP] Nouvelle commande ${c.ref} — ${serviceLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#0F7B5A">Nouvelle commande reçue</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px;color:#6b7280">Réf</td><td style="padding:6px;font-weight:600">${c.ref}</td></tr>
          <tr><td style="padding:6px;color:#6b7280">Service</td><td style="padding:6px">${serviceLabel} — ${packLabel}</td></tr>
          <tr><td style="padding:6px;color:#6b7280">Client</td><td style="padding:6px">${c.prenom} ${c.nom}</td></tr>
          <tr><td style="padding:6px;color:#6b7280">Email</td><td style="padding:6px">${c.email}</td></tr>
          <tr><td style="padding:6px;color:#6b7280">Tél</td><td style="padding:6px">${c.telephone}</td></tr>
          <tr><td style="padding:6px;color:#6b7280">Ville</td><td style="padding:6px">${c.ville || '—'}</td></tr>
          <tr><td style="padding:6px;color:#6b7280">Montant</td><td style="padding:6px;font-weight:600">${formatPrix(c.montant)}</td></tr>
          <tr><td style="padding:6px;color:#6b7280">Message</td><td style="padding:6px">${c.message || '—'}</td></tr>
        </table>
      </div>
    `,
  })
}

export async function sendEmailVirement(c: CommandeEmail) {
  const WHATSAPP_NUM = WHATSAPP.replace(/[^0-9]/g, '')

  return getResend().emails.send({
    from: FROM,
    to: c.email,
    subject: `Instructions de virement — ${c.ref}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0F7B5A;padding:24px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">CVPro225</h1>
        </div>
        <div style="padding:32px;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px">
          <h2 style="color:#0F172A">Instructions de virement bancaire</h2>
          <p style="color:#4b5563">Bonjour ${c.prenom},</p>
          <p style="color:#4b5563">Pour finaliser votre commande <strong>${c.ref}</strong>, veuillez effectuer un virement avec les informations suivantes :</p>
          <div style="background:#FAFAF9;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #0F7B5A">
            <p style="margin:4px 0"><strong>Banque :</strong> À confirmer par WhatsApp</p>
            <p style="margin:4px 0"><strong>Titulaire :</strong> CVPro225</p>
            <p style="margin:4px 0"><strong>Montant :</strong> ${formatPrix(c.montant)}</p>
            <p style="margin:4px 0"><strong>Référence :</strong> ${c.ref}</p>
          </div>
          <p style="color:#4b5563">⚠️ Mentionnez impérativement la référence <strong>${c.ref}</strong> dans le libellé du virement.</p>
          <p style="color:#4b5563">Une fois le virement effectué, envoyez-nous le justificatif sur WhatsApp.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(`Bonjour, j'ai effectué le virement pour la commande ${c.ref}`)}"
               style="background:#25D366;color:white;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">
              Envoyer le justificatif WhatsApp
            </a>
          </div>
          <hr style="border:1px solid #eee;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px;text-align:center">CVPro225 — Abidjan, Côte d'Ivoire</p>
        </div>
      </div>
    `,
  })
}
