import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  handlePaydunyaIpn,
  parseIpnBody,
  parseBracketForm,
  verifyIpnHash,
  expectedIpnHash,
  type IpnDeps,
  type ConfirmedInvoice,
  type IpnCommande,
} from '../lib/paydunya-ipn'

const MASTER_KEY = 'test-master-key-123'
const HASH = expectedIpnHash(MASTER_KEY)
const TOKEN = 'test_inv_ABC123'
const FORM = 'application/x-www-form-urlencoded'

/** Corps tel qu'envoyé par PayDunya (form-urlencoded, champs sous data[...]). */
function formBody(overrides: Record<string, string> = {}): string {
  const fields: Record<string, string> = {
    'data[response_code]': '00',
    'data[response_text]': 'Transaction Found',
    'data[hash]': HASH,
    'data[invoice][token]': TOKEN,
    'data[invoice][total_amount]': '15000',
    'data[status]': 'completed',
    'data[custom_data][ref_commande]': 'CVP-0001',
    ...overrides,
  }
  return new URLSearchParams(fields).toString()
}

/** Faux environnement : une commande en mémoire + compteurs d'appels. */
function fakeDeps(opts: {
  confirm?: Partial<ConfirmedInvoice>
  commande?: (Partial<IpnCommande> & { statut?: string }) | null
  confirmThrows?: boolean
} = {}) {
  const state = {
    commande:
      opts.commande === null
        ? null
        : { id: 'c1', ref: 'CVP-0001', montant: 15000, paid_at: null as Date | null, statut: 'pending', ...opts.commande },
    emailsSent: 0,
    confirmCalls: 0,
  }
  const deps: IpnDeps = {
    masterKey: MASTER_KEY,
    confirmInvoice: async () => {
      state.confirmCalls++
      if (opts.confirmThrows) throw new Error('PayDunya down')
      return {
        response_code: '00',
        status: 'completed',
        invoice: { token: TOKEN, total_amount: 15000 },
        custom_data: { ref_commande: 'CVP-0001' },
        ...opts.confirm,
      }
    },
    findCommandeByToken: async (t) => (t === TOKEN ? state.commande : null),
    markPaidIfUnpaid: async () => {
      if (!state.commande || state.commande.paid_at) return false
      state.commande.paid_at = new Date()
      state.commande.statut = 'confirmed'
      return true
    },
    markCancelledIfUnpaid: async () => {
      if (!state.commande || state.commande.paid_at || state.commande.statut === 'cancelled') return false
      state.commande.statut = 'cancelled'
      return true
    },
    sendPaidEmails: async () => {
      state.emailsSent++
    },
  }
  return { deps, state }
}

describe('lecture du corps IPN', () => {
  test('form-urlencoded imbriqué (format PayDunya)', () => {
    assert.deepEqual(parseBracketForm('data[invoice][token]=abc&data[hash]=h'), {
      data: { invoice: { token: 'abc' }, hash: 'h' },
    })
    assert.deepEqual(parseIpnBody(formBody(), FORM), { token: TOKEN, hash: HASH })
  })

  test('JSON accepté aussi', () => {
    const json = JSON.stringify({ data: { hash: HASH, invoice: { token: TOKEN } } })
    assert.deepEqual(parseIpnBody(json, 'application/json; charset=utf-8'), { token: TOKEN, hash: HASH })
  })

  test('JSON invalide -> rien', () => {
    assert.deepEqual(parseIpnBody('{oops', 'application/json'), {})
  })
})

describe('hash SHA-512', () => {
  test('accepte SHA-512(master key), insensible à la casse', () => {
    assert.ok(verifyIpnHash(HASH, MASTER_KEY))
    assert.ok(verifyIpnHash(HASH.toUpperCase(), MASTER_KEY))
  })
  test('refuse un autre hash, un hash vide ou une master key vide', () => {
    assert.equal(verifyIpnHash(expectedIpnHash('autre'), MASTER_KEY), false)
    assert.equal(verifyIpnHash('', MASTER_KEY), false)
    assert.equal(verifyIpnHash(undefined, MASTER_KEY), false)
    assert.equal(verifyIpnHash(HASH, ''), false)
  })
})

