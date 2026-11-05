'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

type Step =
  | 'service-selection'
  | 'pack-selection'
  | 'contact'
  | 'cv-question'
  | 'with-cv'
  | 'without-cv'
  | 'success';

const SECTORS = [
  { id: 'ong', label: '🌍 ONG / International' },
  { id: 'banque', label: '🏦 Banque / Finance' },
  { id: 'telecom', label: '📡 Télécom / IT' },
  { id: 'mines', label: '⛏️ Mines / Énergie' },
  { id: 'admin', label: '🏛️ Administration publique' },
  { id: 'entrepreneuriat', label: '💡 Entrepreneuriat' },
  { id: 'autre', label: '📋 Autre secteur' },
];

interface PackInfo {
  name: string;
  price: number;
  delay: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface ServiceInfo {
  name: string;
  icon: string;
  shortDesc: string;
  longDesc: string;
  packs: Record<string, PackInfo>;
}

const SERVICES_INFO: Record<string, ServiceInfo> = {
  cv: {
    name: 'CV Pro ATS',
    icon: '📄',
    shortDesc: 'Un CV optimisé qui passe les filtres ATS et décroche des entretiens.',
    longDesc:
      'Nos experts rédigent un CV moderne, optimisé pour les robots de recrutement (ATS) et calibré pour le marché ivoirien et international.',
    packs: {
      standard: {
        name: 'CV Pro ATS',
        price: 15000,
        delay: '48h',
        description: 'CV optimisé ATS, prêt à convaincre recruteurs et robots',
        features: [
          'CV professionnel PDF + DOCX',
          'Optimisation ATS avancée + rapport',
          'Mots-clés adaptés à votre secteur',
          'Retouches incluses',
        ],
      },
      'cv-express': {
        name: 'CV Pro ATS Express',
        price: 20000,
        delay: '24h',
        description: 'Livraison prioritaire en 24h',
        features: [
          'Tout le pack standard',
          'Livraison prioritaire en 24h',
        ],
      },
    },
  },
  job: {
    name: 'JobAssist',
    icon: '🎯',
    shortDesc: 'On postule pour vous aux meilleures offres et on suit vos candidatures.',
    longDesc:
      'On identifie les offres qui matchent votre profil, on rédige des candidatures sur mesure et on assure le suivi jusqu\'à l\'entretien.',
    packs: {
      'pack-3': {
        name: 'JobAssist',
        price: 30000,
        delay: '72h',
        description: 'On identifie les offres, on postule pour vous et on assure le suivi',
        features: [
          'Tout le CV Pro ATS, plus :',
          'Lettre de motivation personnalisée',
          'Optimisation du profil LinkedIn',
          'Coaching candidature',
        ],
      },
      'job-express': {
        name: 'JobAssist Express',
        price: 35000,
        delay: '48h',
        description: 'Livraison prioritaire en 48h',
        features: [
          'Tout le pack standard',
          'Livraison prioritaire en 48h',
        ],
      },
    },
  }
};

const SERVICE_ALIASES: Record<string, string> = {
  '1-candidature': 'candidature-1',
  audit: 'par-dossier',
  standard: 'mensuel-tender',
  premium: 'annuel',
};

const WHATSAPP_NUMBER = '2250799076241';
const WHATSAPP_DISPLAY = '+225 07 99 07 62 41';

function determineInitialStep(
  serviceParam: string | null,
  packParam: string | null
): { step: Step; serviceId: string; packId: string } {
  if (!serviceParam || !SERVICES_INFO[serviceParam]) {
    return { step: 'service-selection', serviceId: '', packId: '' };
  }

  const service = SERVICES_INFO[serviceParam];

  if (!packParam) {
    const packSlugs = Object.keys(service.packs);
    if (packSlugs.length === 1) {
      return { step: 'contact', serviceId: serviceParam, packId: packSlugs[0] };
    }
    return { step: 'pack-selection', serviceId: serviceParam, packId: '' };
  }

  const resolvedPack = service.packs[packParam]
    ? packParam
    : SERVICE_ALIASES[packParam] && service.packs[SERVICE_ALIASES[packParam]]
      ? SERVICE_ALIASES[packParam]
      : '';

  if (!resolvedPack) {
    const packSlugs = Object.keys(service.packs);
    if (packSlugs.length === 1) {
      return { step: 'contact', serviceId: serviceParam, packId: packSlugs[0] };
    }
    return { step: 'pack-selection', serviceId: serviceParam, packId: '' };
  }

  return { step: 'contact', serviceId: serviceParam, packId: resolvedPack };
}

export default function CommandeForm() {
  const searchParams = useSearchParams();
  const initial = determineInitialStep(
    searchParams.get('service'),
    searchParams.get('pack')
  );

  const [step, setStep] = useState<Step>(initial.step);
  const [serviceId, setServiceId] = useState<string>(initial.serviceId);
  const [packId, setPackId] = useState<string>(initial.packId);

  const service = serviceId ? SERVICES_INFO[serviceId] : null;
  const pack = service && packId ? service.packs[packId] : null;

  const [firstName, setFirstName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [hasCV, setHasCV] = useState<boolean | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [sector, setSector] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [briefNote, setBriefNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p);

  const isContactValid =
    firstName.trim().length >= 2 &&
    whatsappNumber.replace(/\D/g, '').length >= 9;

  const handleServiceSelect = (id: string) => {
    const svc = SERVICES_INFO[id];
    const packSlugs = svc ? Object.keys(svc.packs) : [];
    setServiceId(id);
    if (packSlugs.length === 1) {
      setPackId(packSlugs[0]);
      setStep('contact');
    } else {
      setPackId('');
      setStep('pack-selection');
    }
  };

  const handlePackSelect = (slug: string) => {
    setPackId(slug);
  };

  const handleFileSelect = (file: File) => {
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isDOCX = file.name.toLowerCase().endsWith('.docx');
    if (!isPDF && !isDOCX) { setError('PDF ou DOCX uniquement'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Max 5 Mo'); return; }
    setError(null);
    setCvFile(file);
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 'contact' && isContactValid) setStep('cv-question');
  };

  const handleCVChoice = (choice: boolean) => {
    setHasCV(choice);
    setStep(choice ? 'with-cv' : 'without-cv');
  };

  const handleSubmit = async () => {
    if (!service || !pack) return;
    setError(null);
    setIsSubmitting(true);

    try {
      let cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
      if (!cleanWhatsapp.startsWith('225')) cleanWhatsapp = `225${cleanWhatsapp}`;

      const formData = new FormData();
      formData.append('service', serviceId);
      formData.append('serviceName', service.name);
      formData.append('packId', packId);
      formData.append('packName', pack.name);
      formData.append('packPrice', String(pack.price));
      formData.append('packDelay', pack.delay);
      formData.append('firstName', firstName.trim());
      formData.append('whatsappNumber', cleanWhatsapp);
      formData.append('hasCV', String(hasCV));

      if (hasCV && cvFile) {
        formData.append('cv', cvFile);
      }

      if (!hasCV) {
        formData.append('sector', sector);
        formData.append('jobTitle', jobTitle.trim());
        formData.append('experienceYears', experienceYears);
        formData.append('education', education.trim());
        formData.append('briefNote', briefNote.trim());
      }

      const response = await fetch('/api/order', { method: 'POST', body: formData });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la commande');
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ÉTAPE SUCCESS — MEGA BLOC WHATSAPP ─────────────────────────────────────────
  if (step === 'success' && service && pack) {
    const successWhatsappMessage = encodeURIComponent(
      `Bonjour CVPro225, je viens de commander le pack ${pack.name} (${service.name}). Mon prénom : ${firstName}. Je souhaite confirmer le paiement.`
    );

    return (
      <div className="mx-auto max-w-2xl p-4 md:p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          {/* HEADER SUCCÈS — version subtile */}
          <div className="border-b border-gray-100 bg-gradient-to-br from-green-50 to-white p-6 text-center text-dark md:p-10">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 md:h-24 md:w-24">
              <span className="text-5xl md:text-6xl">🎉</span>
            </div>
            <h2 className="mb-3 font-heading text-2xl font-bold text-dark md:text-3xl">
              Commande reçue, {firstName} !
            </h2>
            <p className="mx-auto max-w-md text-base text-text-gray md:text-lg">
              Votre commande pour le pack <strong className="text-primary">{pack.name}</strong> est bien enregistrée.
            </p>
          </div>

          <div className="p-5 md:p-8">
            {/* Prochaine étape — jaune subtil */}
            <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 md:p-5">
              <h3 className="mb-2 text-sm font-bold text-yellow-900 md:text-base">📋 Prochaine étape</h3>
              <p className="text-sm text-yellow-800 md:text-base">
                Notre équipe vous contacte sur WhatsApp dans <strong>les 2 heures</strong> pour confirmer et procéder au paiement (50% à la commande).
              </p>
            </div>

            {/* MEGA BLOC WHATSAPP — fond blanc, accents verts */}
            <div className="rounded-2xl border-2 border-green-500 bg-white p-5 text-center shadow-2xl md:p-8">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 md:h-20 md:w-20">
                <span className="text-4xl md:text-5xl">📱</span>
              </div>

              <h3 className="mb-3 font-heading text-xl font-bold text-dark md:text-2xl">
                Pour accélérer, contactez-nous
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-text-gray md:text-base">
                Envoyez-nous &quot;Bonjour&quot; sur WhatsApp, on vous répond immédiatement
              </p>

              <div className="mb-6 inline-block max-w-full rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Appelez ou écrivez sur WhatsApp
                </p>
                <p className="whitespace-nowrap text-2xl font-bold tracking-tight text-primary md:text-3xl lg:text-4xl">
                  {WHATSAPP_DISPLAY}
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${successWhatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:bg-green-600 md:px-8 md:py-4 md:text-lg"
                >
                  💬 Écrire sur WhatsApp
                </a>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-500 bg-white px-6 py-3 text-base font-bold text-green-600 shadow-lg transition hover:bg-gray-50 md:px-8 md:py-4 md:text-lg"
                >
                  📞 Appeler maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ÉTAPE -1 — CHOIX DU SERVICE ────────────────────────────────────────────────
  if (step === 'service-selection') {
    return (
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-dark md:text-4xl">
            Quel service vous intéresse ?
          </h1>
          <p className="mx-auto max-w-2xl text-base text-text-gray md:text-lg">
            Choisissez le service CVPro225 qui correspond à votre besoin pour démarrer votre commande.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {Object.entries(SERVICES_INFO).map(([id, svc]) => (
            <button
              key={id}
              type="button"
              onClick={() => handleServiceSelect(id)}
              className="group flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 text-left shadow-md transition hover:-translate-y-1 hover:border-primary hover:shadow-xl md:p-8"
            >
              <div className="mb-4 text-5xl">{svc.icon}</div>
              <h3 className="mb-2 font-heading text-xl font-bold text-dark md:text-2xl">
                {svc.name}
              </h3>
              <p className="mb-4 flex-1 text-sm text-text-gray md:text-base">
                {svc.shortDesc}
              </p>
              <p className="mb-5 text-sm text-text-gray">
                {svc.longDesc}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-text-gray">
                  À partir de {formatPrice(Math.min(...Object.values(svc.packs).map((p) => p.price)))} FCFA
                </span>
                <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-primary-600">
                  Choisir →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-text-gray">Service non trouvé.</p>
        <button
          type="button"
          onClick={() => setStep('service-selection')}
          className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-600"
        >
          Choisir un service
        </button>
      </div>
    );
  }

  // ─── ÉTAPE 0 — CHOIX DU PACK ───────────────────────────────────────────────────
  if (step === 'pack-selection') {
    const uniquePacks = Object.entries(service.packs).filter(([, p], idx, arr) => {
      const sig = `${p.name}|${p.price}`;
      return arr.findIndex(([, q]) => `${q.name}|${q.price}` === sig) === idx;
    });

    return (
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <button
          type="button"
          onClick={() => {
            setPackId('');
            setStep('service-selection');
          }}
          className="mb-4 inline-flex items-center gap-1 text-sm text-text-gray hover:text-dark"
        >
          ← Changer de service
        </button>

        <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-600 p-6 text-white shadow-xl md:p-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{service.icon}</div>
            <div>
              <h1 className="mb-1 font-heading text-2xl font-bold md:text-3xl">{service.name}</h1>
              <p className="text-base opacity-90">{service.shortDesc}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="mb-2 font-heading text-2xl font-bold text-dark md:text-3xl">
            Choisissez votre pack
          </h2>
          <p className="text-text-gray">
            Sélectionnez la formule qui vous convient.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {uniquePacks.map(([slug, p]) => {
            const isSelected = packId === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => handlePackSelect(slug)}
                className={`relative flex flex-col rounded-2xl border-2 p-6 text-left transition ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xl ring-2 ring-primary/20'
                    : p.recommended
                      ? 'border-primary/40 bg-white shadow-lg hover:border-primary hover:shadow-xl'
                      : 'border-gray-200 bg-white shadow-md hover:border-primary/50 hover:shadow-lg'
                }`}
              >
                {p.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                    ⭐ Recommandé
                  </span>
                )}

                <h3 className="mb-1 font-heading text-xl font-bold text-dark md:text-2xl">
                  {p.name}
                </h3>
                <p className="mb-4 text-sm text-text-gray">{p.description}</p>

                <div className="mb-4">
                  <span className="font-heading text-3xl font-bold text-primary md:text-4xl">
                    {formatPrice(p.price)}
                  </span>
                  <span className="ml-1 text-sm font-medium text-text-gray">FCFA</span>
                </div>

                <p className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-text-gray">
                  ⏱️ Livraison {p.delay}
                </p>

                <ul className="mb-5 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dark">
                      <span className="mt-0.5 flex-shrink-0 text-primary">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`mt-auto rounded-xl py-3 text-center text-sm font-semibold transition ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-dark group-hover:bg-primary group-hover:text-white'
                  }`}
                >
                  {isSelected ? '✓ Sélectionné' : 'Choisir ce pack'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => packId && setStep('contact')}
            disabled={!packId}
            className={`w-full rounded-xl py-4 text-lg font-semibold transition ${
              packId
                ? 'bg-primary text-white shadow-lg hover:bg-primary-600'
                : 'cursor-not-allowed bg-gray-300 text-white'
            }`}
          >
            {packId ? 'Continuer →' : 'Sélectionnez un pack'}
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDU PRINCIPAL (contact / cv-question / with-cv / without-cv) ─────────────
  if (!pack) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-text-gray">Pack non trouvé.</p>
        <button
          type="button"
          onClick={() => setStep('pack-selection')}
          className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-600"
        >
          Choisir un pack
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => {
            setPackId('');
            setStep('service-selection');
          }}
          className="text-text-gray hover:text-dark"
        >
          ← Changer de service
        </button>
        <span className="text-gray-300">·</span>
        <button
          type="button"
          onClick={() => setStep('pack-selection')}
          className="text-text-gray hover:text-dark"
        >
          ← Changer de pack
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-600 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm opacity-80">Vous commandez :</p>
            <h1 className="mb-1 font-heading text-2xl font-bold md:text-3xl">{service.name}</h1>
            <p className="text-base opacity-90 md:text-lg">Pack {pack.name} · Livraison {pack.delay}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold md:text-4xl">{formatPrice(pack.price)}</p>
            <p className="text-sm opacity-80">FCFA</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:p-8">
        {/* ÉTAPE 1 — CONTACT */}
        {step === 'contact' && (
          <div className="space-y-5">
            <h2 className="mb-4 font-heading text-xl font-bold text-dark md:text-2xl">
              📝 Vos informations
            </h2>

            <div>
              <label className="mb-2 block font-semibold text-dark">Votre prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Konan"
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-dark">Votre numéro WhatsApp</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-text-gray">+225</span>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="07 99 07 62 41"
                  className="w-full rounded-xl border-2 border-gray-300 py-3 pl-16 pr-4 focus:border-primary focus:outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-text-gray">
                Pour vous contacter et procéder au paiement
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('pack-selection')}
                className="rounded-xl border-2 border-gray-300 px-6 py-3 font-medium text-dark hover:bg-gray-50"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isContactValid}
                className={`flex-1 rounded-xl py-3 text-lg font-semibold transition ${
                  isContactValid
                    ? 'bg-primary text-white shadow-lg hover:bg-primary-600'
                    : 'cursor-not-allowed bg-gray-300 text-white'
                }`}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — QUESTION CV */}
        {step === 'cv-question' && (
          <div className="space-y-6">
            <h2 className="mb-2 text-center font-heading text-xl font-bold text-dark md:text-2xl">
              Avez-vous déjà un CV ?
            </h2>
            <p className="mb-6 text-center text-text-gray">
              Si oui, nous pouvons l&apos;optimiser. Sinon, nous le créons pour vous.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleCVChoice(true)}
                className="group rounded-2xl border-2 border-gray-300 p-6 text-center transition hover:border-primary hover:bg-primary/5 md:p-8"
              >
                <div className="mb-3 text-5xl">📄</div>
                <h3 className="mb-2 text-lg font-bold text-dark">Oui, j&apos;ai déjà un CV</h3>
                <p className="text-sm text-text-gray">Je l&apos;envoie pour optimisation</p>
              </button>

              <button
                type="button"
                onClick={() => handleCVChoice(false)}
                className="group rounded-2xl border-2 border-gray-300 p-6 text-center transition hover:border-primary hover:bg-primary/5 md:p-8"
              >
                <div className="mb-3 text-5xl">✨</div>
                <h3 className="mb-2 text-lg font-bold text-dark">Non, à créer</h3>
                <p className="text-sm text-text-gray">Je n&apos;ai pas de CV existant</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep('contact')}
              className="mt-4 w-full text-sm text-text-gray underline hover:text-dark"
            >
              ← Retour
            </button>
          </div>
        )}

        {/* ÉTAPE 3a — AVEC CV */}
        {step === 'with-cv' && (
          <div className="space-y-5">
            <h2 className="mb-2 font-heading text-xl font-bold text-dark md:text-2xl">
              📄 Envoyez votre CV
            </h2>
            <p className="mb-4 text-text-gray">
              Notre équipe l&apos;analysera et l&apos;optimisera selon votre cible.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                cvFile ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              {cvFile ? (
                <div>
                  <div className="mb-3 text-5xl">✅</div>
                  <p className="font-semibold text-dark">{cvFile.name}</p>
                  <p className="mt-2 text-xs text-text-gray">Cliquer pour changer</p>
                </div>
              ) : (
                <div>
                  <div className="mb-3 text-5xl">📄</div>
                  <p className="mb-1 font-medium text-dark">Glissez votre CV ou cliquez</p>
                  <p className="text-xs text-text-gray">PDF ou DOCX, max 5 Mo</p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('cv-question')}
                className="rounded-xl border-2 border-gray-300 px-6 py-3 font-medium text-dark hover:bg-gray-50"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!cvFile || isSubmitting}
                className={`flex-1 rounded-xl py-3 text-lg font-semibold transition ${
                  cvFile && !isSubmitting
                    ? 'bg-primary text-white shadow-lg hover:bg-primary-600'
                    : 'cursor-not-allowed bg-gray-300 text-white'
                }`}
              >
                {isSubmitting ? 'Envoi en cours…' : 'Confirmer la commande →'}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3b — SANS CV */}
        {step === 'without-cv' && (
          <div className="space-y-5">
            <h2 className="mb-2 font-heading text-xl font-bold text-dark md:text-2xl">
              ✨ Création de votre CV
            </h2>
            <p className="mb-4 text-text-gray">Quelques infos pour personnaliser votre CV.</p>

            <div>
              <label className="mb-2 block font-semibold text-dark">Secteur d&apos;activité</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full cursor-pointer rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
              >
                <option value="">Choisissez votre secteur...</option>
                {SECTORS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-dark">Poste recherché</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Comptable, Chef de projet, Développeur..."
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-dark">Années d&apos;expérience</label>
              <select
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full cursor-pointer rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
              >
                <option value="">Sélectionnez...</option>
                <option value="0-1">Débutant (0-1 an)</option>
                <option value="2-5">2 à 5 ans</option>
                <option value="6-10">6 à 10 ans</option>
                <option value="10+">Plus de 10 ans</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-dark">Formation principale</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Ex: Master en gestion, Licence informatique..."
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-dark">
                Quelques infos complémentaires <span className="text-sm font-normal text-text-gray">(optionnel)</span>
              </label>
              <textarea
                value={briefNote}
                onChange={(e) => setBriefNote(e.target.value)}
                placeholder="Compétences clés, certifications, langues parlées..."
                rows={4}
                className="w-full resize-none rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('cv-question')}
                className="rounded-xl border-2 border-gray-300 px-6 py-3 font-medium text-dark hover:bg-gray-50"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!sector || !jobTitle.trim() || isSubmitting}
                className={`flex-1 rounded-xl py-3 text-lg font-semibold transition ${
                  sector && jobTitle.trim() && !isSubmitting
                    ? 'bg-primary text-white shadow-lg hover:bg-primary-600'
                    : 'cursor-not-allowed bg-gray-300 text-white'
                }`}
              >
                {isSubmitting ? 'Envoi en cours…' : 'Confirmer la commande →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
