import { NextResponse } from 'next/server';

/**
 * Endpoint legacy DÉSACTIVÉ.
 *
 * Plus appelé par l'interface (le flux WhatsApp-first passe par /api/cv-analyze),
 * il restait public et :
 *   - insérait une seconde ligne cv_leads pour la même personne ;
 *   - envoyait un email à N'IMPORTE QUELLE adresse avec un contenu fourni par
 *     l'appelant (relais de spam/phishing via le domaine Resend).
 *
 * Historique : git log -- app/api/cv-report/route.ts
 */
export const dynamic = 'force-dynamic';

function gone() {
  return NextResponse.json(
    { error: 'gone', message: 'Cet endpoint n\'existe plus.' },
    { status: 410 }
  );
}

export const GET = gone;
export const POST = gone;
