export function buildClientReportEmail(data: {
  email: string;
  score: number;
  level: string;
  sector: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordsSuggestion: string[];
  summary?: string;
  scoresByCriteria?: {
    ats: number;
    structure: number;
    content: number;
    sector: number;
    differentiation: number;
  };
}): string {
  const scoreColor =
    data.score >= 85 ? '#047857' :
    data.score >= 70 ? '#C41E3A' :
    data.score >= 50 ? '#D97706' : '#DC2626';

  const scoreLabel =
    data.score >= 85 ? 'Excellent' :
    data.score >= 70 ? 'Bon' :
    data.score >= 50 ? 'À améliorer' : 'Critique';

  const scoreMessage =
    data.score >= 85 ? "Votre CV est solide. Quelques optimisations finales le rendront imbattable." :
    data.score >= 70 ? "Votre CV a du potentiel, mais des éléments-clés manquent pour maximiser vos chances." :
    data.score >= 50 ? "Votre CV présente plusieurs faiblesses qui réduisent significativement vos chances d'être retenu." :
    "Votre CV nécessite une refonte importante pour être compétitif sur le marché actuel.";

  const urgencyMessage =
    data.score >= 85 ? "" :
    data.score >= 70 ? "Sur le marché actuel, ces lacunes peuvent vous coûter jusqu'à 50% des opportunités." :
    "Sur le marché actuel, jusqu'à 80% des CV similaires sont éliminés avant même d'être lus par un humain.";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Votre diagnostic CV CVPro225</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', Arial, sans-serif; background: #F8FAFC; color: #0F172A; margin: 0; padding: 20px; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

  .header { background: linear-gradient(135deg, #0F7B5A 0%, #0B5E45 100%); color: white; padding: 35px 25px; text-align: center; }
  .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
  .header p { margin: 10px 0 0; opacity: 0.95; font-size: 15px; }

  .content { padding: 35px 30px; }

  .score-section { text-align: center; margin-bottom: 25px; }
  .score-circle { width: 130px; height: 130px; border-radius: 50%; background: ${scoreColor}; color: white; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; }
  .score-circle .num { font-size: 44px; line-height: 1; }
  .score-circle .label { font-size: 13px; opacity: 0.9; margin-top: 4px; }
  .score-badge { display: inline-block; margin-top: 12px; padding: 6px 14px; background: ${scoreColor}; color: white; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .score-message { margin-top: 18px; font-size: 16px; color: #334155; font-weight: 500; max-width: 480px; margin-left: auto; margin-right: auto; }

  .urgency-box { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px 18px; margin: 25px 0; border-radius: 6px; }
  .urgency-box p { margin: 0; color: #7F1D1D; font-size: 14px; font-weight: 500; }

  .problems-box { background: #FFFBEB; padding: 22px; border-radius: 10px; border-left: 4px solid #D97706; margin: 25px 0; }
  .problems-box h2 { margin: 0 0 14px; color: #92400E; font-size: 17px; }
  .problems-box ul { margin: 0; padding-left: 22px; color: #78350F; }
  .problems-box li { margin-bottom: 10px; }

  .strengths-box { background: #ECFDF5; padding: 22px; border-radius: 10px; border-left: 4px solid #047857; margin: 25px 0; }
  .strengths-box h2 { margin: 0 0 14px; color: #065F46; font-size: 17px; }
  .strengths-box ul { margin: 0; padding-left: 22px; color: #064E3B; }
  .strengths-box li { margin-bottom: 8px; }

  .teaser-box { background: #F1F5F9; padding: 22px; border-radius: 10px; margin: 25px 0; }
  .teaser-box h2 { margin: 0 0 12px; color: #0F172A; font-size: 17px; }
  .teaser-box p { margin: 0; color: #475569; font-size: 14px; }
  .teaser-box .locked-list { margin-top: 12px; }
  .teaser-box .locked-item { display: flex; align-items: center; padding: 8px 0; color: #64748B; font-size: 14px; }
  .teaser-box .locked-icon { color: #0F7B5A; margin-right: 10px; flex-shrink: 0; }

  .cta-section { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: white; padding: 38px 25px; margin: 30px -30px -35px; text-align: center; }
  .cta-section h2 { margin: 0 0 12px; font-size: 22px; color: white; }
  .cta-section .subtitle { margin: 0 0 22px; opacity: 0.85; font-size: 15px; }
  .benefits { text-align: left; max-width: 400px; margin: 25px auto; }
  .benefit { display: flex; align-items: flex-start; margin-bottom: 12px; }
  .benefit-icon { color: #D4A574; margin-right: 10px; font-size: 18px; flex-shrink: 0; }
  .benefit-text { color: #E2E8F0; font-size: 14px; }
  .cta-button { display: inline-block; background: #0F7B5A; color: white !important; padding: 16px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 18px; }
  .cta-secondary { color: #94A3B8; font-size: 13px; margin-top: 22px; line-height: 1.6; }
  .cta-secondary a { color: #D4A574; text-decoration: none; font-weight: 500; }

  .footer { text-align: center; padding: 25px 20px; color: #64748B; font-size: 13px; background: #F8FAFC; }
  .footer a { color: #0F7B5A; text-decoration: none; font-weight: 500; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Votre diagnostic CV</h1>
      <p>Secteur ciblé : ${data.sector}</p>
    </div>

    <div class="content">
      <div class="score-section">
        <div class="score-circle">
          <div class="num">${data.score}</div>
          <div class="label">/ 100</div>
        </div>
        <div>
          <span class="score-badge">${scoreLabel}</span>
        </div>
        <div class="score-message">${scoreMessage}</div>
      </div>

      ${urgencyMessage ? `
      <div class="urgency-box">
        <p>⚠️ ${urgencyMessage}</p>
      </div>
      ` : ''}

      <div class="problems-box">
        <h2>🎯 Problèmes critiques identifiés</h2>
        <ul>
          ${data.weaknesses.slice(0, 3).map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>

      <div class="strengths-box">
        <h2>✅ Vos atouts</h2>
        <ul>
          ${data.strengths.slice(0, 2).map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div class="teaser-box">
        <h2>🔓 Ce qui débloquerait votre CV</h2>
        <p>Notre équipe d'experts a identifié les optimisations spécifiques nécessaires pour votre profil dans le secteur <strong>${data.sector}</strong>.</p>
        <div class="locked-list">
          <div class="locked-item">
            <span class="locked-icon">🔒</span>
            <span>Les mots-clés ATS exacts pour passer les filtres dans votre secteur</span>
          </div>
          <div class="locked-item">
            <span class="locked-icon">🔒</span>
            <span>Le plan d'action détaillé étape par étape</span>
          </div>
          <div class="locked-item">
            <span class="locked-icon">🔒</span>
            <span>La réécriture professionnelle de chaque section</span>
          </div>
          <div class="locked-item">
            <span class="locked-icon">🔒</span>
            <span>L'optimisation finale ATS-compatible</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <h2>🚀 Faites refaire votre CV par nos experts</h2>
      <p class="subtitle">Votre CV optimisé, prêt à passer les filtres ATS, en 48h.</p>

      <div class="benefits">
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">CV 100% optimisé pour les filtres ATS internationaux</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Mots-clés sectoriels adaptés à votre cible (ONG, banque, mines, télécom...)</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Réécriture par un expert RH connaissant le marché ivoirien</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Garantie satisfait ou refait - sans frais supplémentaires</span>
        </div>
      </div>

      <a href="https://cvpro225.com/services/cv-pro-ats" class="cta-button">
        Découvrir CV Pro ATS →
      </a>

      <p class="cta-secondary">
        Ou contactez-nous directement sur <a href="https://wa.me/2250799076241">WhatsApp</a><br>
        pour un devis personnalisé selon votre profil.
      </p>
    </div>

    <div class="footer">
      <p><strong>CVPro225</strong> · Votre partenaire carrière en Côte d'Ivoire</p>
      <p><a href="https://cvpro225.com">cvpro225.com</a> · contact@cvpro225.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function buildPlainTextVersion(data: {
  score: number;
  sector: string;
  strengths: string[];
  weaknesses: string[];
}): string {
  return `
Bonjour,

Votre diagnostic CV pour le secteur ${data.sector} est prêt.

═══════════════════════════════════
SCORE : ${data.score}/100
═══════════════════════════════════

PROBLÈMES CRITIQUES IDENTIFIÉS :
${data.weaknesses.slice(0, 3).map((w, i) => `${i + 1}. ${w}`).join('\n')}

VOS ATOUTS :
${data.strengths.slice(0, 2).map((s, i) => `${i + 1}. ${s}`).join('\n')}

═══════════════════════════════════
PRÊT À DÉBLOQUER VOTRE CV ?
═══════════════════════════════════

Notre service "CV Pro ATS" inclut :
✓ Réécriture complète par un expert RH
✓ Mots-clés ATS spécifiques à votre secteur
✓ CV 100% optimisé pour les filtres internationaux
✓ Garantie satisfait ou refait

Découvrir CV Pro ATS :
https://cvpro225.com/services/cv-pro-ats

Ou nous contacter sur WhatsApp :
https://wa.me/2250799076241

═══════════════════════════════════

L'équipe CVPro225
contact@cvpro225.com
https://cvpro225.com
  `.trim();
}

export function buildAdminNotificationEmail(data: {
  email: string;
  score: number;
  level: string;
  sector: string;
  cv_filename?: string;
}): string {
  const leadHeat =
    data.score < 50 ? { label: '🔥 LEAD CHAUD', color: '#DC2626', message: 'Score bas, besoin urgent d\'aide professionnelle' } :
    data.score < 70 ? { label: '🟠 LEAD INTÉRESSANT', color: '#D97706', message: 'Optimisations à faire, conversion possible' } :
    { label: '🟢 LEAD MODÉRÉ', color: '#047857', message: 'CV déjà bon, conversion plus difficile' };

  return `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; padding: 20px; background: #F8FAFC; }
  .card { background: white; padding: 24px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .heat-badge { display: inline-block; padding: 8px 16px; background: ${leadHeat.color}; color: white; border-radius: 20px; font-weight: 600; font-size: 13px; margin-bottom: 18px; }
  .heat-message { color: #475569; font-size: 14px; margin-bottom: 20px; padding: 12px; background: #F1F5F9; border-radius: 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 0; border-bottom: 1px solid #E2E8F0; }
  td:first-child { font-weight: 600; width: 40%; color: #64748B; }
  td:last-child { color: #0F172A; }
  .action-box { margin-top: 20px; padding: 16px; background: #FEF3C7; border-radius: 6px; }
  .action-box p { margin: 0; color: #78350F; font-size: 14px; }
</style></head>
<body>
  <div class="card">
    <h2 style="margin-top: 0;">🎯 Nouveau lead CV Checker</h2>

    <div class="heat-badge">${leadHeat.label}</div>
    <div class="heat-message">${leadHeat.message}</div>

    <table>
      <tr><td>Email</td><td><strong>${data.email}</strong></td></tr>
      <tr><td>Score</td><td><strong>${data.score}/100</strong> (${data.level})</td></tr>
      <tr><td>Secteur</td><td>${data.sector}</td></tr>
      ${data.cv_filename ? `<tr><td>Fichier</td><td>${data.cv_filename}</td></tr>` : ''}
      <tr><td>Date</td><td>${new Date().toLocaleString('fr-FR')}</td></tr>
    </table>

    <div class="action-box">
      <p>💡 <strong>Action suggérée :</strong> ${data.score < 70
        ? 'Envoyer un message WhatsApp personnalisé dans les 24h pour proposer le service CV Pro ATS.'
        : 'Lead moins prioritaire, suivi par newsletter ou retargeting.'}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Rapport COMPLET admin — version WhatsApp-first.
 * Envoyé à contact@cvpro225.com (BCC sidikipub@gmail.com) après chaque analyse.
 * Contient TOUT le détail (le client n'a plus de version mail).
 */
export function buildAdminFullReport(data: {
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
}): string {
  const scoreColor =
    data.score >= 85 ? '#047857' :
    data.score >= 70 ? '#C41E3A' :
    data.score >= 50 ? '#D97706' : '#DC2626';

  const leadHeat =
    data.score < 50 ? { label: '🔥 LEAD CHAUD', color: '#DC2626', tip: 'Score bas = besoin urgent. Contacter dans l\'heure.' } :
    data.score < 70 ? { label: '🟠 LEAD INTÉRESSANT', color: '#D97706', tip: 'Optimisations à faire. Contacter dans les 24h.' } :
    { label: '🟢 LEAD MODÉRÉ', color: '#047857', tip: 'CV déjà bon. Conversion plus difficile, suivi par newsletter.' };

  const whatsappMessage = encodeURIComponent(
    `Bonjour ${data.firstName}, je suis Jean de CVPro225. Suite à votre test CV (score ${data.score}/100), je peux vous aider à améliorer votre CV pour décrocher plus d'entretiens. Avez-vous 5 minutes pour en discuter ?`
  );
  const whatsappLink = `https://wa.me/${data.whatsappNumber}?text=${whatsappMessage}`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Nouveau lead CVPro225</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #F8FAFC; padding: 20px; margin: 0; }
  .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0F7B5A 0%, #0B5E45 100%); color: white; padding: 30px; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { padding: 30px; }
  .heat-badge { display: inline-block; padding: 8px 16px; background: ${leadHeat.color}; color: white; border-radius: 20px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
  .heat-tip { background: #F1F5F9; padding: 12px; border-left: 4px solid ${leadHeat.color}; margin-bottom: 24px; color: #475569; font-size: 14px; }
  .lead-card { background: #FAFAFA; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .lead-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0; }
  .lead-row:last-child { border-bottom: none; }
  .lead-label { color: #64748B; font-weight: 500; }
  .lead-value { color: #0F172A; font-weight: 600; }
  .score-block { text-align: center; margin: 24px 0; }
  .score-circle { display: inline-block; width: 100px; height: 100px; border-radius: 50%; background: ${scoreColor}; color: white; line-height: 100px; font-size: 32px; font-weight: 700; }
  .whatsapp-cta { background: #25D366; color: white !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; margin: 16px 0; }
  .section { margin: 24px 0; padding: 20px; background: #FAFAFA; border-radius: 8px; }
  .section h3 { margin-top: 0; color: #0F172A; font-size: 16px; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; }
  .section ul { padding-left: 20px; color: #334155; }
  .section li { margin-bottom: 6px; }
  .strengths { border-left: 4px solid #047857; }
  .weaknesses { border-left: 4px solid #D97706; }
  .recommendations { border-left: 4px solid #0F7B5A; }
  .keywords { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .keyword { background: white; border: 1px solid #0F7B5A; color: #0F7B5A; padding: 4px 12px; border-radius: 16px; font-size: 13px; }
  .footer { text-align: center; padding: 20px; background: #F8FAFC; color: #64748B; font-size: 13px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nouveau lead CVPro225</h1>
    </div>

    <div class="content">
      <div class="heat-badge">${leadHeat.label}</div>
      <div class="heat-tip">💡 ${leadHeat.tip}</div>

      <div class="lead-card">
        <div class="lead-row"><span class="lead-label">Prénom</span><span class="lead-value">${data.firstName}</span></div>
        <div class="lead-row"><span class="lead-label">WhatsApp</span><span class="lead-value">+${data.whatsappNumber}</span></div>
        <div class="lead-row"><span class="lead-label">Secteur</span><span class="lead-value">${data.sector}</span></div>
        <div class="lead-row"><span class="lead-label">CV envoyé</span><span class="lead-value">${data.cv_filename}</span></div>
        <div class="lead-row"><span class="lead-label">Date</span><span class="lead-value">${new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
      </div>

      <div class="score-block">
        <div class="score-circle">${data.score}</div>
        <p style="margin: 12px 0 0; font-size: 14px; color: #64748B;">Score sur 100 · Niveau ${data.level}</p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${whatsappLink}" class="whatsapp-cta">💬 Contacter ${data.firstName} sur WhatsApp</a>
      </div>

      ${data.analysisData.summary ? `
      <div class="section"><h3>📝 Synthèse de l'analyse</h3><p>${data.analysisData.summary}</p></div>
      ` : ''}

      <div class="section strengths">
        <h3>✅ Points forts (${data.analysisData.strengths.length})</h3>
        <ul>${data.analysisData.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>

      <div class="section weaknesses">
        <h3>⚠️ Points à améliorer (${data.analysisData.weaknesses.length})</h3>
        <ul>${data.analysisData.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>

      <div class="section recommendations">
        <h3>💡 Recommandations détaillées (${data.analysisData.recommendations.length})</h3>
        <ul>${data.analysisData.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>

      <div class="section">
        <h3>🔑 Mots-clés ATS suggérés</h3>
        <div class="keywords">${data.analysisData.keywordsSuggestion.map(k => `<span class="keyword">${k}</span>`).join('')}</div>
      </div>

      <div style="background: #FEF3C7; border-left: 4px solid #D97706; padding: 16px; border-radius: 8px; margin-top: 24px;">
        <h3 style="margin-top: 0; color: #92400E;">🎯 Action recommandée</h3>
        <p style="margin-bottom: 12px; color: #78350F;">
          ${data.score < 50
            ? `Envoyer un message WhatsApp à ${data.firstName} dans l'heure. Score critique = besoin urgent. Proposer le CV Pro ATS (15 000 FCFA, 48h).`
            : data.score < 70
            ? `Contacter ${data.firstName} dans les 24h. Score moyen = optimisations à faire. Proposer le CV Pro ATS (15 000 FCFA, 48h).`
            : `Lead moins prioritaire. Suivi par newsletter ou retargeting. CV déjà bon, conversion plus difficile.`}
        </p>
        <a href="${whatsappLink}" class="whatsapp-cta" style="margin: 0;">💬 Démarrer la conversation WhatsApp</a>
      </div>
    </div>

    <div class="footer">
      <p><strong>CVPro225 Admin Dashboard</strong></p>
      <p>contact@cvpro225.com</p>
    </div>
  </div>
</body>
</html>
  `;
}
