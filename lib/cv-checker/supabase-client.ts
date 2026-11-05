import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // .select() forcé pour que les violations RLS remontent en erreur
    // (sans ça, return=minimal masque les 42501 → insert silencieusement KO)
    const { data, error } = await supabase
      .from('cv_leads')
      .insert([insertRow])
      .select();

    if (error) {
      console.error('[Supabase] Erreur insertion:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error('[Supabase] Insert sans erreur mais aucune ligne créée — RLS à vérifier');
      return { success: false, error: 'RLS policy blocks anon INSERT on cv_leads' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception:', err);
    return { success: false, error: err.message };
  }
}
