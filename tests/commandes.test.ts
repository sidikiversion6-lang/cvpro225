import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { creerCommande, CommandeInvalide, validerClient, normaliserTelephoneCI, decouperNomComplet, type CommandeDeps, type NouvelleCommande } from '../lib/commandes'
import { buildPaydunyaParams } from '../lib/paydunya'
import { escapeHtml } from '../lib/html'
import type { CommandeEmail, AdminExtra } from '../lib/resend'
import { ligneCommande, lienCollecteInfos } from '../lib/commande-detail'

const AVANT = new Date('2026-11-10T12:00:00Z')
const APRES = new Date('2027-01-05T12:00:00Z')

type Row = Parameters<CommandeDeps['createCommande']>[0] & { id: string }

function fakeDeps(opts: { now?: Date; paydunya?: boolean; invoiceFails?: boolean; storageFails?: boolean } = {}) {
  const db: Row[] = []
  const stored: string[] = []
  const invoices: ReturnType<typeof buildPaydunyaParams>[] = []
  const mails: Array<{ to: 'admin' | 'client'; c: CommandeEmail; extra?: AdminExtra; paymentUrl?: string }> = []
  const deps: CommandeDeps = {
    now: () => opts.now ?? AVANT,
    createCommande: async (data) => {
      const row = { ...data, id: `id${db.length + 1}` }
      db.push(row)
      return row
    },
    storeCv: async (ref, f) => {
      if (opts.storageFails) throw new Error('Storage down')
      stored.push(`${ref}/${f.filename}`)
      return `${ref}/${f.filename}`
    },
    setPaydunyaToken: async (id, token) => {
      Object.assign(db.find((r) => r.id === id)!, { paydunya_token: token })
    },
    paydunyaConfigured: () => opts.paydunya ?? true,
    createInvoice: async (p) => {
      if (opts.invoiceFails) throw new Error('PayDunya HTTP 500')
      invoices.push(p)
      return { invoice_token: `tok_${p.ref}`, checkout_url: `https://app.paydunya.com/sandbox-checkout/invoice/tok_${p.ref}` }
    },
    buildParams: (c) => buildPaydunyaParams(c),
    sendAdmin: async (c, extra) => { mails.push({ to: 'admin', c, extra }) },
    sendClient: async (c, o) => { mails.push({ to: 'client', c, paymentUrl: o.paymentUrl }) },
    log: () => {},
  }
  return { deps, db, invoices, mails, stored }
}

// Sans CV par défaut ; numéro saisi avec espaces, normalisé côté serveur
const client = { nomComplet: 'Konan Kouassi', email: 'konan@test.ci', telephone: '07 00 00 00 00', aUnCv: false }
const CV = { filename: 'cv.pdf', content: Buffer.from('%PDF-1.4') }

beforeEach(() => {
  process.env.LAUNCH_OFFER_END_DATE = '2026-12-31'
})

describe('parcours de commande : chaque offre, avec et sans Express', () => {
  const cas: Array<[string, boolean, number, string]> = [
    ['cv-pro-ats', false, 10000, 'CV Pro ATS'],
    ['cv-pro-ats', true, 15000, 'CV Pro ATS + Option Express'],
    ['cv-pro-ats-lettre', false, 15000, 'CV Pro ATS + Lettre de motivation'],
    ['cv-pro-ats-lettre', true, 20000, 'CV Pro ATS + Lettre de motivation + Option Express'],
    ['jobassist', false, 25000, 'JobAssist'],
    ['jobassist', true, 30000, 'JobAssist + Option Express'],
  ]
  for (const [offre, express, montant, libelle] of cas) {
    test(`${libelle} -> ${montant} FCFA en base, facture PayDunya et emails`, async () => {
      const { deps, db, invoices, mails } = fakeDeps()
      const r = await creerCommande({ offre, express, ...client }, deps)

      assert.equal(r.payment, 'paydunya')
      assert.equal(r.montant, montant)
      // Base : montant + détail figés
      assert.equal(db[0].montant, montant)
      assert.equal(db[0].pack, offre)
      assert.equal(db[0].statut, 'pending')
      assert.equal((db[0].details as Record<string, unknown>).express, express)
      // Facture : total = montant, lignes cohérentes
      const inv = invoices[0]
      assert.equal(inv.montant, montant)
      assert.equal(inv.items.reduce((s, i) => s + i.total_price, 0), montant)
      assert.equal(inv.items.length, express ? 2 : 1)
      if (express) assert.deepEqual(inv.items[1], { name: 'Option Express', quantity: 1, unit_price: 5000, total_price: 5000, description: 'Livraison prioritaire en 24h' })
      assert.equal(inv.description, `CVPro225 — ${libelle}`)
      // Emails : libellé identique + lien de paiement
      for (const m of mails) {
        assert.equal(ligneCommande(m.c).libelle, libelle)
        assert.equal(m.c.montant, montant)
      }
      assert.equal(mails.find((m) => m.to === 'client')!.paymentUrl, r.payment === 'paydunya' ? r.checkoutUrl : undefined)
    })
  }

  test('après la fin du lancement : prix normaux, sans redéploiement', async () => {
    const { deps, db } = fakeDeps({ now: APRES })
    await creerCommande({ offre: 'jobassist', express: true, ...client }, deps)
    assert.equal(db[0].montant, 40000)
    assert.equal((db[0].details as Record<string, unknown>).tarif, 'normal')
  })
})

