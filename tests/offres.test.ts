import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  OFFRES,
  EXPRESS,
  computeMontant,
  getLaunchEnd,
  isLaunchActive,
  launchEndLabel,
  offresAffichees,
  prixMin,
  resolvePack,
  libelleCommande,
  formatFcfa,
} from '../lib/offres'
import { LABELS_PACK } from '../types/commande'

const AVANT = new Date('2026-11-10T12:00:00Z')
const DERNIER_JOUR_FIN = new Date('2026-12-31T23:59:59Z') // encore inclus (Abidjan = UTC)
const LENDEMAIN = new Date('2027-01-01T00:00:00Z')

beforeEach(() => {
  process.env.LAUNCH_OFFER_END_DATE = '2026-12-31'
})

describe('grille tarifaire', () => {
  test('3 offres, prix normal / lancement conformes', () => {
    const g = Object.fromEntries(OFFRES.map((o) => [o.id, [o.prixNormal, o.prixLancement]]))
    assert.deepEqual(g, {
      'cv-pro-ats': [15000, 10000],
      'cv-pro-ats-lettre': [20000, 15000],
      jobassist: [35000, 25000],
    })
    assert.equal(EXPRESS.prix, 5000)
  })

  test('seule « CV Pro ATS + Lettre de motivation » est « Le plus choisi »', () => {
    assert.deepEqual(OFFRES.filter((o) => o.plusChoisi).map((o) => o.id), ['cv-pro-ats-lettre'])
  })
})

describe('offre de lancement (LAUNCH_OFFER_END_DATE)', () => {
  test('active avant et pendant le dernier jour, inactive le lendemain', () => {
    assert.equal(isLaunchActive(AVANT), true)
    assert.equal(isLaunchActive(DERNIER_JOUR_FIN), true)
    assert.equal(isLaunchActive(LENDEMAIN), false)
  })

  test('variable absente, vide ou invalide -> prix normaux', () => {
    for (const v of [undefined, '', '31/12/2026', '2026-12-32', '2026-02-30', 'demain']) {
      if (v === undefined) delete process.env.LAUNCH_OFFER_END_DATE
      else process.env.LAUNCH_OFFER_END_DATE = v
      assert.equal(isLaunchActive(AVANT), false, `valeur ${v}`)
    }
    assert.equal(getLaunchEnd('2026-02-30'), null)
  })

  test('libellé de fin en français', () => {
    assert.equal(launchEndLabel(), '31 décembre 2026')
  })
})

describe('computeMontant (seul calcul du montant payé)', () => {
  const cas: Array<[string, boolean, Date, number]> = [
    ['cv-pro-ats', false, AVANT, 10000],
    ['cv-pro-ats', true, AVANT, 15000],
    ['cv-pro-ats-lettre', false, AVANT, 15000],
    ['cv-pro-ats-lettre', true, AVANT, 20000],
    ['jobassist', false, AVANT, 25000],
    ['jobassist', true, AVANT, 30000],
    ['cv-pro-ats', false, LENDEMAIN, 15000],
    ['cv-pro-ats', true, LENDEMAIN, 20000],
    ['cv-pro-ats-lettre', false, LENDEMAIN, 20000],
    ['cv-pro-ats-lettre', true, LENDEMAIN, 25000],
    ['jobassist', false, LENDEMAIN, 35000],
    ['jobassist', true, LENDEMAIN, 40000],
  ]
  for (const [id, express, now, attendu] of cas) {
    test(`${id}${express ? ' + Express' : ''} ${now === AVANT ? '(lancement)' : '(après)'} = ${attendu}`, () => {
      const d = computeMontant(id, express, now)
      assert.equal(d.montant, attendu)
      assert.equal(d.prixOffre + d.prixExpress, d.montant)
      assert.equal(d.tarif, now === AVANT ? 'lancement' : 'normal')
      assert.equal(d.delai, express ? '24h' : OFFRES.find((o) => o.id === id)!.delai)
    })
  }

  test('offre inconnue ou ancienne offre Visa/TenderPro -> erreur (jamais 0 FCFA)', () => {
    for (const id of ['', 'annuel', 'premium', 'standard', 'cv-express', '__proto__']) {
      assert.throws(() => computeMontant(id, false, AVANT), /Offre inconnue/, id)
    }
  })
})

describe('affichage', () => {
  test('pendant le lancement : prix de lancement + prix normal à barrer', () => {
    const o = offresAffichees(AVANT).find((x) => x.id === 'jobassist')!
    assert.equal(o.prix, 25000)
    assert.equal(o.prixBarre, 35000)
  })
  test('après : prix normal, rien à barrer', () => {
    const o = offresAffichees(LENDEMAIN).find((x) => x.id === 'jobassist')!
    assert.equal(o.prix, 35000)
    assert.equal(o.prixBarre, null)
  })
  test('« à partir de »', () => {
    assert.equal(prixMin(AVANT), 10000)
    assert.equal(prixMin(LENDEMAIN), 15000)
  })
  test('format FCFA', () => {
    assert.equal(formatFcfa(25000), '25 000 FCFA')
  })
})

describe('anciens identifiants et libellés', () => {
  test('anciens packs Express -> offre + option Express', () => {
    assert.deepEqual(
      [resolvePack('standard'), resolvePack('cv-express'), resolvePack('pack-3'), resolvePack('job-express')].map((r) => [r?.offre.id, r?.express]),
      [['cv-pro-ats', false], ['cv-pro-ats', true], ['jobassist', false], ['jobassist', true]],
    )
    assert.equal(resolvePack('inconnu'), undefined)
  })
  test('libellés identiques partout', () => {
    assert.equal(libelleCommande('cv-pro-ats-lettre', true), 'CV Pro ATS + Lettre de motivation + Option Express')
    assert.equal(LABELS_PACK['cv-pro-ats-lettre'], 'CV Pro ATS + Lettre de motivation')
    assert.equal(LABELS_PACK['job-express'], 'JobAssist + Option Express')
  })
})
