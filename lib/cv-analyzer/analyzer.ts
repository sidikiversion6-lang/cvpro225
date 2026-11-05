import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult } from './types';
import { buildAnalysisPrompt } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Schema JSON transmis à Claude via output_config.format : garantit une sortie
// structurée et valide. Évite le parsing fragile de JSON embarqué dans du texte.
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer' },
    level: { type: 'string', enum: ['excellent', 'bon', 'moyen', 'faible'] },
    scoresByCriteria: {
      type: 'object',
      properties: {
        ats: { type: 'integer' },
        structure: { type: 'integer' },
        content: { type: 'integer' },
        sector: { type: 'integer' },
        differentiation: { type: 'integer' },
      },
      required: ['ats', 'structure', 'content', 'sector', 'differentiation'],
      additionalProperties: false,
    },
    strengths: { type: 'array', items: { type: 'string' } },
    weaknesses: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    keywordsSuggestion: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: [
    'score',
    'level',
    'scoresByCriteria',
    'strengths',
    'weaknesses',
    'recommendations',
    'keywordsSuggestion',
    'summary',
  ],
  additionalProperties: false,
} as const;

export async function analyzeCV(
  cvText: string,
  sector: string
): Promise<AnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Clé API Anthropic manquante. Contactez le support.');
  }

  const prompt = buildAnalysisPrompt(cvText, sector);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      output_config: {
        format: { type: 'json_schema', schema: ANALYSIS_SCHEMA },
      },
    } as any);

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('');

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erreur parsing JSON Claude:', responseText);
      throw new Error('Erreur de format de la réponse IA. Réessayez.');
    }

    if (typeof parsed.score !== 'number' || !Array.isArray(parsed.strengths)) {
      throw new Error('Réponse IA incomplète.');
    }

    return {
      score: parsed.score,
      level: parsed.level,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      recommendations: parsed.recommendations,
      keywordsSuggestion: parsed.keywordsSuggestion || [],
      sector: sector,
      scoresByCriteria: parsed.scoresByCriteria,
      summary: parsed.summary,
    };
  } catch (error: any) {
    console.error('Erreur Claude API:', error);

    if (error instanceof Anthropic.AuthenticationError) {
      throw new Error('Clé API invalide. Contactez le support.');
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error('Trop de requêtes. Réessayez dans quelques secondes.');
    }
    if (error instanceof Anthropic.APIError && error.status === 529) {
      throw new Error('Service IA temporairement surchargé. Réessayez dans 1 minute.');
    }

    throw new Error(error.message || 'Erreur lors de l\'analyse IA.');
  }
}
