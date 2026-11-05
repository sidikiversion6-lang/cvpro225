'use client';

import { useEffect, useState, useRef } from 'react';

interface CVUploadStepProps {
  onSubmit: (data: {
    file: File;
    sector: string;
    firstName: string;
    whatsappNumber: string;
  }) => void;
}

const SECTORS = [
  { id: 'ong', label: '🌍 ONG / International' },
  { id: 'banque', label: '🏦 Banque / Finance' },
  { id: 'telecom', label: '📡 Télécom / IT' },
  { id: 'mines', label: '⛏️ Mines / Énergie' },
  { id: 'admin', label: '🏛️ Administration publique' },
  { id: 'entrepreneuriat', label: '💡 Entrepreneuriat' },
  { id: 'autre', label: '📋 Autre secteur' },
];

export function CVUploadStep({ onSubmit }: CVUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sector, setSector] = useState('');
  const [firstName, setFirstName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reprise depuis la home (?from=home) : si tous les champs sont en sessionStorage, auto-submit.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'home') return;

    const fileData = sessionStorage.getItem('cv_file_data');
    const fileName = sessionStorage.getItem('cv_file_name');
    const fileType = sessionStorage.getItem('cv_file_type');
    const savedSector = sessionStorage.getItem('cv_sector');
    const savedFirstName = sessionStorage.getItem('cv_first_name');
    const savedWhatsapp = sessionStorage.getItem('cv_whatsapp_number');

    sessionStorage.removeItem('cv_file_data');
    sessionStorage.removeItem('cv_file_name');
    sessionStorage.removeItem('cv_file_type');
    sessionStorage.removeItem('cv_sector');
    sessionStorage.removeItem('cv_first_name');
    sessionStorage.removeItem('cv_whatsapp_number');

    if (!fileData || !fileName) return;

    fetch(fileData)
      .then((res) => res.blob())
      .then((blob) => {
        const recovered = new File([blob], fileName, { type: fileType || blob.type });
        setFile(recovered);
        if (savedSector) setSector(savedSector);
        if (savedFirstName) setFirstName(savedFirstName);
        if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);

        // Auto-submit si tous les champs sont là
        if (savedFirstName && savedWhatsapp && savedSector) {
          setTimeout(() => {
            onSubmit({
              file: recovered,
              sector: savedSector,
              firstName: savedFirstName,
              whatsappNumber: savedWhatsapp,
            });
          }, 300);
        }
      })
      .catch(() => { /* fichier mal sérialisé — l'utilisateur ré-uploadera */ });
  }, [onSubmit]);

  const handleFileSelect = (selectedFile: File) => {
    const isPDF = selectedFile.name.toLowerCase().endsWith('.pdf');
    const isDOCX = selectedFile.name.toLowerCase().endsWith('.docx');
    if (!isPDF && !isDOCX) { setError('PDF ou DOCX uniquement'); return; }
    if (selectedFile.size > 5 * 1024 * 1024) { setError('Max 5 Mo'); return; }
    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = () => {
    setError(null);
    if (!firstName.trim() || firstName.trim().length < 2) {
      setError('Veuillez entrer votre prénom'); return;
    }
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 9) {
      setError('Numéro WhatsApp invalide (minimum 9 chiffres)'); return;
    }
    if (!file) { setError('Veuillez uploader votre CV'); return; }
    if (!sector) { setError('Veuillez choisir votre secteur'); return; }

    // Préfixe 225 si absent (le visiteur tape souvent juste son numéro local)
    const fullNumber = cleanNumber.startsWith('225') ? cleanNumber : `225${cleanNumber}`;

    onSubmit({ file, sector, firstName: firstName.trim(), whatsappNumber: fullNumber });
  };

  const isFormValid =
    firstName.trim().length >= 2 &&
    whatsappNumber.replace(/\D/g, '').length >= 9 &&
    !!file &&
    !!sector;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:p-10">
        <div className="mb-8 text-center">
          <h2 className="mb-3 font-heading text-2xl font-bold text-dark md:text-3xl">
            Testez votre CV gratuitement
          </h2>
          <p className="text-text-gray">
            Recevez votre score ATS et 3 conseils pour décrocher plus d&apos;entretiens.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold text-dark">1. Votre prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Konan"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-dark">2. Votre numéro WhatsApp</label>
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
              Pour recevoir vos résultats détaillés sur WhatsApp
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-dark">3. Votre CV</label>
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
              className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                file ? 'border-primary bg-primary/5'
                : isDragging ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary'
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
                  <div className="mb-2 text-4xl">✅</div>
                  <p className="font-semibold text-dark">{file.name}</p>
                  <p className="mt-1 text-xs text-text-gray">Cliquer pour changer</p>
                </div>
              ) : (
                <div>
                  <div className="mb-2 text-4xl">📄</div>
                  <p className="font-medium text-dark">Glissez votre CV ou cliquez</p>
                  <p className="text-xs text-text-gray">PDF ou DOCX, max 5 Mo</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-dark">4. Votre secteur d&apos;activité</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full cursor-pointer rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="">Choisissez votre secteur...</option>
              {SECTORS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full rounded-xl py-4 text-lg font-semibold transition ${
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
  );
}
