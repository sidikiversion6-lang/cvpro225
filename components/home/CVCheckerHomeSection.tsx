'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SECTORS = [
  { id: 'ong', label: '🌍 ONG / International' },
  { id: 'banque', label: '🏦 Banque / Finance' },
  { id: 'telecom', label: '📡 Télécom / IT' },
  { id: 'mines', label: '⛏️ Mines / Énergie' },
  { id: 'admin', label: '🏛️ Administration publique' },
  { id: 'entrepreneuriat', label: '💡 Entrepreneuriat' },
  { id: 'autre', label: '📋 Autre secteur' },
];

export function CVCheckerHomeSection() {
  const [file, setFile] = useState<File | null>(null);
  const [sector, setSector] = useState('');
  const [firstName, setFirstName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (selectedFile: File) => {
    const isPDF = selectedFile.name.toLowerCase().endsWith('.pdf');
    const isDOCX = selectedFile.name.toLowerCase().endsWith('.docx');
    if (!isPDF && !isDOCX) { setError('PDF ou DOCX uniquement'); return; }
    if (selectedFile.size > 5 * 1024 * 1024) { setError('Fichier trop volumineux (max 5 Mo)'); return; }
    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = () => {
    setError(null);

    if (!firstName.trim() || firstName.trim().length < 2) {
      setError('Veuillez entrer votre prénom');
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 9) {
      setError('Numéro WhatsApp invalide (minimum 9 chiffres)');
      return;
    }

    if (!file || !sector) {
      setError('Choisissez un CV et un secteur');
      return;
    }

    // Préfixe 225 si absent
    const fullNumber = cleanNumber.startsWith('225') ? cleanNumber : `225${cleanNumber}`;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        sessionStorage.setItem('cv_file_data', reader.result as string);
        sessionStorage.setItem('cv_file_name', file.name);
        sessionStorage.setItem('cv_file_type', file.type);
        sessionStorage.setItem('cv_sector', sector);
        sessionStorage.setItem('cv_first_name', firstName.trim());
        sessionStorage.setItem('cv_whatsapp_number', fullNumber);
      } catch {
        // Quota dépassé : on continue, l'utilisateur ré-uploadera sur la page suivante
      }
      router.push('/outils/cv-check?from=home');
    };
    reader.readAsDataURL(file);
  };

  const isFormValid =
    firstName.trim().length >= 2 &&
    whatsappNumber.replace(/\D/g, '').length >= 9 &&
    !!file &&
    !!sector;

  return (
    <section id="cv-checker" className="relative overflow-hidden bg-primary py-12 md:py-16 scroll-mt-24">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* COLONNE GAUCHE — PITCH */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              🆕 NOUVEAU
            </div>

            <h2 className="mb-6 font-heading text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              Pourquoi votre CV ne reçoit pas de réponses ?
            </h2>

            <p className="mb-8 text-lg leading-relaxed text-white/80 md:text-xl">
              Notre outil analyse votre CV en 30 secondes et vous donne la vraie raison.
            </p>

            <ul className="mb-6 space-y-3">
              {[
                'Analyse ATS (passage des filtres automatiques)',
                'Compatible CV PDF et Word',
                'Recommandations personnalisées',
                '100% gratuit, sans inscription',
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                    ✓
                  </span>
                  <span className="text-base text-white">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
              ✨ Analyse avancée
            </div>
          </div>

          {/* COLONNE DROITE — FORMULAIRE 4 CHAMPS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl md:p-8">
            <div className="space-y-4">
              {/* 1. Prénom */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  1. Votre prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Konan"
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* 2. WhatsApp */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  2. Votre numéro WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-gray">
                    +225
                  </span>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="07 99 07 62 41"
                    className="w-full rounded-xl border-2 border-gray-300 py-3 pl-16 pr-4 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. CV */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  3. Votre CV
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) handleFileSelect(f);
                  }}
                  className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
                    file ? 'border-primary bg-primary/5'
                    : isDragging ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  {file ? (
                    <div>
                      <div className="mb-1 text-3xl">✅</div>
                      <p className="truncate text-sm font-semibold text-dark">{file.name}</p>
                      <p className="mt-1 text-xs text-text-gray">Cliquer pour changer</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-1 text-3xl">📄</div>
                      <p className="text-sm font-medium text-dark">Glissez votre CV ou cliquez</p>
                      <p className="mt-1 text-xs text-text-gray">PDF ou DOCX, max 5 Mo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Secteur */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  4. Votre secteur d&apos;activité
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm text-dark focus:border-primary focus:outline-none"
                >
                  <option value="">Choisissez votre secteur...</option>
                  {SECTORS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`mt-2 w-full rounded-xl py-4 text-base font-semibold transition ${
                  isFormValid
                    ? 'bg-primary text-white shadow-lg hover:bg-primary-600'
                    : 'cursor-not-allowed bg-gray-300 text-white'
                }`}
              >
                Analyser mon CV gratuitement →
              </button>

              <p className="text-center text-xs text-text-gray">
                🔒 Vos données sont confidentielles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
