import { Resend } from 'resend'
import { EXPRESS, formatFcfa } from '@/lib/offres'
import { ligneCommande, lienCollecteInfos } from '@/lib/commande-detail'
import { escapeHtml } from '@/lib/html'

export { ligneCommande, lienCollecteInfos }

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
const FROM = 'CVPro225 <noreply@cvpro225.com>'
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'
const WHATSAPP_NUM = WHATSAPP.replace(/[^0-9]/g, '')
const ADMIN_TO = () => process.env.ADMIN_EMAIL || 'admin@cvpro225.com'
const ADMIN_BCC = () => process.env.ADMIN_BCC_EMAIL || undefined

export { escapeHtml }

export interface CommandeEmail {
  ref: string
  service: string
  pack: string
  prenom: string
  nom: string
  /** Optionnel : sans email, aucun email client n'est envoyé. */
  email: string | null
  telephone: string
  ville?: string | null
  montant: number
  message?: string | null
  /** commandes.details : contient le détail du prix figé à la commande. */
  details?: unknown
  /** commandes.a_un_cv : false = pas de CV, le client doit être contacté sur WhatsApp. */
  aUnCv?: boolean | null
}

type AvecEmail = CommandeEmail & { email: string }


const td = 'padding:8px 0;color:#64748B'
const tdv = 'padding:8px 0;text-align:right'

/** Tableau détail : offre, option Express, total. Identique dans tous les emails. */
function detailHtml(c: CommandeEmail, totalLabel: string): string {
  const l = ligneCommande(c)
  const rows: string[] = []
  rows.push(`<tr><td style="${td}">${escapeHtml(l.offreNom)}${l.tarif === 'lancement' ? ' <span style="color:#D97706;font-size:12px">(offre de lancement)</span>' : ''}</td><td style="${tdv}">${l.prixOffre !== null ? formatFcfa(l.prixOffre) : ''}</td></tr>`)
  if (l.express) {
    rows.push(`<tr><td style="${td}">${EXPRESS.nom} (livraison ${EXPRESS.delai})</td><td style="${tdv}">${l.prixExpress !== null ? '+ ' + formatFcfa(l.prixExpress) : ''}</td></tr>`)
  }
  rows.push(`<tr><td style="padding:12px 0 0;border-top:1px solid #E2E8F0;font-weight:700;color:#0F172A">${totalLabel}</td><td style="padding:12px 0 0;border-top:1px solid #E2E8F0;text-align:right;font-weight:700;color:#0F7B5A;font-size:18px">${formatFcfa(c.montant)}</td></tr>`)
  if (l.delai) rows.push(`<tr><td style="${td}">Délai de livraison</td><td style="${tdv}">${escapeHtml(l.delai)}</td></tr>`)
  return `<table style="width:100%;border-collapse:collapse">${rows.join('')}</table>`
}