describe('handlePaydunyaIpn', () => {
  test('paiement confirmé -> commande payée + emails envoyés une fois', async () => {
    const { deps, state } = fakeDeps()
    const r = await handlePaydunyaIpn(formBody(), FORM, deps)
    assert.equal(r.httpStatus, 200)
    assert.equal(r.body.outcome, 'paid')
    assert.equal(state.commande!.statut, 'confirmed')
    assert.ok(state.commande!.paid_at)
    assert.equal(state.emailsSent, 1)
    assert.equal(state.confirmCalls, 1, "le statut doit être re-vérifié via l'API")
  })

  test('IPN rejoué -> pas de second email (idempotence)', async () => {
    const { deps, state } = fakeDeps()
    await handlePaydunyaIpn(formBody(), FORM, deps)
    const r2 = await handlePaydunyaIpn(formBody(), FORM, deps)
    const r3 = await handlePaydunyaIpn(formBody(), FORM, deps)
    assert.equal(r2.body.outcome, 'already_paid')
    assert.equal(r3.body.outcome, 'already_paid')
    assert.equal(state.emailsSent, 1)
  })

  test('IPN concurrents -> un seul email', async () => {
    const { deps, state } = fakeDeps()
    await Promise.all([1, 2, 3, 4].map(() => handlePaydunyaIpn(formBody(), FORM, deps)))
    assert.equal(state.emailsSent, 1)
  })

  test('hash invalide -> 401, ni API ni base touchées', async () => {
    const { deps, state } = fakeDeps()
    const r = await handlePaydunyaIpn(formBody({ 'data[hash]': expectedIpnHash('pirate') }), FORM, deps)
    assert.equal(r.httpStatus, 401)
    assert.equal(state.confirmCalls, 0)
    assert.equal(state.commande!.statut, 'pending')
  })

  test("IPN 'completed' falsifié mais l'API dit 'pending' -> rien n'est confirmé", async () => {
    const { deps, state } = fakeDeps({ confirm: { status: 'pending' } })
    const r = await handlePaydunyaIpn(formBody({ 'data[status]': 'completed' }), FORM, deps)
    assert.equal(r.body.outcome, 'pending')
    assert.equal(state.commande!.statut, 'pending')
    assert.equal(state.emailsSent, 0)
  })

  test("montant confirmé différent -> 409, pas de confirmation", async () => {
    const { deps, state } = fakeDeps({ confirm: { invoice: { token: TOKEN, total_amount: '100' } } })
    const r = await handlePaydunyaIpn(formBody(), FORM, deps)
    assert.equal(r.httpStatus, 409)
    assert.equal(r.body.outcome, 'amount_mismatch')
    assert.equal(state.commande!.statut, 'pending')
  })

  test('référence confirmée différente -> 409', async () => {
    const { deps } = fakeDeps({ confirm: { custom_data: { ref_commande: 'CVP-9999' } } })
    assert.equal((await handlePaydunyaIpn(formBody(), FORM, deps)).body.outcome, 'ref_mismatch')
  })

  test("API de confirmation en erreur (response_code ≠ 00) -> 502", async () => {
    const { deps, state } = fakeDeps({ confirm: { response_code: '1001' } })
    const r = await handlePaydunyaIpn(formBody(), FORM, deps)
    assert.equal(r.httpStatus, 502)
    assert.equal(state.commande!.statut, 'pending')
  })

  test('API injoignable -> exception remontée (la route renvoie 500, PayDunya peut réessayer)', async () => {
    const { deps } = fakeDeps({ confirmThrows: true })
    await assert.rejects(handlePaydunyaIpn(formBody(), FORM, deps), /PayDunya down/)
  })

  test('annulation après paiement -> ignorée (ne dé-paye pas une commande)', async () => {
    const { deps, state } = fakeDeps({ commande: { paid_at: new Date(), statut: 'confirmed' }, confirm: { status: 'cancelled' } })
    const r = await handlePaydunyaIpn(formBody({ 'data[status]': 'cancelled' }), FORM, deps)
    assert.equal(r.body.outcome, 'ignored')
    assert.equal(state.commande!.statut, 'confirmed')
  })

  test('annulation d’une commande non payée -> cancelled', async () => {
    const { deps, state } = fakeDeps({ confirm: { status: 'failed' } })
    const r = await handlePaydunyaIpn(formBody({ 'data[status]': 'failed' }), FORM, deps)
    assert.equal(r.body.outcome, 'cancelled')
    assert.equal(state.commande!.statut, 'cancelled')
  })

  test('token absent -> 400 ; token inconnu -> 404', async () => {
    const { deps } = fakeDeps()
    assert.equal((await handlePaydunyaIpn('data[hash]=' + HASH, FORM, deps)).httpStatus, 400)
    const other = formBody({ 'data[invoice][token]': 'inconnu' })
    assert.equal((await handlePaydunyaIpn(other, FORM, deps)).httpStatus, 404)
  })
})
