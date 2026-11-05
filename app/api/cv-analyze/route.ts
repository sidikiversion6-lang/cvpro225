import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/cv-analyzer/extractor';
import { analyzeCV } from '@/lib/cv-analyzer/analyzer';
import {
  extractClientIP,
  reserveAnalysis,
  completeAnalysis,
  releaseAnalysis,
} from '@/lib/cv-checker/rate-limiter';
import { saveLead } from '@/lib/cv-checker/supabase-client';
import { sendAdminNotification } from '@/lib/cv-checker/email-service';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 secondes car IA peut prendre 10-20s

export async function POST(request: NextRequest) {
  let reservationId: number | null = null;
  try {
    const ip = extractClientIP(request);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sector = formData.get('sector') as string | null;
    const firstNameRaw = formData.get('firstName') as string | null;
    const whatsappRaw = formData.get('whatsappNumber') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'no_file', message: 'Aucun fichier fourni.' },
        { status: 400 }
      );
    }
    if (!sector) {
      return NextResponse.json(
        { error: 'no_sector', message: 'Secteur non spécifié.' },
        { status: 400 }
      );
    }
    if (!firstNameRaw || firstNameRaw.trim().length < 2) {
      return NextResponse.json(
        { error: 'no_firstname', message: 'Prénom manquant ou trop court.' },
        { status: 400 }
      );
    }

    const firstName = firstNameRaw.trim();
    const cleanWhatsApp = (whatsappRaw || '').replace(/\D/g, '');
    if (cleanWhatsApp.length < 9) {
      return NextResponse.json(
        { error: 'no_whatsapp', message: 'Numéro WhatsApp invalide.' },
        { status: 400 }
      );
    }

    // Réservation atomique (plafond IP + plafond global) AVANT tout appel IA
    const reservation = await reserveAnalysis(ip);
    if (!reservation.allowed) {
      console.log(`[cv-analyze] BLOCKED: ${reservation.reason} (ip ${ip})`);
      return NextResponse.json(
        {
          error: reservation.reason === 'ip_limit' ? 'rate_limited' : 'service_unavailable',
          message: reservation.message,
          ctaUrl: reservation.ctaUrl,
          ctaLabel: 'Découvrir CV Pro ATS',
        },
        { status: reservation.status }
      );
    }
    reservationId = reservation.analysisId;

    // Étape 1 : Extraction PDF/DOCX
    console.log(`[CV Check] Extraction du fichier ${file.name} (${file.size} bytes)`);
    const extracted = await extractTextFromFile(file);
    console.log(`[CV Check] Texte extrait : ${extracted.wordCount} mots`);

    // Étape 2 : Analyse IA Claude
    console.log(`[CV Check] Analyse IA en cours (secteur: ${sector})`);
    const analysis = await analyzeCV(extracted.text, sector);
    console.log(`[CV Check] Analyse terminée : score ${analysis.score}/100 — ${firstName}`);

    // Étape 3 : Compléter la réservation (elle compte désormais dans les plafonds)
    await completeAnalysis(reservationId, {
      cv_filename: extracted.fileName,
      sector,
      score: analysis.score,
      level: analysis.level,
      word_count: extracted.wordCount,
    });
    reservationId = null;

    // Étape 4 : Sauvegarder le lead (email factice basé sur WhatsApp pour respecter NOT NULL)
    const generatedEmail = `whatsapp_${cleanWhatsApp}@cvpro225.local`;
    const leadResult = await saveLead({
      email: generatedEmail,
      first_name: firstName,
      whatsapp_number: cleanWhatsApp,
      cv_filename: extracted.fileName,
      sector,
      score: analysis.score,
      level: analysis.level,
      word_count: extracted.wordCount,
      analysis_data: analysis,
      report_sent: true,
      ip_address: ip,
    });
    if (!leadResult.success) {
      console.error('[CV Check] saveLead error (continue anyway):', leadResult.error);
    }

    // Étape 5 : Envoyer le rapport COMPLET à l'admin (TO contact@cvpro225.com, BCC sidikipub)
    sendAdminNotification({
      firstName,
      whatsappNumber: cleanWhatsApp,
      score: analysis.score,
      level: analysis.level,
      sector,
      cv_filename: extracted.fileName,
      analysisData: {
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        keywordsSuggestion: analysis.keywordsSuggestion || [],
        summary: analysis.summary,
        scoresByCriteria: analysis.scoresByCriteria,
      },
    }).catch((err) => {
      console.error('[CV Check] sendAdminNotification error:', err);
    });

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        cv_filename: extracted.fileName,
        word_count: extracted.wordCount,
      },
      firstName,
      whatsappNumber: cleanWhatsApp,
      meta: {
        fileName: extracted.fileName,
        wordCount: extracted.wordCount,
      },
    });

  } catch (error: any) {
    console.error('[CV Check] Erreur:', error);
    // Échec (fichier illisible, erreur IA) : la tentative ne consomme pas le quota
    if (reservationId !== null) {
      await releaseAnalysis(reservationId).catch(() => {});
    }
    return NextResponse.json(
      {
        error: 'analysis_failed',
        message: error.message || 'Erreur lors de l\'analyse du CV.',
      },
      { status: 500 }
    );
  }
}
