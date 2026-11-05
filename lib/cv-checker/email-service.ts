import { Resend } from 'resend';
import {
  buildClientReportEmail,
  buildAdminNotificationEmail,
  buildAdminFullReport,
  buildPlainTextVersion,
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'CVPro225 <noreply@cvpro225.com>';
// Nouveau flow WhatsApp-first : admin TO + BCC silencieux
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@cvpro225.com';
const ADMIN_BCC_EMAIL = process.env.ADMIN_BCC_EMAIL || 'sidikipub@gmail.com';

// ─── Legacy (pré-WhatsApp-first) — gardé pour compat éventuelle ────────────────────────

export interface SendReportParams {
  email: string;
  score: number;
  level: string;
  sector: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordsSuggestion: string[];
  summary?: string;
  scoresByCriteria?: any;
  cv_filename?: string;
}

export async function sendReportEmail(params: SendReportParams): Promise<{ success: boolean; error?: string }> {
  try {
    const html = buildClientReportEmail(params);
    const text = buildPlainTextVersion(params);

    const subject =
      params.score >= 85 ? `✅ Votre CV est solide (${params.score}/100) - Voici comment l'optimiser` :
      params.score >= 70 ? `📊 Votre diagnostic CV (${params.score}/100) - Points clés à corriger` :
      params.score >= 50 ? `⚠️ Votre CV nécessite des améliorations (${params.score}/100)` :
      `🔴 Votre CV nécessite une refonte urgente (${params.score}/100)`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      reply_to: 'contact@cvpro225.com',
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error('[Resend] Erreur envoi client:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[Resend] Email envoyé à ${params.email} - ID: ${result.data?.id}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Resend] Exception client:', err);
    return { success: false, error: err.message };
  }
}

// ─── Nouveau flow WhatsApp-first ──────────────────────────────────────────────────────

export interface AdminFullReportParams {
  firstName: string;
  whatsappNumber: string;
  score: number;
  level: string;
  sector: string;
  cv_filename: string;
  analysisData: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    keywordsSuggestion: string[];
    summary?: string;
    scoresByCriteria?: any;
  };
}

/**
 * Notifie l'admin avec le RAPPORT COMPLET.
 * Envoyé à `contact@cvpro225.com` avec BCC silencieux vers `sidikipub@gmail.com`.
 * Le client n'a plus de version mail dans le flow WhatsApp-first.
 */
export async function sendAdminNotification(
  params: AdminFullReportParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = buildAdminFullReport(params);

    const heatLabel =
      params.score < 50 ? '🔥 LEAD CHAUD' :
      params.score < 70 ? '🟠 LEAD INTÉRESSANT' :
      '🟢 LEAD MODÉRÉ';

    const subject = `${heatLabel} - ${params.firstName} (${params.score}/100) · ${params.sector}`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      bcc: ADMIN_BCC_EMAIL,
      reply_to: 'contact@cvpro225.com',
      subject,
      html,
    });

    if (result.error) {
      console.error('[Resend] Erreur envoi admin:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[Resend] Rapport admin envoyé à ${ADMIN_EMAIL} (BCC ${ADMIN_BCC_EMAIL}) - ID: ${result.data?.id}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Resend] Exception admin:', err);
    return { success: false, error: err.message };
  }
}

// ─── Legacy : ancienne signature de sendAdminNotification (cv-report) ─────────────────
// Conservée comme alias overload pour le code existant qui pourrait encore l'appeler
// avec l'ancienne forme `{ email, score, level, sector, cv_filename }`.
// Le nouveau flow utilise sendAdminNotification(AdminFullReportParams) ci-dessus.

void buildAdminNotificationEmail; // garde l'import « marked as used » au cas où