function layout(title: string, body: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0F7B5A;padding:24px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:24px">CVPro225</h1>
        <p style="color:#D1FAE5;margin:6px 0 0;font-size:14px">${title}</p>
      </div>
      <div style="padding:32px;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px">
        ${body}
        <hr style="border:1px solid #eee;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;text-align:center">CVPro225 — Abidjan, Côte d'Ivoire<br>contact@cvpro225.com · WhatsApp ${escapeHtml(WHATSAPP)}</p>
      </div>
    </div>`
}

const btn = (href: string, label: string, bg = '#25D366') =>
  `<div style="text-align:center;margin:28px 0"><a href="${escapeHtml(href)}" style="background:${bg};color:white;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">${label}</a></div>`

const waLink = (text: string) => `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/** Confirmation de commande (avant paiement) : détail + montant à payer. */
export async function sendOrderReceivedEmail(c: AvecEmail, opts: { paymentUrl?: string } = {}) {
  const l = ligneCommande(c)
  const next = opts.paymentUrl
    ? `<p style="color:#4b5563">Pour lancer la rédaction, réglez votre commande en ligne (Orange Money, MTN MoMo, carte bancaire) :</p>${btn(opts.paymentUrl, `Payer ${formatFcfa(c.montant)}`, '#0F7B5A')}<p style="color:#9ca3af;font-size:13px">Un reçu vous sera envoyé dès la confirmation du paiement.</p>`
    : `<p style="color:#4b5563">Notre équipe vous contacte sur WhatsApp au <strong>${escapeHtml(c.telephone)}</strong> pour finaliser le paiement et démarrer le travail.</p>${btn(waLink(`Bonjour, commande ${c.ref} — ${l.libelle}`), 'Nous écrire sur WhatsApp')}`

  return getResend().emails.send({
    from: FROM,
    to: c.email,
    subject: `Commande ${c.ref} reçue — ${l.libelle}`,
    html: layout('Confirmation de commande', `
      <h2 style="color:#0F172A;margin:0 0 16px">Bonjour ${escapeHtml(c.prenom)},</h2>
      <p style="color:#4b5563">Votre commande <strong>${escapeHtml(c.ref)}</strong> a bien été reçue.</p>
      <div style="background:#FAFAF9;border-radius:8px;padding:20px;margin:20px 0">${detailHtml(c, 'Montant à payer')}</div>
      ${next}`),
  })
}

/** Reçu : envoyé après confirmation du paiement par l'API PayDunya. */
export async function sendPaymentReceiptEmail(c: AvecEmail, opts: { paidAt: Date }) {
  const l = ligneCommande(c)
  const date = opts.paidAt.toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan', dateStyle: 'long', timeStyle: 'short' })
  return getResend().emails.send({
    from: FROM,
    to: c.email,
    subject: `Reçu de paiement ${c.ref} — ${formatFcfa(c.montant)}`,
    html: layout('Reçu de paiement', `
      <h2 style="color:#0F172A;margin:0 0 16px">Merci ${escapeHtml(c.prenom)} !</h2>
      <p style="color:#4b5563">Nous avons bien reçu votre paiement. Votre commande est confirmée et notre équipe démarre le travail.</p>
      <div style="background:#FAFAF9;border-radius:8px;padding:20px;margin:20px 0">
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
          <tr><td style="${td}">Référence</td><td style="${tdv};font-weight:600">${escapeHtml(c.ref)}</td></tr>
          <tr><td style="${td}">Date du paiement</td><td style="${tdv}">${escapeHtml(date)}</td></tr>
          <tr><td style="${td}">Client</td><td style="${tdv}">${escapeHtml(c.prenom)} ${escapeHtml(c.nom)}</td></tr>
        </table>
        ${detailHtml(c, 'Montant payé')}
      </div>
      <p style="color:#4b5563">Livraison sous <strong>${escapeHtml(l.delai || 'les délais annoncés')}</strong>. Une question ? Répondez sur WhatsApp.</p>
      ${btn(waLink(`Bonjour, commande ${c.ref} payée — ${l.libelle}`), 'Écrire sur WhatsApp')}`),
  })
}

/** Livraison : envoyé quand l'admin passe la commande en "completed". */
export async function sendDeliveryEmail(c: AvecEmail & { livraison_url?: string | null; livraison_note?: string | null }) {
  const l = ligneCommande(c)
  const url = c.livraison_url && /^https?:\/\//i.test(c.livraison_url) ? c.livraison_url : null
  return getResend().emails.send({
    from: FROM,
    to: c.email,
    subject: `Votre commande ${c.ref} est livrée — ${l.libelle}`,
    html: layout('Commande livrée', `
      <h2 style="color:#0F172A;margin:0 0 16px">Bonjour ${escapeHtml(c.prenom)},</h2>
      <p style="color:#4b5563">Votre commande <strong>${escapeHtml(c.ref)}</strong> (${escapeHtml(l.libelle)}) est prête.</p>
      ${c.livraison_note ? `<p style="background:#FAFAF9;padding:16px;border-radius:8px;color:#334155">${escapeHtml(c.livraison_note)}</p>` : ''}
      ${url ? btn(url, 'Télécharger mes documents', '#0F7B5A') : ''}
      <p style="color:#4b5563">Les retouches sont incluses : répondez-nous sur WhatsApp si vous souhaitez un ajustement.</p>
      ${btn(waLink(`Bonjour, commande ${c.ref} livrée — j'ai une question`), 'Écrire sur WhatsApp')}`),
  })
}

export async function sendEmailVirement(c: AvecEmail) {
  return getResend().emails.send({
    from: FROM,
    to: c.email,
    subject: `Instructions de virement — ${c.ref}`,
    html: layout('Instructions de virement', `
      <p style="color:#4b5563">Bonjour ${escapeHtml(c.prenom)},</p>
      <p style="color:#4b5563">Pour finaliser votre commande <strong>${escapeHtml(c.ref)}</strong>, effectuez un virement :</p>
      <div style="background:#FAFAF9;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #0F7B5A">
        <p style="margin:4px 0"><strong>Banque :</strong> À confirmer par WhatsApp</p>
        <p style="margin:4px 0"><strong>Titulaire :</strong> CVPro225</p>
        <p style="margin:4px 0"><strong>Référence :</strong> ${escapeHtml(c.ref)}</p>
      </div>
      ${detailHtml(c, 'Montant à virer')}
      <p style="color:#4b5563">⚠️ Mentionnez la référence <strong>${escapeHtml(c.ref)}</strong> dans le libellé, puis envoyez le justificatif sur WhatsApp.</p>
      ${btn(waLink(`Bonjour, j'ai effectué le virement pour la commande ${c.ref}`), 'Envoyer le justificatif WhatsApp')}`),
  })
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminExtra {
  /** Lignes supplémentaires (brief du client), valeurs échappées ici. */
  brief?: Array<[string, string | null | undefined]>
  attachments?: Array<{ filename: string; content: Buffer }>
  paymentUrl?: string
}

export async function sendAdminNotification(c: CommandeEmail, kind: 'nouvelle' | 'payee' = 'nouvelle', extra: AdminExtra = {}) {
  const l = ligneCommande(c)
  const titre = kind === 'payee' ? '✅ Paiement confirmé' : '🛒 Nouvelle commande'
  const row = (k: string, v: unknown) => `<tr><td style="${td}">${escapeHtml(k)}</td><td style="padding:8px 0">${escapeHtml(v || '—')}</td></tr>`
  const brief = (extra.brief || []).filter(([, v]) => v).map(([k, v]) => row(k, v)).join('')
  const statut = kind === 'payee'
    ? '<p style="background:#D1FAE5;padding:12px;border-radius:8px;color:#065F46;font-weight:600">Payée en ligne — démarrer le travail.</p>'
    : extra.paymentUrl
      ? '<p style="background:#FEF3C7;padding:12px;border-radius:8px;color:#78350F;font-weight:600">En attente du paiement en ligne (PayDunya).</p>'
      : '<p style="background:#FEF3C7;padding:12px;border-radius:8px;color:#78350F;font-weight:600">Paiement en ligne indisponible : contacter le client sur WhatsApp pour le paiement.</p>'
  const sansCv = c.aUnCv === false
  const blocCv = sansCv
    ? `<div style="background:#FEE2E2;border-left:4px solid #DC2626;padding:16px;border-radius:8px;margin:16px 0">
         <p style="margin:0 0 8px;color:#991B1B;font-weight:700;font-size:16px">⚠️ Pas de CV — à contacter sur WhatsApp</p>
         <p style="margin:0 0 12px;color:#7F1D1D">Le client n'a pas de CV : recueillir poste recherché, expériences, formations et compétences${kind === 'payee' ? ' (commande payée)' : ' après le paiement'}.</p>
         <a href="${escapeHtml(lienCollecteInfos(c))}" style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:bold">💬 Écrire à ${escapeHtml(c.prenom)} (message pré-rempli)</a>
       </div>`
    : c.aUnCv
      ? `<p style="background:#F1F5F9;padding:12px;border-radius:8px;color:#334155">📄 CV fourni par le client${extra.attachments?.length ? ' (en pièce jointe)' : ''} — disponible dans le back-office.</p>`
      : ''

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_TO(),
    bcc: ADMIN_BCC(),
    reply_to: c.email || undefined,
    subject: `${titre}${c.aUnCv === false ? ' ⚠️ PAS DE CV' : ''} ${c.ref} — ${l.libelle} — ${formatFcfa(c.montant)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0F7B5A">${titre}</h2>
        ${statut}
        ${blocCv}
        ${detailHtml(c, kind === 'payee' ? 'Montant payé' : 'Montant attendu')}
        <h3 style="color:#0F172A;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-top:24px">👤 Client</h3>
        <table style="width:100%;border-collapse:collapse">
          ${row('Réf', c.ref)}${row('Nom', `${c.prenom} ${c.nom}`.trim())}${row('Email', c.email || 'non fourni')}${row('WhatsApp', `+${c.telephone}`)}${row('CV existant', c.aUnCv === true ? 'Oui' : c.aUnCv === false ? 'Non' : '—')}${row('Ville', c.ville)}${row('Message', c.message)}
        </table>
        ${brief ? `<h3 style="color:#0F172A;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-top:24px">📝 Brief</h3><table style="width:100%;border-collapse:collapse">${brief}</table>` : ''}
        ${sansCv ? '' : btn(`https://wa.me/${c.telephone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${c.prenom}, merci pour votre commande CVPro225 ${c.ref} (${l.libelle}).`)}`, `💬 Contacter ${escapeHtml(c.prenom)} sur WhatsApp`)}
      </div>`,
    attachments: extra.attachments?.length ? extra.attachments : undefined,
  })
}
