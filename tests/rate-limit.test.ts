import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  extractClientIP,
  getRateLimitConfig,
  reserveAnalysis,
  type ReserveRpc,
  type RateLimitConfig,
} from '../lib/cv-checker/rate-limiter'

const req = (headers: Record<string, string>) => new Request('https://cvpro225.com/api/cv-analyze', { headers })

describe('extractClientIP — seul X-Real-Ip (posé par Traefik) compte', () => {
  test('en-têtes falsifiés ignorés', () => {
    const r = req({
      'cf-connecting-ip': '8.8.8.8',
      'true-client-ip': '9.9.9.9',
      'x-client-ip': '5.5.5.5',
      'x-forwarded-for': '7.7.7.7, 6.6.6.6',
      'x-real-ip': '41.202.10.20',
    })
    assert.equal(extractClientIP(r), '41.202.10.20')
  })

  test('sans X-Real-Ip -> "unknown", même si d\'autres en-têtes sont présents', () => {
    assert.equal(extractClientIP(req({ 'cf-connecting-ip': '8.8.8.8', 'x-forwarded-for': '7.7.7.7' })), 'unknown')
    assert.equal(extractClientIP(req({})), 'unknown')
  })

  test('X-Real-Ip invalide -> "unknown" (pas d\'injection de clé arbitraire)', () => {
    assert.equal(extractClientIP(req({ 'x-real-ip': 'pas-une-ip' })), 'unknown')
    assert.equal(extractClientIP(req({ 'x-real-ip': '1.2.3.4, 5.6.7.8' })), 'unknown')
  })

  test('IPv6 accepté', () => {
    assert.equal(extractClientIP(req({ 'x-real-ip': '2001:db8::1' })), '2001:db8::1')
  })
})

describe('getRateLimitConfig', () => {
  test('défauts prudents', () => {
    assert.deepEqual(getRateLimitConfig({}), { ipLimit: 1, globalLimit: 100, windowHours: 24, whitelist: [] })
  })
  test('valeurs lues', () => {
    const c = getRateLimitConfig({ CV_ANALYSIS_IP_LIMIT: '3', CV_ANALYSIS_GLOBAL_DAILY_LIMIT: '250', CV_RATE_LIMIT_WHITELIST: ' 1.1.1.1 , unknown,' })
    assert.deepEqual(c, { ipLimit: 3, globalLimit: 250, windowHours: 24, whitelist: ['1.1.1.1', 'unknown'] })
  })
  test('invalide -> défaut (jamais illimité) ; 0 = service fermé', () => {
    assert.equal(getRateLimitConfig({ CV_ANALYSIS_GLOBAL_DAILY_LIMIT: 'beaucoup' }).globalLimit, 100)
    assert.equal(getRateLimitConfig({ CV_ANALYSIS_GLOBAL_DAILY_LIMIT: '-5' }).globalLimit, 100)
    assert.equal(getRateLimitConfig({ CV_ANALYSIS_GLOBAL_DAILY_LIMIT: '0' }).globalLimit, 0)
  })
})

describe('reserveAnalysis (RPC simulée)', () => {
  const cfg: RateLimitConfig = { ipLimit: 1, globalLimit: 100, windowHours: 24, whitelist: ['10.0.0.1'] }
  const rpcReturning = (row: object, calls: object[] = []): ReserveRpc => async (args) => {
    calls.push(args)
    return { data: [row], error: null }
  }

  test('autorisé -> id de réservation', async () => {
    const r = await reserveAnalysis('1.2.3.4', cfg, rpcReturning({ allowed: true, reason: 'ok', analysis_id: '42' }))
    assert.deepEqual(r, { allowed: true, analysisId: 42 })
  })

  test('limite IP -> 429', async () => {
    const r = await reserveAnalysis('1.2.3.4', cfg, rpcReturning({ allowed: false, reason: 'ip_limit', analysis_id: null }))
    assert.equal(r.allowed, false)
    if (!r.allowed) { assert.equal(r.reason, 'ip_limit'); assert.equal(r.status, 429) }
  })

  test('plafond global -> 503, service coupé', async () => {
    const r = await reserveAnalysis('1.2.3.4', cfg, rpcReturning({ allowed: false, reason: 'global_limit', analysis_id: null }))
    assert.equal(r.allowed, false)
    if (!r.allowed) { assert.equal(r.reason, 'global_limit'); assert.equal(r.status, 503) }
  })

  test('base en erreur -> fail-closed (503), jamais autorisé', async () => {
    const failing: ReserveRpc = async () => ({ data: null, error: { message: 'connection refused' } })
    const r = await reserveAnalysis('1.2.3.4', cfg, failing)
    assert.equal(r.allowed, false)
    if (!r.allowed) assert.equal(r.reason, 'unavailable')
    const throwing: ReserveRpc = async () => { throw new Error('timeout') }
    assert.equal((await reserveAnalysis('1.2.3.4', cfg, throwing)).allowed, false)
  })

  test('whitelist : lève le plafond IP mais PAS le plafond global', async () => {
    const calls: any[] = []
    await reserveAnalysis('10.0.0.1', cfg, rpcReturning({ allowed: true, analysis_id: 1 }, calls))
    await reserveAnalysis('1.2.3.4', cfg, rpcReturning({ allowed: true, analysis_id: 2 }, calls))
    assert.ok(calls[0].p_ip_limit > 1000)
    assert.equal(calls[0].p_global_limit, 100)
    assert.equal(calls[1].p_ip_limit, 1)
  })
})
