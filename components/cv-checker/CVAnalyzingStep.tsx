'use client';

import { useEffect, useRef } from 'react';

interface CVAnalyzingStepProps {
  file: File;
  sector: string;
  firstName: string;
  whatsappNumber: string;
  onComplete: (result: any) => void;
  onRateLimited?: (message: string) => void;
  onError?: (error: string) => void;
}

export function CVAnalyzingStep({ file, sector, firstName, whatsappNumber, onComplete, onRateLimited, onError }: CVAnalyzingStepProps) {
  // Garantit un seul appel à /api/cv-analyze par montage : neutralise le double-run
  // du StrictMode (dev) et les re-runs dus aux callbacks recréés par le parent.
  // Sans cette garde, chaque soumission insérait 2 lignes dans cv_leads.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const analyzeCV = async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sector', sector);
        formData.append('firstName', firstName);
        formData.append('whatsappNumber', whatsappNumber);

        const response = await fetch('/api/cv-analyze', {
          method: 'POST',
          body: formData,
        });

        // 429 = rate limit atteint (1 analyse par IP / 24h)
        if (response.status === 429) {
          const data = await response.json();
          if (onRateLimited) {
            onRateLimited(data.message || 'Limite gratuite atteinte.');
          } else {
            alert(data.message || 'Limite gratuite atteinte.');
          }
          return;
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erreur lors de l\'analyse');
        }

        const data = await response.json();
        onComplete(data.analysis);

      } catch (error: any) {
        console.error('Erreur analyse CV:', error);
        if (onError) {
          onError(error.message || 'Une erreur est survenue');
        } else {
          alert(`Erreur : ${error.message}`);
        }
      }
    };

    analyzeCV();
    // L'analyse ne s'exécute qu'au montage avec les valeurs initiales (une seule soumission).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center py-16 md:py-20">
      <div className="max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
        <h2 className="mb-4 text-2xl font-bold">Analyse en cours...</h2>
        <p className="text-text-gray">
          Nous extrayons le contenu de votre CV et l&apos;analysons selon les critères de votre secteur.
        </p>
        <div className="mt-8 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <span className="text-primary">✓</span>
            <span className="text-sm">Extraction du texte</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-sm">Analyse de la structure</span>
          </div>
          <div className="flex items-center gap-3 text-text-gray">
            <span>○</span>
            <span className="text-sm">Génération du rapport</span>
          </div>
        </div>
      </div>
    </div>
  );
}
