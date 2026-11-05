'use client';

const WHATSAPP_NUMBER = '2250799076241';
const WHATSAPP_DISPLAY = '+225 07 99 07 62 41';

interface CVResultStepProps {
  result: any;
  firstName: string;
  whatsappNumber: string;
  onReset: () => void;
}

export function CVResultStep({ result, firstName, onReset }: CVResultStepProps) {
  const score = result.score;
  const level = result.level;

  const scoreBg =
    score >= 85 ? 'bg-green-600' :
    score >= 70 ? 'bg-[#C41E3A]' :
    score >= 50 ? 'bg-orange-500' :
    'bg-red-600';

  const scoreMessage =
    score >= 85 ? "Votre CV est excellent ! Quelques optimisations finales le rendront imbattable." :
    score >= 70 ? "Votre CV a du potentiel, mais des points clés manquent." :
    score >= 50 ? "Votre CV présente plusieurs faiblesses qui réduisent vos chances." :
    "Votre CV nécessite une refonte importante pour être compétitif.";

  const userWhatsappMessage = encodeURIComponent(
    `Bonjour CVPro225, je suis ${firstName}. J'ai testé mon CV et obtenu un score de ${score}/100. Je souhaite débloquer le rapport complet.`
  );

  const weaknesses: string[] = result.weaknesses || [];
  const recommendations: string[] = result.recommendations || [];

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        {/* Header rouge */}
        <div className="bg-gradient-to-br from-primary to-primary-600 p-6 text-center text-white md:p-10">
          <p className="mb-2 text-base opacity-90 md:text-lg">Bonjour {firstName} 👋</p>
          <h2 className="mb-6 font-heading text-xl font-bold md:text-2xl">Voici votre diagnostic CV</h2>

          <div className={`inline-flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-white/30 font-bold text-white shadow-2xl md:h-40 md:w-40 ${scoreBg}`}>
            <div className="text-4xl md:text-5xl">{score}</div>
            <div className="text-xs opacity-90 md:text-sm">/ 100</div>
          </div>

          <p className="mt-4 text-base font-medium md:text-lg">Niveau : {level}</p>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-90 md:text-base">{scoreMessage}</p>
        </div>

        <div className="p-4 md:p-10">
          {/* Top 3 problèmes — visibles */}
          <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-5 md:p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-yellow-900">
              🎯 Top 3 des points à améliorer
            </h3>
            <ol className="list-inside list-decimal space-y-3 text-yellow-800">
              {weaknesses.slice(0, 3).map((w, i) => (
                <li key={i} className="font-medium leading-relaxed">{w}</li>
              ))}
            </ol>
          </div>

          {/* Bloc flouté — teaser des recommandations restantes */}
          <div className="relative mb-8 min-h-[200px] overflow-hidden rounded-xl bg-gray-50 p-6">
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 p-6 backdrop-blur-md">
              <div className="mb-3 text-5xl">🔒</div>
              <h3 className="mb-2 text-center text-lg font-bold text-dark md:text-xl">
                {Math.max(0, weaknesses.length - 3)}+ autres points identifiés
              </h3>
              <p className="max-w-md text-center text-sm text-text-gray md:text-base">
                Recommandations détaillées · Mots-clés ATS spécifiques · Plan d&apos;action complet
              </p>
            </div>
            <div className="opacity-30">
              <h4 className="mb-3 font-semibold">Recommandations détaillées</h4>
              <ul className="space-y-2 text-sm">
                {recommendations.slice(0, 4).map((r, i) => (
                  <li key={i}>• {r.substring(0, 60)}...</li>
                ))}
              </ul>
            </div>
          </div>

          {/* MEGA BLOC WHATSAPP — fond blanc, accents verts */}
          <div className="rounded-2xl border-2 border-green-500 bg-white p-6 text-center shadow-2xl md:p-10">
            {/* Icône WhatsApp dans cercle vert pâle */}
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 md:h-20 md:w-20">
              <span className="text-4xl md:text-5xl">📱</span>
            </div>

            <h3 className="mb-3 font-heading text-xl font-bold text-dark md:text-3xl">
              Débloquez votre rapport complet
            </h3>
            <p className="mx-auto mb-6 max-w-md text-base text-text-gray md:text-lg">
              Contactez-nous maintenant pour recevoir l&apos;analyse détaillée et nos recommandations personnalisées
            </p>

            {/* Numéro sur fond gris clair */}
            <div className="mb-6 inline-block max-w-full rounded-xl border border-gray-200 bg-gray-50 p-5 md:p-8">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Appelez ou écrivez sur WhatsApp
              </p>
              <p className="whitespace-nowrap text-2xl font-bold tracking-tight text-primary md:text-3xl lg:text-4xl">
                {WHATSAPP_DISPLAY}
              </p>
            </div>

            {/* Boutons CTA */}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${userWhatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-green-600 md:px-8 md:text-lg"
              >
                💬 Écrire sur WhatsApp
              </a>
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-500 bg-white px-6 py-4 text-base font-bold text-green-600 shadow-lg transition hover:bg-gray-50 md:px-8 md:text-lg"
              >
                📞 Appeler maintenant
              </a>
            </div>

            {/* Disponibilité */}
            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-text-gray md:text-sm">
              <span className="text-green-500">⚡</span> Réponse en 2h · Du lundi au samedi, 8h-20h
            </p>
          </div>

          {/* Reset */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onReset}
              className="text-sm text-text-gray underline hover:text-dark"
            >
              Tester un autre CV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
