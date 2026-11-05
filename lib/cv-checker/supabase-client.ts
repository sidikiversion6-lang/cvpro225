import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase SERVEUR (clé service_role, contourne RLS).
 *
 * Les tables cv_leads / cv_analyses_log ne sont accessibles qu'au service_role :
 * aucune policy pour anon/authenticated. `server-only` fait échouer le build si
 * ce module est importé par un composant client — la clé ne peut pas fuiter
 * dans le bundle navigateur.
 *
 * Instanciation paresseuse : `next build` ne doit pas exiger les secrets.
 */
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
  }
  _client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export interface CVLead {
  email: string;
  cv_filename?: string;
  sector?: string;
  score?: number;
  level?: string;
  word_count?: number;
  analysis_data?: any;
  report_sent?: boolean;
  ip_address?: string;
  first_name?: string;
  whatsapp_number?: string;
}

export async function saveLead(lead: CVLead): Promise<{ success: boolean; error?: string }> {
  try {
    // Colonnes ajoutées conditionnellement (compat si la colonne n'existe pas encore)
    const insertRow: Record<string, unknown> = {
      email: lead.email,
      cv_filename: lead.cv_filename,
      sector: lead.sector,
      score: lead.score,
      level: lead.level,
      word_count: lead.word_count,
      analysis_data: lead.analysis_data,
      report_sent: lead.report_sent || false,
    };
    if (lead.ip_address) insertRow.ip_address = lead.ip_address;
    if (lead.first_name) insertRow.first_name = lead.first_name;
    if (lead.whatsapp_number) insertRow.whatsapp_number = lead.whatsapp_number;

    const { data, error } = await getSupabaseAdmin()
      .from('cv_leads')
      .insert([insertRow])
      .select('id');

    if (error) {
      console.error('[Supabase] Erreur insertion:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error('[Supabase] Insert sans erreur mais aucune ligne créée');
      return { success: false, error: 'cv_leads insert returned no row' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception:', err);
    return { success: false, error: err.message };
  }
}
