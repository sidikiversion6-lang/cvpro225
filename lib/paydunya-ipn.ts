import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Traitement de l'IPN (Instant Payment Notification) PayDunya.
 *
 * PayDunya envoie un POST `application/x-www-form-urlencoded` dont les champs
 * sont imbriqués sous `data` (`data[hash]`, `data[status]`, `data[invoice][token]`…).
 * Le JSON est aussi accepté (tests manuels, éventuelle évolution de l'API).
 *
 * Sécurité, dans l'ordre :
 *   1. `data.hash` doit valoir SHA-512(MASTER_KEY) (comparaison à temps constant) ;
 *   2. le statut n'est JAMAIS pris dans l'IPN : il est re-vérifié via l'API de
 *      confirmation PayDunya (`checkout-invoice/confirm/<token>`) ;
 *   3. montant et référence confirmés par l'API doivent correspondre à la commande ;
 *   4. transition atomique `paid_at IS NULL -> now()` : un IPN rejoué ne renvoie
 *      pas les emails.
 */

export type IpnStatus = 'pending' | 'completed' | 'cancelled' | 'failed'

export interface ConfirmedInvoice {
  response_code: string
  status: IpnStatus
  invoice?: { token?: string; total_amount?: number | string }
  custom_data?: { ref_commande?: string }
}

export interface IpnCommande {
  id: string
  ref: string
  montant: number
  paid_at: Date | null
}

export interface IpnDeps {
  masterKey: string
  /** Appel à l'API de confirmation PayDunya pour ce token. */
  confirmInvoice: (token: string) => Promise<ConfirmedInvoice>
  findCommandeByToken: (token: string) => Promise<IpnCommande | null>
  /** Passe la commande en payée SI elle ne l'est pas déjà. Retourne true si la transition a eu lieu. */
  markPaidIfUnpaid: (id: string) => Promise<boolean>
  /** Passe la commande en annulée SI elle n'est pas payée. */
  markCancelledIfUnpaid: (id: string, status: IpnStatus) => Promise<boolean>
  sendPaidEmails: (commandeId: string) => Promise<void>
  log?: (msg: string) => void
}

export interface IpnResult {
  httpStatus: number
  body: { received: boolean; outcome: string }
}

// ---------------------------------------------------------------------------
// Lecture du corps
// ---------------------------------------------------------------------------

type Nested = { [k: string]: string | Nested }

/** `data[invoice][token]=abc` -> { data: { invoice: { token: 'abc' } } } */
export function parseBracketForm(raw: string): Nested {
  const out: Nested = {}
  new URLSearchParams(raw).forEach((value, key) => {
    const path = key.split(/\[|\]/).filter(Boolean)
    if (path.length === 0) return
    let node: Nested = out
    for (let i = 0; i < path.length - 1; i++) {
      const next = node[path[i]]
      if (typeof next !== 'object') node[path[i]] = {}
      node = node[path[i]] as Nested
    }
    node[path[path.length - 1]] = value
  })
  return out
}

export interface ParsedIpn {
  hash?: string
  token?: string
}

export function parseIpnBody(raw: string, contentType: string | null): ParsedIpn {
  let payload: unknown
  const ct = (contentType || '').toLowerCase()
  if (ct.includes('application/json')) {
    try {
      payload = JSON.parse(raw)
    } catch {
      return {}
    }
  } else {
    // form-urlencoded (format PayDunya) ; aussi le repli si le Content-Type est absent
    payload = parseBracketForm(raw)
  }
  const root = (payload ?? {}) as Record<string, any>
  const data = (typeof root.data === 'object' && root.data) || root
  const token = data?.invoice?.token ?? data?.token
  const hash = data?.hash
  return {
    token: typeof token === 'string' && token ? token : undefined,
    hash: typeof hash === 'string' && hash ? hash : undefined,
  }
}

// ---------------------------------------------------------------------------
// Hash
// ---------------------------------------------------------------------------

export function expectedIpnHash(masterKey: string): string {
  return createHash('sha512').update(masterKey).digest('hex')
}

export function verifyIpnHash(received: string | undefined, masterKey: string): boolean {
  if (!received || !masterKey) return false
  const a = Buffer.from(received.trim().toLowerCase(), 'utf8')
  const b = Buffer.from(expectedIpnHash(masterKey), 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

// ---------------------------------------------------------------------------
// Traitement
// ---------------------------------------------------------------------------

const res = (httpStatus: number, outcome: string): IpnResult => ({
  httpStatus,
  body: { received: httpStatus < 400, outcome },
})

export async function handlePaydunyaIpn(
  raw: string,
  contentType: string | null,
  deps: IpnDeps,
): Promise<IpnResult> {
  const log = deps.log ?? (() => {})
  const { token, hash } = parseIpnBody(raw, contentType)

  if (!token) return res(400, 'missing_token')
  if (!verifyIpnHash(hash, deps.masterKey)) {
    log('[PayDunya IPN] hash invalide — rejeté')
    return res(401, 'invalid_hash')
  }

  const commande = await deps.findCommandeByToken(token)
  if (!commande) {
    log('[PayDunya IPN] aucune commande pour ce token')
    return res(404, 'unknown_token')
  }

  // Source de vérité : l'API de confirmation, jamais le contenu de l'IPN.
  // Une erreur ici remonte (-> 500) pour que PayDunya puisse renvoyer l'IPN.
  const confirmed = await deps.confirmInvoice(token)
  if (confirmed.response_code !== '00') {
    log(`[PayDunya IPN] confirmation refusée (${confirmed.response_code}) pour ${commande.ref}`)
    return res(502, 'confirm_failed')
  }

  if (confirmed.status === 'completed') {
    const paidAmount = Number(confirmed.invoice?.total_amount)
    if (!Number.isFinite(paidAmount) || paidAmount !== commande.montant) {
      log(`[PayDunya IPN] montant incohérent pour ${commande.ref} : payé ${confirmed.invoice?.total_amount}, attendu ${commande.montant}`)
      return res(409, 'amount_mismatch')
    }
    const ref = confirmed.custom_data?.ref_commande
    if (ref && ref !== commande.ref) {
      log(`[PayDunya IPN] référence incohérente : ${ref} ≠ ${commande.ref}`)
      return res(409, 'ref_mismatch')
    }

    const transitioned = await deps.markPaidIfUnpaid(commande.id)
    if (!transitioned) {
      log(`[PayDunya IPN] ${commande.ref} déjà payée — IPN rejoué ignoré`)
      return res(200, 'already_paid')
    }
    try {
      await deps.sendPaidEmails(commande.id)
    } catch (err) {
      // Le paiement est enregistré : ne pas faire échouer l'IPN pour un email.
      log(`[PayDunya IPN] emails non envoyés pour ${commande.ref} : ${String(err)}`)
    }
    log(`[PayDunya IPN] paiement confirmé : ${commande.ref}`)
    return res(200, 'paid')
  }

  if (confirmed.status === 'cancelled' || confirmed.status === 'failed') {
    const changed = await deps.markCancelledIfUnpaid(commande.id, confirmed.status)
    log(`[PayDunya IPN] ${commande.ref} ${confirmed.status}${changed ? '' : ' (ignoré : déjà payée ou déjà annulée)'}`)
    return res(200, changed ? 'cancelled' : 'ignored')
  }

  return res(200, 'pending')
}
