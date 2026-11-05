import { supabase } from './supabase-client';

// Whitelist : IPs jamais rate-limited (tests admin)
const WHITELIST_IPS: string[] = [
  '127.0.0.1',
  '::1',
  // Ajouter ton IP perso ici si tu veux tester sans limite
  // Trouvable sur https://www.whatismyip.com
];

export interface RateLimitResult {
  allowed: boolean;
  reason?: 'ip_limit' | 'email_limit' | 'whitelisted';
  message?: string;
  ctaUrl?: string;
}

const RATE_LIMIT_HOURS = 24;
const CTA_PRICE = '15 000 FCFA';
const CTA_URL = '/services/cv-pro';

/**
 * Récupère l'IP réelle du client depuis les headers.
 * Compatible avec Cloudflare, Nginx, et environnements directs.
 */
export function extractClientIP(request: Request): string {
  const headerCandidates = [
    'cf-connecting-ip',  // Cloudflare
    'x-real-ip',         // Nginx classique
    'x-forwarded-for',   // Standard reverse proxy
    'x-client-ip',
    'true-client-ip',
  ];

  for (const header of headerCandidates) {
    const value = request.headers.get(header);
    if (value) {
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown' && ip !== '::1' && !ip.startsWith('127.')) {
        console.log(`[IP] Detected from ${header}: ${ip}`);
        return ip;
      }
    }
  }

  // Fallback : prendre x-forwarded-for même si localhost (dev), sinon 'unknown'
  const fallback = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  console.log(`[IP] Fallback: ${fallback}`);
  return fallback;
}

/**
 * Backward-compat alias (l'ancien code utilisait `getClientIP`).
 */
export const getClientIP = extractClientIP;

/**
 * NIVEAU 1 — vérifie si une IP peut faire une nouvelle analyse Claude.
 * Appelé AVANT /api/cv-analyze (avant que les tokens Claude soient consommés).
 */
export async function checkAnalyzeRateLimit(ip: string): Promise<RateLimitResult> {
  if (WHITELIST_IPS.includes(ip)) {
    console.log(`[RateLimit] IP ${ip} is whitelisted`);
    return { allowed: true, reason: 'whitelisted' };
  }

  if (!ip || ip === 'unknown') {
    console.warn('[RateLimit] No IP detected, allowing by default');
    return { allowed: true };
  }

  const since = new Date();
  since.setHours(since.getHours() - RATE_LIMIT_HOURS);

  const { data, error } = await supabase
    .from('cv_analyses_log')
    .select('id, created_at')
    .eq('ip_address', ip)
    .gte('created_at', since.toISOString())
    .limit(1);

  if (error) {
    console.error('[RateLimit] Analyze check error (fail-open):', error.message);
    return { allowed: true };
  }

  console.log(`[RateLimit] IP ${ip}: ${data?.length || 0} analyses in last 24h`);

  if (data && data.length > 0) {
    return {
      allowed: false,
      reason: 'ip_limit',
      message: `Limite gratuite atteinte. Pour des analyses illimitées, commandez votre CV Pro ATS à ${CTA_PRICE}.`,
      ctaUrl: CTA_URL,
    };
  }

  return { allowed: true };
}

/**
 * NIVEAU 2 — vérifie si un email peut recevoir un rapport.
 * Appelé AVANT /api/cv-report.
 */
export async function checkEmailRateLimit(email: string): Promise<RateLimitResult> {
  if (!email) return { allowed: true };

  const normalizedEmail = email.toLowerCase().trim();

  const since = new Date();
  since.setHours(since.getHours() - RATE_LIMIT_HOURS);

  const { data, error } = await supabase
    .from('cv_leads')
    .select('id, created_at')
    .eq('email', normalizedEmail)
    .gte('created_at', since.toISOString())
    .limit(1);

  if (error) {
    console.error('[RateLimit] Email check error (fail-open):', error.message);
    return { allowed: true };
  }

  console.log(`[RateLimit] Email ${normalizedEmail}: ${data?.length || 0} reports in last 24h`);

  if (data && data.length > 0) {
    return {
      allowed: false,
      reason: 'email_limit',
      message: `Cet email a déjà reçu un rapport aujourd'hui. Pour des analyses illimitées, commandez votre CV Pro ATS à ${CTA_PRICE}.`,
      ctaUrl: CTA_URL,
    };
  }

  return { allowed: true };
}

/**
 * Backward-compat — l'ancienne fonction. Délègue aux 2 niveaux.
 */
export async function checkRateLimit(ip: string, email?: string): Promise<RateLimitResult> {
  const ipCheck = await checkAnalyzeRateLimit(ip);
  if (!ipCheck.allowed) return ipCheck;
  if (email) return checkEmailRateLimit(email);
  return { allowed: true };
}

/**
 * Enregistre une analyse dans cv_analyses_log.
 * Appelé APRÈS une analyse Claude réussie, pour que la prochaine requête de la même IP soit bloquée.
 */
export async function logAnalysis(data: {
  ip_address: string;
  cv_filename?: string;
  sector?: string;
  score?: number;
  level?: string;
  word_count?: number;
}): Promise<{ id?: number; error?: string }> {
  const { data: result, error } = await supabase
    .from('cv_analyses_log')
    .insert({
      ip_address: data.ip_address,
      cv_filename: data.cv_filename,
      sector: data.sector,
      score: data.score,
      level: data.level,
      word_count: data.word_count,
      completed: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[logAnalysis] Insert error:', error.message);
    return { error: error.message };
  }

  console.log(`[logAnalysis] Logged analysis ID ${result.id} for IP ${data.ip_address}`);
  return { id: result.id };
}

/**
 * Marque la dernière analyse non-complétée d'une IP comme `completed=true` + ajoute l'email.
 * Appelé après que l'utilisateur a aussi envoyé son email.
 */
export async function markAnalysisCompleted(ip: string, email: string): Promise<void> {
  const since = new Date();
  since.setHours(since.getHours() - RATE_LIMIT_HOURS);

  const { data: analyses, error: selectError } = await supabase
    .from('cv_analyses_log')
    .select('id')
    .eq('ip_address', ip)
    .eq('completed', false)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (selectError) {
    console.error('[markCompleted] Select error:', selectError.message);
    return;
  }

  if (analyses && analyses.length > 0) {
    const { error: updateError } = await supabase
      .from('cv_analyses_log')
      .update({ completed: true, email: email.toLowerCase().trim() })
      .eq('id', analyses[0].id);

    if (updateError) {
      console.error('[markCompleted] Update error:', updateError.message);
    } else {
      console.log(`[markCompleted] Analysis ${analyses[0].id} marked completed for ${email}`);
    }
  }
}