describe('sécurité du montant', () => {
  test('téléphone normalisé en base', async () => {
    const { deps, db } = fakeDeps()
    await creerCommande({ offre: 'cv-pro-ats', express: false, ...client, telephone: '+225 05 11 22 33 44' }, deps)
    assert.equal(db[0].telephone, '2250511223344')
    assert.equal(db[0].prenom, 'Konan')
    assert.equal(db[0].nom, 'Kouassi')
  })

  test('un montant envoyé par le navigateur est ignoré', async () => {
    const { deps, db, invoices } = fakeDeps()
    const falsifie = { offre: 'jobassist', express: true, ...client, montant: 100, packPrice: 1, prix: 0 } as unknown as NouvelleCommande
    await creerCommande(falsifie, deps)
    assert.equal(db[0].montant, 30000)
    assert.equal(invoices[0].montant, 30000)
  })

  test('offre inconnue -> CommandeInvalide, rien créé, rien facturé', async () => {
    const { deps, db, invoices } = fakeDeps()
    for (const offre of ['', 'annuel', 'cv-express', 'standard']) {
      await assert.rejects(creerCommande({ offre, express: false, ...client }, deps), CommandeInvalide)
    }
    assert.equal(db.length, 0)
    assert.equal(invoices.length, 0)
  })

  test("express non booléen (ex. 'false' en chaîne) n'ajoute pas l'option", async () => {
    const { deps, db } = fakeDeps()
    await creerCommande({ offre: 'cv-pro-ats', express: 'false' as unknown as boolean, ...client }, deps)
    assert.equal(db[0].montant, 10000)
  })

  test('commande existante : son montant figé ne change pas après la fin du lancement', () => {
    // La facture d'une commande créée pendant le lancement est construite depuis la base
    const c = { ref: 'GP-1', pack: 'cv-pro-ats-lettre', montant: 15000, nom: 'K', prenom: 'K', email: 'a@b.ci', telephone: '225',
      details: { offre_nom: 'CV Pro ATS + Lettre de motivation', express: false, prix_offre: 15000, prix_express: 0, tarif: 'lancement', delai: '48h' } }
    process.env.LAUNCH_OFFER_END_DATE = '2020-01-01' // offre terminée
    const p = buildPaydunyaParams(c)
    assert.equal(p.montant, 15000)
    assert.equal(p.items[0].unit_price, 15000)
  })
})

describe('repli WhatsApp (pas de 500 pour le client)', () => {
  test('PayDunya non configuré -> commande enregistrée, payment=whatsapp, aucune facture', async () => {
    const { deps, db, invoices, mails } = fakeDeps({ paydunya: false })
    const r = await creerCommande({ offre: 'cv-pro-ats', express: false, ...client }, deps)
    assert.equal(r.payment, 'whatsapp')
    assert.equal(r.payment === 'whatsapp' && r.reason, 'not_configured')
    assert.equal(db.length, 1)
    assert.equal(invoices.length, 0)
    assert.equal(mails.length, 2)
  })

  test('PayDunya en erreur -> repli, commande conservée', async () => {
    const { deps, db } = fakeDeps({ invoiceFails: true })
    const r = await creerCommande({ offre: 'cv-pro-ats', express: true, ...client }, deps)
    assert.equal(r.payment, 'whatsapp')
    assert.equal(r.payment === 'whatsapp' && r.reason, 'paydunya_error')
    assert.equal(db[0].montant, 15000)
  })

  test("un email en échec n'empêche pas la commande", async () => {
    const { deps } = fakeDeps()
    deps.sendAdmin = async () => { throw new Error('Resend down') }
    const r = await creerCommande({ offre: 'jobassist', express: false, ...client }, deps)
    assert.equal(r.payment, 'paydunya')
  })
})

