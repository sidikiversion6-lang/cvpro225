'use client';

import { useState } from 'react';
import { CVUploadStep } from './CVUploadStep';
import { CVAnalyzingStep } from './CVAnalyzingStep';
import { CVResultStep } from './CVResultStep';

function RateLimitedView({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl md:p-12">
        <div className="mb-6 text-6xl">🔒</div>
        <h2 className="mb-4 font-heading text-2xl font-bold text-dark md:text-3xl">
          Limite gratuite atteinte
        </h2>
        <p className="mb-8 text-lg leading-relaxed text-text-gray">
          {message || 'Vous avez déjà utilisé l’analyse gratuite aujourd’hui. Pour des analyses illimitées, commandez votre CV Pro ATS à 15 000 FCFA.'}
        </p>

        <div className="mb-8 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6">
          <h3 className="mb-3 text-xl font-semibold text-dark">Passez au niveau supérieur</h3>
          <p className="mb-4 text-text-gray">
            Avec CV Pro ATS, recevez un CV professionnel optimisé en 24-72h, avec analyse complète et recommandations personnalisées.
          </p>
          <ul className="mx-auto mb-2 max-w-md space-y-2 text-left">
            <li className="flex items-center gap-2 text-dark">
              <span className="text-primary">✓</span>
              CV professionnel PDF + DOCX
            </li>
            <li className="flex items-center gap-2 text-dark">
              <span className="text-primary">✓</span>
              Optimisation ATS avancée
            </li>
            <li className="flex items-center gap-2 text-dark">
              <span className="text-primary">✓</span>
              Lettre de motivation incluse
            </li>
          </ul>
        </div>

        <a
          href="/services/cv-pro"
          className="inline-block rounded-xl bg-primary px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-primary-600 hover:shadow-xl"
        >
          Découvrir CV Pro ATS — À partir de 15 000 FCFA →
        </a>

        <p className="mt-6 text-sm text-text-gray">
          Une question ?{' '}
          <a href="https://wa.me/2250799076241" className="font-medium text-primary hover:underline">
            Contactez-nous sur WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}

type Step = 'upload' | 'analyzing' | 'result' | 'rate_limited';

export interface Sector {
  id: string;
  label: string;
  icon: string;
}

export const SECTORS: Sector[] = [
  { id: 'ong', label: 'ONG / International', icon: '🌍' },
  { id: 'banque', label: 'Banque / Finance', icon: '🏦' },
  { id: 'telecom', label: 'Télécom / IT', icon: '📡' },
  { id: 'mines', label: 'Mines / Énergie', icon: '⛏️' },
  { id: 'administration', label: 'Administration publique', icon: '🏛️' },
  { id: 'entrepreneuriat', label: 'Entrepreneuriat', icon: '💡' },
  { id: 'autre', label: 'Autre secteur', icon: '📋' },
];

export interface CVCheckerState {
  step: Step;
  file: File | null;
  sector: string | null;
  firstName: string | null;
  whatsappNumber: string | null;
  result: any | null;
  rateLimitMessage?: string;
}

const INITIAL_STATE: CVCheckerState = {
  step: 'upload',
  file: null,
  sector: null,
  firstName: null,
  whatsappNumber: null,
  result: null,
};

export function CVCheckerFlow() {
  const [state, setState] = useState<CVCheckerState>(INITIAL_STATE);

  return (
    <div>
      {state.step === 'upload' && (
        <CVUploadStep
          onSubmit={({ file, sector, firstName, whatsappNumber }) => {
            setState({
              ...state,
              file,
              sector,
              firstName,
              whatsappNumber,
              step: 'analyzing',
            });
          }}
        />
      )}
      {state.step === 'analyzing' && (
        <CVAnalyzingStep
          file={state.file!}
          sector={state.sector!}
          firstName={state.firstName!}
          whatsappNumber={state.whatsappNumber!}
          onComplete={(result) => {
            setState({ ...state, result, step: 'result' });
          }}
          onRateLimited={(message) => {
            setState({ ...state, step: 'rate_limited', rateLimitMessage: message });
          }}
        />
      )}
      {state.step === 'result' && state.result && (
        <CVResultStep
          result={state.result}
          firstName={state.firstName || ''}
          whatsappNumber={state.whatsappNumber || ''}
          onReset={() => setState(INITIAL_STATE)}
        />
      )}
      {state.step === 'rate_limited' && (
        <RateLimitedView message={state.rateLimitMessage} />
      )}
    </div>
  );
}
