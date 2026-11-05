import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Lazy: instantiating at module load breaks `next build` without secrets.
let _resend: Resend | null = null;
const getResend = () => (_resend ??= new Resend(process.env.RESEND_API_KEY));

const FROM_EMAIL = 'CVPro225 Commandes <noreply@cvpro225.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@cvpro225.com';
const ADMIN_BCC_EMAIL = process.env.ADMIN_BCC_EMAIL || 'sidikipub@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const service = formData.get('service') as string;
    const serviceName = formData.get('serviceName') as string;
    const packId = formData.get('packId') as string;
    const packName = formData.get('packName') as string;
    const packPriceStr = formData.get('packPrice') as string;
    const packDelay = formData.get('packDelay') as string;
    const firstName = formData.get('firstName') as string;
    const whatsappNumber = formData.get('whatsappNumber') as string;
    const hasCV = formData.get('hasCV') === 'true';

    // Validation minimale
    if (!firstName || firstName.length < 2) {
      return NextResponse.json({ error: 'Prénom manquant.' }, { status: 400 });
    }
    if (!whatsappNumber || whatsappNumber.length < 9) {
      return NextResponse.json({ error: 'Numéro WhatsApp invalide.' }, { status: 400 });
    }
    if (!service || !packId) {
      return NextResponse.json({ error: 'Service ou pack manquant.' }, { status: 400 });
    }

    const packPrice = Number(packPriceStr) || 0;

    let cvFile: File | null = null;
    let sector = '';
    let jobTitle = '';
    let experienceYears = '';
    let education = '';
    let briefNote = '';

    if (hasCV) {
      cvFile = formData.get('cv') as File | null;
    } else {
      sector = (formData.get('sector') as string) || '';
      jobTitle = (formData.get('jobTitle') as string) || '';
      experienceYears = (formData.get('experienceYears') as string) || '';
      education = (formData.get('education') as string) || '';
      briefNote = (formData.get('briefNote') as string) || '';
    }

    console.log(`[order] Nouvelle commande : ${firstName} (+${whatsappNumber}) — ${serviceName} ${packName} ${packPrice} FCFA — hasCV=${hasCV}`);

    const html = buildOrderEmail({
      service: serviceName,
      packName,
      packPrice,
      packDelay,
      firstName,
      whatsappNumber,
      hasCV,
      cvFileName: cvFile?.name || null,
      sector,
      jobTitle,
      experienceYears,
      education,
      briefNote,
    });

    const attachments: Array<{ filename: string; content: Buffer }> = [];
    if (cvFile && cvFile.size > 0) {
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      attachments.push({ filename: cvFile.name, content: buffer });
    }

    const formattedPrice = new Intl.NumberFormat('fr-FR').format(packPrice);

    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      bcc: [ADMIN_BCC_EMAIL],
      reply_to: 'contact@cvpro225.com',
      subject: `🛒 Nouvelle commande : ${firstName} - ${serviceName} (${packName}) - ${formattedPrice} FCFA`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (result.error) {
      console.error('[order] Resend error:', result.error);
      return NextResponse.json(
        { error: 'Erreur envoi notification admin.', details: result.error.message },
        { status: 500 }
      );
    }

    console.log(`[order] Notification envoyée à ${ADMIN_EMAIL} (BCC ${ADMIN_BCC_EMAIL}) - ID: ${result.data?.id}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[order] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la commande' },
      { status: 500 }
    );
  }
}

interface OrderEmailData {
  service: string;
  packName: string;
  packPrice: number;
  packDelay: string;
  firstName: string;
  whatsappNumber: string;
  hasCV: boolean;
  cvFileName: string | null;
  sector: string;
  jobTitle: string;
  experienceYears: string;
  education: string;
  briefNote: string;
}

function buildOrderEmail(data: OrderEmailData): string {
  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p);
  const halfPrice = Math.round(data.packPrice / 2);

  const whatsappLink = `https://wa.me/${data.whatsappNumber}?text=${encodeURIComponent(
    `Bonjour ${data.firstName}, merci pour votre commande CVPro225 ! Je suis Jean et je vais vous accompagner pour votre ${data.service}. Procédons au paiement (${formatPrice(halfPrice)} FCFA) pour démarrer le travail.`
  )}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px; background: #F8FAFC;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

    <div style="background: linear-gradient(135deg, #0F7B5A 0%, #0B5E45 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">🛒 Nouvelle commande</h1>
    </div>

    <div style="padding: 30px;">

      <div style="background: #FEF3C7; border-left: 4px solid #D97706; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; color: #78350F; font-weight: 600;">⚡ Action requise : Contacter ${data.firstName} dans les 2h</p>
      </div>

      <h2 style="color: #0F172A; margin-bottom: 16px;">${data.service} — Pack ${data.packName}</h2>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr><td style="padding: 8px 0; color: #64748B;">Prix</td><td style="padding: 8px 0; font-weight: 700; color: #0F7B5A; font-size: 18px;">${formatPrice(data.packPrice)} FCFA</td></tr>
        <tr><td style="padding: 8px 0; color: #64748B;">Acompte (50%)</td><td style="padding: 8px 0; font-weight: 600;">${formatPrice(halfPrice)} FCFA</td></tr>
        <tr><td style="padding: 8px 0; color: #64748B;">Délai</td><td style="padding: 8px 0;">${data.packDelay}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748B;">Date</td><td style="padding: 8px 0;">${new Date().toLocaleString('fr-FR')}</td></tr>
      </table>

      <h3 style="color: #0F172A; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">👤 Client</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr><td style="padding: 8px 0; color: #64748B;">Prénom</td><td style="padding: 8px 0; font-weight: 600;">${data.firstName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748B;">WhatsApp</td><td style="padding: 8px 0; font-weight: 600;">+${data.whatsappNumber}</td></tr>
      </table>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700;">
          💬 Contacter ${data.firstName} sur WhatsApp
        </a>
      </div>

      ${data.hasCV ? `
        <h3 style="color: #0F172A; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">📄 CV existant</h3>
        <p style="color: #475569;">Le client a fourni son CV : <strong>${data.cvFileName || ''}</strong></p>
        <p style="color: #475569; font-size: 14px;">📎 Le CV est en pièce jointe de cet email.</p>
      ` : `
        <h3 style="color: #0F172A; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">✨ CV à créer</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748B;">Secteur</td><td style="padding: 8px 0;">${data.sector}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Poste recherché</td><td style="padding: 8px 0;">${data.jobTitle}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Expérience</td><td style="padding: 8px 0;">${data.experienceYears || 'Non renseigné'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Formation</td><td style="padding: 8px 0;">${data.education || 'Non renseigné'}</td></tr>
        </table>
        ${data.briefNote ? `
          <div style="background: #F1F5F9; padding: 12px; border-radius: 6px; margin-top: 12px;">
            <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Notes complémentaires :</strong></p>
            <p style="margin: 8px 0 0; color: #334155;">${data.briefNote}</p>
          </div>
        ` : ''}
      `}
    </div>

  </div>
</body>
</html>
  `;
}