describe('validation et échappement', () => {
  test('champs client : email optionnel, nom complet, WhatsApp CI', () => {
    assert.equal(validerClient(client), null)
    assert.equal(validerClient({ ...client, email: '' }), null)
    assert.equal(validerClient({ ...client, email: null }), null)
    assert.match(validerClient({ ...client, email: 'pas-un-email' })!, /Email/)
    assert.match(validerClient({ ...client, nomComplet: 'K' })!, /Nom/)
    assert.match(validerClient({ ...client, telephone: '123' })!, /WhatsApp/)
  })

  test('numéro ivoirien : 10 chiffres, espaces/indicatif acceptés, normalisé en 225XXXXXXXXXX', () => {
    for (const ok of ['0700000000', '07 00 00 00 00', '07.00.00.00.00', '+225 07 00 00 00 00', '2250700000000', '002250700000000']) {
      assert.equal(normaliserTelephoneCI(ok), '2250700000000', ok)
    }
    for (const ko of ['', '070000000', '07000000000', '+33612345678', 'abc', '22507000000']) {
      assert.equal(normaliserTelephoneCI(ko), null, ko)
    }
  })

  test('nom complet -> prénom + nom (colonnes conservées)', () => {
    assert.deepEqual(decouperNomComplet('  Konan   Kouassi Jean '), { prenom: 'Konan', nom: 'Kouassi Jean' })
    assert.deepEqual(decouperNomComplet('Aya'), { prenom: 'Aya', nom: '' })
  })
  test('escapeHtml neutralise une injection dans les emails', () => {
    assert.equal(escapeHtml('<img src=x onerror=alert(1)>"\''), '&lt;img src=x onerror=alert(1)&gt;&quot;&#39;')
  })
})

describe('parcours court : avec / sans CV, avec / sans email', () => {
  test('AVEC CV + email : CV stocké, a_un_cv=true, pièce jointe admin, email client envoyé', async () => {
    const { deps, db, mails, stored } = fakeDeps()
    await creerCommande({ offre: 'cv-pro-ats', express: false, ...client, aUnCv: true, cv: CV }, deps)
    assert.equal(db[0].a_un_cv, true)
    assert.equal(db[0].cv_fichier, `${db[0].ref}/cv.pdf`)
    assert.deepEqual(stored, [`${db[0].ref}/cv.pdf`])
    const admin = mails.find((m) => m.to === 'admin')!
    assert.equal(admin.extra?.attachments?.[0].filename, 'cv.pdf')
    assert.equal(admin.c.aUnCv, true)
    assert.ok(mails.some((m) => m.to === 'client'))
  })

  test('AVEC CV, stockage en échec : commande quand même créée, CV en pièce jointe admin', async () => {
    const { deps, db, mails } = fakeDeps({ storageFails: true })
    const r = await creerCommande({ offre: 'cv-pro-ats', express: false, ...client, aUnCv: true, cv: CV }, deps)
    assert.equal(r.payment, 'paydunya')
    assert.equal(db[0].cv_fichier, null)
    assert.equal(mails.find((m) => m.to === 'admin')!.extra?.attachments?.length, 1)
  })

  test('SANS CV + email : a_un_cv=false, rien stocké, admin prévenu (à contacter)', async () => {
    const { deps, db, mails, stored } = fakeDeps()
    await creerCommande({ offre: 'jobassist', express: true, ...client, aUnCv: false }, deps)
    assert.equal(db[0].a_un_cv, false)
    assert.equal(db[0].cv_fichier, null)
    assert.equal(stored.length, 0)
    assert.equal(mails.find((m) => m.to === 'admin')!.c.aUnCv, false)
    assert.ok(mails.some((m) => m.to === 'client'))
  })

  test('SANS email : aucun email client, email NULL en base, facture sans email mais avec téléphone', async () => {
    for (const email of [undefined, null, '', '   ']) {
      const { deps, db, mails, invoices } = fakeDeps()
      await creerCommande({ offre: 'cv-pro-ats', express: false, nomComplet: 'Aya Brou', telephone: '0700000000', email, aUnCv: false }, deps)
      assert.equal(db[0].email, null, String(email))
      assert.deepEqual(mails.map((m) => m.to), ['admin'])
      assert.ok(!invoices[0].clientEmail, 'aucune adresse inventée')
      assert.equal(invoices[0].clientTelephone, '2250700000000')
    }
  })

  test('AVEC CV, SANS email', async () => {
    const { deps, db, mails } = fakeDeps()
    await creerCommande({ offre: 'cv-pro-ats-lettre', express: true, nomComplet: 'Aya Brou', telephone: '0700000000', aUnCv: true, cv: CV }, deps)
    assert.equal(db[0].a_un_cv, true)
    assert.equal(db[0].montant, 20000)
    assert.deepEqual(mails.map((m) => m.to), ['admin'])
  })

  test('lien WhatsApp « à contacter » : numéro du client + message pré-rempli', () => {
    const url = new URL(lienCollecteInfos({ telephone: '2250700000000', prenom: 'Aya', nom: 'Brou', details: { nom_complet: 'Aya Brou' } }))
    assert.equal(url.origin + url.pathname, 'https://wa.me/2250700000000')
    assert.equal(url.searchParams.get('text'), 'Bonjour Aya Brou, merci pour votre commande CVPro225 ! Pour rédiger votre CV, pouvez-vous nous envoyer : votre poste recherché, vos expériences, vos formations et vos compétences ?')
  })

  test('validation refusée côté serveur aussi (appel direct)', async () => {
    const { deps, db } = fakeDeps()
    await assert.rejects(creerCommande({ offre: 'cv-pro-ats', express: false, ...client, telephone: '1234' }, deps), CommandeInvalide)
    assert.equal(db.length, 0)
  })
})
