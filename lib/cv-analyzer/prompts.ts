export function buildAnalysisPrompt(cvText: string, sector: string): string {
  const sectorLabels: Record<string, string> = {
    'ong': 'ONG / International',
    'banque': 'Banque / Finance',
    'telecom': 'Télécom / IT',
    'mines': 'Mines / Énergie',
    'administration': 'Administration publique',
    'entrepreneuriat': 'Entrepreneuriat',
    'autre': 'Autre secteur',
  };

  const sectorLabel = sectorLabels[sector] || sector;

  return `Tu es un expert RH ivoirien spécialisé dans l'accompagnement de candidats vers les recruteurs locaux et internationaux (ONG, entreprises, ambassades). Tu dois analyser un CV et fournir une évaluation rigoureuse mais bienveillante.

CONTEXTE :
- Le candidat cible le secteur : ${sectorLabel}
- Le marché est la Côte d'Ivoire et/ou l'international (ONG, entreprises multinationales)
- Les filtres ATS (Applicant Tracking Systems) sont de plus en plus utilisés

VOICI LE CV À ANALYSER :
<cv>
${cvText}
</cv>

TA MISSION :
Analyse ce CV selon ces 5 critères, chacun noté sur 20 points :

1. **Compatibilité ATS** (20 points)
   - Structure lisible par les logiciels ?
   - Mots-clés pertinents pour ${sectorLabel} ?
   - Format simple sans éléments exotiques ?

2. **Clarté et structure** (20 points)
   - Sections bien identifiées (Expérience, Formation, Compétences) ?
   - Informations hiérarchisées ?
   - Lisibilité visuelle (hors PDF mais via le texte) ?

3. **Qualité du contenu** (20 points)
   - Expériences détaillées avec réalisations concrètes ?
   - Utilisation de verbes d'action ?
   - Résultats quantifiés (chiffres, pourcentages) ?

4. **Pertinence pour le secteur** (20 points)
   - Compétences adaptées à ${sectorLabel} ?
   - Mots-clés industriels présents ?
   - Expérience alignée avec le secteur ?

5. **Différenciation** (20 points)
   - Éléments qui font sortir du lot ?
   - Résumé professionnel impactant ?
   - Particularités valorisables ?

TU DOIS RÉPONDRE UNIQUEMENT EN JSON VALIDE, sans aucun texte avant ou après. Structure exacte :

{
  "score": <nombre de 0 à 100 = somme des 5 critères>,
  "level": "<excellent|bon|moyen|faible>",
  "scoresByCriteria": {
    "ats": <0-20>,
    "structure": <0-20>,
    "content": <0-20>,
    "sector": <0-20>,
    "differentiation": <0-20>
  },
  "strengths": [
    "<point fort 1 en 1 phrase claire>",
    "<point fort 2>",
    "<point fort 3>"
  ],
  "weaknesses": [
    "<faiblesse 1 en 1 phrase constructive>",
    "<faiblesse 2>",
    "<faiblesse 3>",
    "<faiblesse 4>"
  ],
  "recommendations": [
    "<recommandation concrète et actionnable 1>",
    "<recommandation 2>",
    "<recommandation 3>",
    "<recommandation 4>",
    "<recommandation 5>"
  ],
  "keywordsSuggestion": [
    "<mot-clé ATS recommandé 1>",
    "<mot-clé 2>",
    "<mot-clé 3>",
    "<mot-clé 4>",
    "<mot-clé 5>"
  ],
  "summary": "<résumé en 2-3 phrases de la qualité globale du CV et du potentiel du candidat>"
}

RÈGLES IMPORTANTES :
- "level" : si score >= 85 → "excellent" ; 70-84 → "bon" ; 50-69 → "moyen" ; <50 → "faible"
- Sois DIRECT mais BIENVEILLANT. Évite le jargon RH creux.
- Chaque recommandation doit être ACTIONNABLE (pas "améliorez votre CV" mais "ajoutez un résumé de 3 lignes en haut").
- Parle en français, ton professionnel mais accessible.
- N'invente pas de détails qui ne sont pas dans le CV.
- Si le CV est très court ou illisible, score bas (<40) et explique pourquoi.`;
}
