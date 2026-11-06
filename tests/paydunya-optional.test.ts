import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'

// PayDunya NON configuré : les 3 clés vides (cas d'un déploiement sans compte PayDunya).
before(() => {
  process.env.PAYDUNYA_MASTER_KEY = ''
  process.env.PAYDUNYA_PRIVATE_KEY = ''
  process.env.PAYDUNYA_TOKEN = ''
})

// Tout appel réseau (API PayDunya) ferait échouer le test.
const realFetch = globalThis.fetch
globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
  throw new Error(`appel réseau inattendu : ${String(args[0])}`)
}) as typeof fetch

describe('PayDunya optionnel (clés vides)', () => {
  test('isPaydunyaConfigured() est faux ; true seulement avec les 3 clés', async () => {
    const { isPaydunyaConfigured } = await import('../lib/paydunya')
    assert.equal(isPaydunyaConfigured(), false)
    process.env.PAYDUNYA_MASTER_KEY = 'mk'
    process.env.PAYDUNYA_PRIVATE_KEY = 'test_private_x'
    assert.equal(isPaydunyaConfigured(), false, 'partiel = non configuré')
    process.env.PAYDUNYA_TOKEN = '   '
    assert.equal(isPaydunyaConfigured(), false, 'espaces = vide')
    process.env.PAYDUNYA_TOKEN = 'tk'
    assert.equal(isPaydunyaConfigured(), true)
    process.env.PAYDUNYA_MASTER_KEY = process.env.PAYDUNYA_PRIVATE_KEY = process.env.PAYDUNYA_TOKEN = ''
  })

  test("createPaydunyaInvoice refuse sans appeler l'API", async () => {
    const { createPaydunyaInvoice, buildPaydunyaParams, PaydunyaNotConfiguredError } = await import('../lib/paydunya')
    const params = buildPaydunyaParams({
      ref: 'CVP-T', pack: 'cv-pro-ats', montant: 1000,
      nom: 'N', prenom: 'P', email: 'a@b.co', telephone: '0700000000',
    })
    await assert.rejects(createPaydunyaInvoice(params), PaydunyaNotConfiguredError)
  })

  // Les routes (/api/paiement, /api/commandes, webhook) sont testées en conditions
  // réelles (next build + next start, curl) : voir le message de commit.
})

process.on('exit', () => { globalThis.fetch = realFetch })
