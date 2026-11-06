import { isIP } from 'node:net';
import { formatFcfa, prixMin } from '@/lib/offres';
import { getSupabaseAdmin } from './supabase-client';

/**
 * Rate-limit du CV Checker (chaque analyse coûte un appel à l'API IA).
 *
 * - IP : UNIQUEMENT `X-Real-Ip`, posé par Traefik qui écrase toute valeur
 *   envoyée par le client (aucun trustedIPs). Les autres en-têtes
 *   (CF-Connecting-IP, True-Client-IP, X-Client-IP, X-Forwarded-For…) sont
 *   ignorés : Traefik les transmet tels quels, ils sont falsifiables.
 * - Atomique : la fonction Postgres `cv_reserve_analysis` compte ET réserve
 *   dans la même transaction (supabase/sql/03_cv_rate_limit.sql).
 * - Plafond global : au-delà de CV_ANALYSIS_GLOBAL_DAILY_LIMIT analyses sur
 *   24 h glissantes, le service est coupé pour tout le monde.
 * - Fail-closed : si la base ne répond pas, pas d'analyse (pas d'appel IA).
 */

export const CTA_URL = '/services/cv-pro';
// Prix lu à chaque appel (offre de lancement) — source : lib/offres.ts
const ctaPrice = () => formatFcfa(prixMin());
const WINDOW_HOURS = 24;
const WHITELIST_IP_LIMIT = 1_000_000;

export interface RateLimitConfig {
  ipLimit: number;
  globalLimit: number;
  windowHours: number;
  whitelist: string[];
}

function intFromEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

export function getRateLimitConfig(env: Record<string, string | undefined> = process.env): RateLimitConfig {
  return {
    ipLimit: intFromEnv(env.CV_ANALYSIS_IP_LIMIT, 1),
    // Valeur absente ou invalide -> défaut prudent (jamais "illimité")
    globalLimit: intFromEnv(env.CV_ANALYSIS_GLOBAL_DAILY_LIMIT, 100),
    windowHours: WINDOW_HOURS,
    whitelist: (env.CV_RATE_LIMIT_WHITELIST || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

/** IP client, uniquement depuis X-Real-Ip (Traefik). Sinon 'unknown' (seau partagé). */
export function extractClientIP(request: Request): string {
  const ip = request.headers.get('x-real-ip')?.trim();
  return ip && isIP(ip) ? ip : 'unknown';
}

export type ReserveResult =
  | { allowed: true; analysisId: number }
  | {
      allowed: false;
      reason: 'ip_limit' | 'global_limit' | 'unavailable';
      status: 429 | 503;
      message: string;
      ctaUrl: string;
    };

export type ReserveRpc = (args: {
  p_ip: string;
  p_ip_limit: number;
  p_global_limit: number;
  p_window_hours: number;
}) => Promise<{ data: unknown; error: { message: string } | null }>;

const defaultRpc: ReserveRpc = async (args) => {
  const { data, error } = await getSupabaseAdmin().rpc('cv_reserve_analysis', args);
  return { data, error };
};

export async function reserveAnalysis(
  ip: string,
  config: RateLimitConfig = getRateLimitConfig(),
  rpc: ReserveRpc = defaultRpc,
): Promise<ReserveResult> {
  const whitelisted = config.whitelist.includes(ip);
  let row: { allowed?: boolean; reason?: string; analysis_id?: number | string } | undefined;
  try {
    const { data, error } = await rpc({
      p_ip: ip,
      p_ip_limit: whitelisted ? WHITELIST_IP_LIMIT : config.ipLimit,
      p_global_limit: config.globalLimit,
      p_window_hours: config.windowHours,
    });
    if (error) throw new Error(error.message);
    row = Array.isArray(data) ? data[0] : (data as typeof row);
  } catch (err) {
    console.error('[RateLimit] réservation impossible (fail-closed):', err);
    return {
      allowed: false,
      reason: 'unavailable',
      status: 503,
      message: "L'analyse gratuite est momentanément indisponible. Réessayez dans quelques minutes.",
      ctaUrl: CTA_URL,
    };
  }

  if (row?.allowed && row.analysis_id !== undefined && row.analysis_id !== null) {
    return { allowed: true, analysisId: Number(row.analysis_id) };
  }
  if (row?.reason === 'global_limit') {
    console.warn('[RateLimit] plafond global journalier atteint — service coupé');
    return {
      allowed: false,
      reason: 'global_limit',
      status: 503,
      message: `L'analyse gratuite a atteint sa capacité du jour. Réessayez demain, ou commandez votre CV Pro ATS à partir de ${ctaPrice()}.`,
      ctaUrl: CTA_URL,
    };
  }
  return {
    allowed: false,
    reason: 'ip_limit',
    status: 429,
    message: `Limite gratuite atteinte. Pour aller plus loin, commandez votre CV Pro ATS à partir de ${ctaPrice()}.`,
    ctaUrl: CTA_URL,
  };
}

/** Complète la ligne réservée après une analyse réussie. */
export async function completeAnalysis(
  analysisId: number,
  data: { cv_filename?: string; sector?: string; score?: number; level?: string; word_count?: number },
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('cv_analyses_log')
    .update({ ...data, completed: true })
    .eq('id', analysisId);
  if (error) console.error('[RateLimit] completeAnalysis:', error.message);
}

/** Libère la réservation si l'analyse a échoué (fichier illisible, erreur IA). */
export async function releaseAnalysis(analysisId: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('cv_analyses_log')
    .delete()
    .eq('id', analysisId)
    .eq('completed', false);
  if (error) console.error('[RateLimit] releaseAnalysis:', error.message);
}
