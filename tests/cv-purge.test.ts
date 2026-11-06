import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { purgerCvExpires, limitePurge, CV_RETENTION_JOURS, type PurgeDeps, type CvAPurger } from '../lib/cv-purge'

const NOW = new Date('2027-06-01T03:00:00Z')

function fake(rows: CvAPurger[], opts: { removeFails?: boolean } = {}) {
  const removed: string[] = []
  const marked: Array<{ id: string; details: Record<string, unknown> }> = []
  let limiteVue: Date | null = null
  const deps: PurgeDeps = {
    trouver: async (limite) => { limiteVue = limite; return rows },
    supprimerFichiers: async (paths) => { if (opts.removeFails) throw new Error('storage down'); removed.push(...paths) },
    marquerPurge: async (id, details) => { marked.push({ id, details }) },
    log: () => {},
  }
  return { deps, removed, marked, limite: () => limiteVue }
}

describe('purge des CV (90 jours)', () => {
  test('limite = maintenant - 90 jours', () => {
    assert.equal(CV_RETENTION_JOURS, 90)
    assert.equal(limitePurge(NOW).toISOString(), '2027-03-03T03:00:00.000Z')
  })

  test('supprime les fichiers, vide cv_fichier et note la date de purge en gardant les détails', async () => {
    const f = fake([
      { id: 'a', ref: 'GP-A', cv_fichier: 'GP-A/cv.pdf', details: { offre: 'cv-pro-ats', express: false } },
      { id: 'b', ref: 'GP-B', cv_fichier: 'GP-B/cv.docx', details: null },
    ])
    const r = await purgerCvExpires(f.deps, NOW)
    assert.deepEqual(r, { purges: 2, erreurs: 0 })
    assert.equal(f.limite()?.toISOString(), limitePurge(NOW).toISOString())
    assert.deepEqual(f.removed, ['GP-A/cv.pdf', 'GP-B/cv.docx'])
    assert.deepEqual(f.marked[0], { id: 'a', details: { offre: 'cv-pro-ats', express: false, cv_purge_le: NOW.toISOString() } })
  })

  test('échec du stockage : rien n\'est marqué comme purgé', async () => {
    const f = fake([{ id: 'a', ref: 'GP-A', cv_fichier: 'GP-A/cv.pdf', details: {} }], { removeFails: true })
    const r = await purgerCvExpires(f.deps, NOW)
    assert.deepEqual(r, { purges: 0, erreurs: 1 })
    assert.equal(f.marked.length, 0)
  })

  test('aucun candidat : aucune action', async () => {
    const f = fake([])
    assert.deepEqual(await purgerCvExpires(f.deps, NOW), { purges: 0, erreurs: 0 })
  })
})
