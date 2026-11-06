interface PaydunyaConfig {
  masterKey: string
  privateKey: string
  token: string
  mode: 'test' | 'live'
}

export interface PaydunyaInvoiceItem {
  name: string
  quantity: number
  unit_price: number
  total_price: number
  description: string
}

export interface PaydunyaCreateInvoiceParams {
  ref: string
  description: string
  montant: number
  items: PaydunyaInvoiceItem[]
  clientNom: string
  clientPrenom: string
  clientEmail: string
  clientTelephone: string
  returnUrl: string
  cancelUrl: string
  webhookUrl: string
}

export interface PaydunyaInvoiceResponse {
  response_code: string
  response_text: string
  description: string
  invoice_token: string
  checkout_url: string
}

export interface PaydunyaCheckStatusResponse {
  response_code: string
  response_text: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  invoice: {
    token: string
    total_amount: number
    description: string
  }
  customer: {
    name: string
    email: string
    phone: string
  }
  custom_data?: {
    ref_commande?: string
    client_email?: string
  }
}

const PAYDUNYA_BASE_URL = {
  test: 'https://app.paydunya.com/sandbox-api/v1',
  live: 'https://app.paydunya.com/api/v1',
}

/**
 * PayDunya est optionnel : sans les 3 clés, le paiement en ligne est désactivé
 * (aucun appel à l'API) et les routes renvoient PAYMENT_UNAVAILABLE.
 */
export function isPaydunyaConfigured(): boolean {
  return Boolean(
    process.env.PAYDUNYA_MASTER_KEY?.trim() &&
      process.env.PAYDUNYA_PRIVATE_KEY?.trim() &&
      process.env.PAYDUNYA_TOKEN?.trim()
  )
}

export const PAYMENT_UNAVAILABLE_CODE = 'PAYMENT_UNAVAILABLE'
export const PAYMENT_UNAVAILABLE_MESSAGE =
  'Paiement en ligne bientôt disponible. Contactez-nous sur WhatsApp pour finaliser votre commande.'

export class PaydunyaNotConfiguredError extends Error {
  constructor() {
    super('PayDunya non configuré')
    this.name = 'PaydunyaNotConfiguredError'
  }
}

/** Corps + statut HTTP renvoyés quand le paiement en ligne est indisponible. */
export function paymentUnavailableBody() {
  return {
    success: false,
    code: PAYMENT_UNAVAILABLE_CODE,
    error: PAYMENT_UNAVAILABLE_MESSAGE,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '',
  }
}

function getConfig(): PaydunyaConfig {
  if (!isPaydunyaConfigured()) throw new PaydunyaNotConfiguredError()
  return {
    masterKey: process.env.PAYDUNYA_MASTER_KEY || '',
    privateKey: process.env.PAYDUNYA_PRIVATE_KEY || '',
    token: process.env.PAYDUNYA_TOKEN || '',
    mode: (process.env.PAYDUNYA_MODE as 'test' | 'live') || 'test',
  }
}

function getHeaders(config: PaydunyaConfig): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'PAYDUNYA-MASTER-KEY': config.masterKey,
    'PAYDUNYA-PRIVATE-KEY': config.privateKey,
    'PAYDUNYA-TOKEN': config.token,
  }
}

export async function createPaydunyaInvoice(
  params: PaydunyaCreateInvoiceParams
): Promise<PaydunyaInvoiceResponse> {
  const config = getConfig()
  const baseUrl = PAYDUNYA_BASE_URL[config.mode]

  const payload = {
    invoice: {
      items: Object.fromEntries(
        params.items.map((item, i) => [
          `item_${i}`,
          {
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            description: item.description,
          },
        ])
      ),
      total_amount: params.montant,
      description: params.description,
    },
    store: {
      name: 'CVPro225',
      tagline: 'Services Professionnels en Côte d\'Ivoire',
      postal_address: 'Abidjan, Côte d\'Ivoire',
      phone: process.env.NEXT_PUBLIC_WHATSAPP,
      logo_url: `${process.env.NEXT_PUBLIC_APP_URL}/cvpro225.png`,
      website_url: process.env.NEXT_PUBLIC_APP_URL,
    },
    actions: {
      cancel_url: params.cancelUrl,
      return_url: params.returnUrl,
      callback_url: params.webhookUrl,
    },
    custom_data: {
      ref_commande: params.ref,
      client_email: params.clientEmail,
    },
    customer: {
      name: `${params.clientPrenom} ${params.clientNom}`,
      email: params.clientEmail,
      phone: params.clientTelephone,
    },
  }

  const res = await fetch(`${baseUrl}/checkout-invoice/create`, {
    method: 'POST',
    headers: getHeaders(config),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`PayDunya HTTP ${res.status}`)
  }

  const data = await res.json()

  if (data.response_code !== '00') {
    throw new Error(`PayDunya: ${data.response_text}`)
  }

  return data
}

export async function checkPaydunyaStatus(
  invoiceToken: string
): Promise<PaydunyaCheckStatusResponse> {
  const config = getConfig()
  const baseUrl = PAYDUNYA_BASE_URL[config.mode]

  const res = await fetch(`${baseUrl}/checkout-invoice/confirm/${invoiceToken}`, {
    method: 'GET',
    headers: getHeaders(config),
  })

  if (!res.ok) {
    throw new Error(`PayDunya status HTTP ${res.status}`)
  }

  return res.json()
}

export function buildPaydunyaParams(commande: {
  ref: string
  service: string
  pack: string
  montant: number
  nom: string
  prenom: string
  email: string
  telephone: string
}): PaydunyaCreateInvoiceParams {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    ref: commande.ref,
    description: `CVPro225 — ${commande.service} ${commande.pack}`,
    montant: commande.montant,
    items: [
      {
        name: `${commande.service} — ${commande.pack}`,
        quantity: 1,
        unit_price: commande.montant,
        total_price: commande.montant,
        description: `Service CVPro225 réf: ${commande.ref}`,
      },
    ],
    clientNom: commande.nom,
    clientPrenom: commande.prenom,
    clientEmail: commande.email,
    clientTelephone: commande.telephone,
    returnUrl: `${appUrl}/commander/paiement/retour?ref=${commande.ref}`,
    cancelUrl: `${appUrl}/commander/paiement/annule?ref=${commande.ref}`,
    webhookUrl: process.env.PAYDUNYA_WEBHOOK_URL || `${appUrl}/api/webhooks/paydunya`,
  }
}
