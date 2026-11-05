import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/cv-checker/supabase-client';
import { sendReportEmail } from '@/lib/cv-checker/email-service';
import {
  checkEmailRateLimit,
  extractClientIP,
  markAnalysisCompleted,
} from '@/lib/cv-checker/rate-limiter';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Validation email basique
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      analysis,
      sector,
      cv_filename,
      word_count,
    } = body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'invalid_email', message: 'Email invalide.' },
        { status: 400 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'no_analysis', message: 'Données d\'analyse manquantes.' },
        { status: 400 }
      );
    }

    // NIVEAU 2 — rate limit email (1 envoi / email / 24h)
    const ip = extractClientIP(request);
    const rateLimitCheck = await checkEmailRateLimit(email);
    if (!rateLimitCheck.allowed) {
      console.log(`[CV Report] Rate limited: ${email} (${rateLimitCheck.reason})`);
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: rateLimitCheck.message,
          ctaUrl: rateLimitCheck.ctaUrl || '/services/cv-pro',
          ctaLabel: 'Découvrir CV Pro ATS',
        },
        { status: 429 }
      );
    }

    console.log(`[CV Report] Nouveau lead: ${email} (score ${analysis.score})`);

    // 1. Stocker le lead dans Supabase (même si l'email échoue)
    const leadResult = await saveLead({
      email,
      cv_filename,
      sector,
      score: analysis.score,
      level: analysis.level,
      word_count,
      analysis_data: analysis,
      report_sent: false,
      ip_address: ip,
    });

    // Marquer l'analyse correspondante comme completed (lien analyse → email)
    markAnalysisCompleted(ip, email).catch((err) => {
      console.error('[CV Report] markAnalysisCompleted error:', err);
    });

    if (!leadResult.success) {
      console.error('[CV Report] Erreur Supabase:', leadResult.error);
      // On continue quand même pour envoyer l'email
    }

    // 2. Envoyer le rapport au client
    const clientEmailResult = await sendReportEmail({
      email,
      score: analysis.score,
      level: analysis.level,
      sector,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      keywordsSuggestion: analysis.keywordsSuggestion || [],
      summary: analysis.summary,
      scoresByCriteria: analysis.scoresByCriteria,
      cv_filename,
    });

    if (!clientEmailResult.success) {
      return NextResponse.json(
        {
          error: 'email_failed',
          message: 'Impossible d\'envoyer l\'email. Vérifiez votre adresse et réessayez.',
          details: clientEmailResult.error,
        },
        { status: 500 }
      );
    }

    // 3. Endpoint legacy : la notification admin est désormais envoyée depuis /api/cv-analyze
    //    (flow WhatsApp-first). Voir sendAdminNotification(AdminFullReportParams).

    return NextResponse.json({
      success: true,
      message: `Rapport envoyé à ${email}`,
    });

  } catch (error: any) {
    console.error('[CV Report] Erreur:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        message: error.message || 'Erreur serveur.',
      },
      { status: 500 }
    );
  }
}
