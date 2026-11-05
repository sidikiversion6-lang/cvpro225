/**
 * Test d'intégration du rate-limit contre une VRAIE base (fonction
 * cv_reserve_analysis + API REST). Ignoré sans variables :
 *
 *   CV_TEST_SUPABASE_URL=...         (projet Supabase de TEST, jamais la prod)
 *   CV_TEST_SERVICE_ROLE_KEY=...
 *   CV_TEST_ANON_KEY=...             (optionnel : vérifie le refus pour anon)
 *
 * Nettoie ses propres lignes (ip_address préfixée 'test-').
 */
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'

const URL = process.env.CV_TEST_SUPABASE_URL
const SERVICE = process.env.CV_TEST_SERVICE_ROLE_KEY
const ANON = process.env.CV_TEST_ANON_KEY
const enabled = Boolean(URL && SERVICE)

describe('rate-limit — intégration base', { skip: !enabled && 'CV_TEST_SUPABASE_URL absent' }, () => {
  let mod: typeof import('../lib/cv-checker/rate-limiter')
  let admin: import('@supabase/supabase-js').SupabaseClient
  const run = `test-${process.pid}-${Date.now()}`

  before(async () => {
    process.env.SUPABASE_URL = URL
    process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE
    mod = await import('../lib/cv-checker/rate-limiter')
    admin = (await import('../lib/cv-checker/supabase-client')).getSupabaseAdmin()
  })

  after(async () => {
    await admin?.from('cv_analyses_log').delete().like('ip_address', 'test-%')
  })

  // Les tests partagent la fenêtre globale de la base : on mesure le volume
  // existant pour calibrer le plafond global de chaque cas.
  const currentGlobal = async () => {
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const { count } = await admin.from('cv_analyses_log').select('id', { count: 'exact', head: true }).gte('created_at', since)
    return count ?? 0
  }

  test('20 requêtes simultanées de la même IP -> exactement 1 autorisée', async () => {
    const base = await currentGlobal()
    const cfg = { ipLimit: 1, globalLimit: base + 1000, windowHours: 24, whitelist: [] }
    const ip = `${run}-same`
    const results = await Promise.all(Array.from({ length: 20 }, () => mod.reserveAnalysis(ip, cfg)))
    assert.equal(results.filter((r) => r.allowed).length, 1)
    assert.ok(results.filter((r) => !r.allowed).every((r) => !r.allowed && r.reason === 'ip_limit'))
  })

  test('plafond global : 30 IP différentes simultanées, plafond +5 -> exactement 5', async () => {
    const base = await currentGlobal()
    const cfg = { ipLimit: 1, globalLimit: base + 5, windowHours: 24, whitelist: [] }
    const results = await Promise.all(Array.from({ length: 30 }, (_, i) => mod.reserveAnalysis(`${run}-g${i}`, cfg)))
    assert.equal(results.filter((r) => r.allowed).length, 5)
    const refused = results.filter((r) => !r.allowed)
    assert.ok(refused.every((r) => !r.allowed && r.reason === 'global_limit' && r.status === 503))
  })

  test('plafond global atteint -> coupe aussi une IP jamais vue et une IP whitelistée', async () => {
    const base = await currentGlobal()
    const cfg = { ipLimit: 1, globalLimit: base, windowHours: 24, whitelist: [`${run}-vip`] }
    const fresh = await mod.reserveAnalysis(`${run}-fresh`, cfg)
    const vip = await mod.reserveAnalysis(`${run}-vip`, cfg)
    assert.equal(fresh.allowed, false)
    assert.equal(vip.allowed, false)
  })

  test('release : une analyse échouée ne consomme pas le quota', async () => {
    const base = await currentGlobal()
    const cfg = { ipLimit: 1, globalLimit: base + 10, windowHours: 24, whitelist: [] }
    const ip = `${run}-release`
    const first = await mod.reserveAnalysis(ip, cfg)
    assert.ok(first.allowed)
    if (first.allowed) await mod.releaseAnalysis(first.analysisId)
    const second = await mod.reserveAnalysis(ip, cfg)
    assert.ok(second.allowed, 'après release, la même IP doit pouvoir réessayer')
    if (second.allowed) await mod.completeAnalysis(second.analysisId, { score: 70 })
    const third = await mod.reserveAnalysis(ip, cfg)
    assert.equal(third.allowed, false, 'une analyse complétée compte')
  })

  test('anon ne peut ni appeler la fonction ni lire le journal', { skip: !ANON && 'CV_TEST_ANON_KEY absent' }, async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const anon = createClient(URL!, ANON!, { auth: { persistSession: false } })
    const rpc = await anon.rpc('cv_reserve_analysis', { p_ip: `${run}-anon`, p_ip_limit: 99, p_global_limit: 99999, p_window_hours: 24 })
    assert.ok(rpc.error, 'RPC doit être refusée pour anon')
    const sel = await anon.from('cv_analyses_log').select('id').limit(1)
    assert.ok(sel.error, 'SELECT doit être refusé pour anon')
  })
})
