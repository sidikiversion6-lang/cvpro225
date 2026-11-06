'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { resolvePack, type OffreAffichee } from '@/lib/offres';

/**
 * Parcours court : 1) offre + Express  2) « Avez-vous déjà un CV ? »
 * 3) CV (si oui) + nom complet + WhatsApp (+ email optionnel)  4) paiement PayDunya.
 * Aucun prix n'est envoyé au serveur : il est recalculé côté serveur.
 */
type Step = 'offer-selection' | 'cv-question' | 'details' | 'success';

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41').replace(/\D/g, '');
const WHATSAPP_DISPLAY = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41';
const MAX_CV_BYTES = 5 * 1024 * 1024;

export interface CommandeFormProps {
  /** Offres au prix du moment, calculées côté serveur (lib/offres.ts). Affichage seulement. */
  offres: OffreAffichee[];
  express: { nom: string; prix: number; delai: string; description: string };
  launchBadge: string | null;
  plusChoisiBadge: string;
  finLancement: string | null;
  /** PayDunya configuré côté serveur : paiement en ligne à la fin du formulaire. */
  paymentOnline: boolean;
}

/** URL de paiement acceptée pour la redirection (évite toute redirection ouverte). */
function isPaydunyaUrl(u: unknown): u is string {
  try {
    const url = new URL(String(u));
    return url.protocol === 'https:' && (url.hostname === 'paydunya.com' || url.hostname.endsWith('.paydunya.com'));
  } catch {
    return false;
  }
}

function initialFromUrl(params: URLSearchParams, offres: OffreAffichee[]) {
  // On ouvre TOUJOURS sur le choix de l'offre (pré-sélectionnée) pour que l'option Express soit visible.
  const r = resolvePack(params.get('offre') || params.get('pack'));
  const express = params.get('express') === '1' || Boolean(r?.express);
  if (r && offres.some((o) => o.id === r.offre.id)) {
    return { step: 'offer-selection' as Step, offreId: r.offre.id as string, express };
  }
  const service = params.get('service');
  const duService = offres.filter((o) => o.service === service);
  return { step: 'offer-selection' as Step, offreId: duService.length === 1 ? duService[0].id : '', express };
}

/** Chiffres nationaux saisis (sans indicatif) : 10 chiffres pour la Côte d'Ivoire. */
function chiffresNationaux(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00225')) d = d.slice(5);
  else if (d.startsWith('225') && d.length > 10) d = d.slice(3);
  return d;
}

/** Affichage « 07 00 00 00 00 » pendant la saisie. */
function formaterSaisie(raw: string): string {
  return chiffresNationaux(raw).slice(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ');
}

export default function CommandeForm({ offres, express: EXPRESS, launchBadge, plusChoisiBadge, finLancement, paymentOnline }: CommandeFormProps) {
  const searchParams = useSearchParams();
  const initial = initialFromUrl(new URLSearchParams(searchParams.toString()), offres);

  const [step, setStep] = useState<Step>(initial.step);
  const [offreId, setOffreId] = useState<string>(initial.offreId);
  const [withExpress, setWithExpress] = useState<boolean>(initial.express);

  const offre = offres.find((o) => o.id === offreId) || null;
  // Affichage uniquement : le montant facturé est recalculé par le serveur.
  const total = offre ? offre.prix + (withExpress ? EXPRESS.prix : 0) : 0;
  const totalBarre = offre && offre.prixBarre !== null ? offre.prixBarre + (withExpress ? EXPRESS.prix : 0) : null;
  const delai = withExpress ? EXPRESS.delai : offre?.delai;
  const libelle = offre ? (withExpress ? `${offre.nom} + ${EXPRESS.nom}` : offre.nom) : '';

  const [hasCV, setHasCV] = useState<boolean | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [nomComplet, setNomComplet] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ ref: string; montant: number; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const firstName = nomComplet.trim().split(/\s+/)[0] || '';
  const formatPrice = (p: number) => p.toLocaleString('fr-FR').replace(/ | /g, ' ');
  const submitLabel = paymentOnline ? `Payer ${formatPrice(total)} FCFA →` : 'Confirmer la commande →';

  const telOk = /^\d{10}$/.test(chiffresNationaux(whatsappNumber));
  const emailOk = email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const nomOk = nomComplet.trim().length >= 2;
  const canSubmit = nomOk && telOk && emailOk && (hasCV === false || !!cvFile) && !isSubmitting;

  const handleFileSelect = (file: File) => {
    const n = file.name.toLowerCase();
    if (!n.endsWith('.pdf') && !n.endsWith('.docx')) { setError('PDF ou DOCX uniquement'); return; }
    if (file.size > MAX_CV_BYTES) { setError('Fichier trop lourd : 5 Mo maximum'); return; }
    setError(null);
    setCvFile(file);
  };

  const handleCVChoice = (choice: boolean) => {
    setHasCV(choice);
    if (!choice) setCvFile(null);
    setError(null);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!offre || hasCV === null) return;
    setError(null);
    setIsSubmitting(true);

    try {
      // Aucun prix n'est envoyé : le serveur le calcule (offre + Express + date de lancement).
      const formData = new FormData();
      formData.append('offre', offre.id);
      formData.append('express', String(withExpress));
      formData.append('nomComplet', nomComplet.trim());
      formData.append('whatsappNumber', `225${chiffresNationaux(whatsappNumber)}`);
      if (email.trim()) formData.append('email', email.trim());
      formData.append('hasCV', String(hasCV));
      if (hasCV && cvFile) formData.append('cv', cvFile);

      const response = await fetch('/api/order', { method: 'POST', body: formData });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la commande');
      }

      if (data.payment === 'paydunya' && isPaydunyaUrl(data.checkout_url)) {
        window.location.href = data.checkout_url;
        return;
      }

      setResult({ ref: data.ref, montant: data.montant, message: data.message || '' });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── SUCCÈS SANS PAIEMENT EN LIGNE (repli WhatsApp) ─────────────────────────────
  if (step === 'success' && offre && result) {
    const successWhatsappMessage = encodeURIComponent(
      `Bonjour CVPro225, je viens de passer la commande ${result.ref} (${libelle}, ${formatPrice(result.montant)} FCFA). Mon prénom : ${firstName}. Je souhaite finaliser le paiement.`
    );

    return (
      <div className="mx-auto max-w-2xl p-4 md:p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 bg-gradient-to-br from-green-50 to-white p-6 text-center text-dark md:p-10">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 md:h-24 md:w-24">
              <span className="text-5xl md:text-6xl">🎉</span>
            </div>
            <h2 className="mb-3 font-heading text-2xl font-bold text-dark md:text-3xl">
              Commande enregistrée, {firstName} !
            </h2>
            <p className="mx-auto max-w-md text-base text-text-gray md:text-lg">
              <strong className="text-primary">{libelle}</strong> · {formatPrice(result.montant)} FCFA
            </p>
            <p className="mt-2 font-mono text-sm text-gray-500">Réf : {result.ref}</p>
          </div>

          <div className="p-5 md:p-8">
            <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 md:p-5">
              <h3 className="mb-2 text-sm font-bold text-yellow-900 md:text-base">📋 Prochaine étape</h3>
              <p className="text-sm text-yellow-800 md:text-base">
                {result.message || 'Contactez-nous sur WhatsApp pour finaliser votre commande.'}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-green-500 bg-white p-5 text-center shadow-2xl md:p-8">
              <h3 className="mb-3 font-heading text-xl font-bold text-dark md:text-2xl">
                Finalisez sur WhatsApp
              </h3>
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

  // ─── ÉTAPE 0 — CHOIX DE L'OFFRE + OPTION EXPRESS ────────────────────────────────
  if (step === 'offer-selection' || !offre) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-dark md:text-4xl">
            Choisissez votre offre
          </h1>
          <p className="mx-auto max-w-2xl text-base text-text-gray md:text-lg">
            Sélectionnez la formule qui correspond à votre besoin. L&apos;option Express est disponible pour toutes les offres.
          </p>
          {launchBadge && (
            <p className="mx-auto mt-4 w-fit rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-amber-900">
              🎉 {launchBadge}{finLancement ? ` jusqu’au ${finLancement}` : ''}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 pt-4 lg:grid-cols-3">
          {offres.map((o) => {
            const isSelected = offreId === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setOffreId(o.id)}
                aria-pressed={isSelected}
                className={`relative flex flex-col rounded-2xl border-2 p-6 text-left transition ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xl ring-4 ring-primary/20'
                    : o.plusChoisi
                      ? 'border-primary bg-white shadow-xl hover:shadow-2xl lg:scale-105'
                      : 'border-gray-200 bg-white shadow-md hover:border-primary/50 hover:shadow-lg'
                }`}
              >
                {o.plusChoisi && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-5 py-1.5 text-sm font-bold text-white shadow-md">
                    ⭐ {plusChoisiBadge}
                  </span>
                )}

                <h3 className="mb-1 font-heading text-xl font-bold text-dark md:text-2xl">{o.nom}</h3>
                <p className="mb-4 text-sm text-text-gray">{o.accroche}</p>

                {launchBadge && o.prixBarre !== null && (
                  <span className="mb-1 inline-flex w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-amber-800">
                    🎉 {launchBadge}
                  </span>
                )}
                <div className="mb-4">
                  {o.prixBarre !== null && (
                    <p className="text-sm text-gray-400">
                      <span className="sr-only">Prix normal : </span><s>{formatPrice(o.prixBarre)} FCFA</s>
                    </p>
                  )}
                  <span className={`font-heading font-bold text-primary ${o.plusChoisi ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'}`}>
                    {formatPrice(o.prix)}
                  </span>
                  <span className="ml-1 text-sm font-medium text-text-gray">FCFA</span>
                </div>

                <p className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-text-gray">
                  ⏱️ Livraison {o.delai}
                </p>

                <ul className="mb-5 space-y-2">
                  {o.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dark">
                      <span className="mt-0.5 flex-shrink-0 text-primary">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`mt-auto rounded-xl py-3 text-center text-sm font-semibold transition ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-dark'
                  }`}
                >
                  {isSelected ? '✓ Sélectionnée' : 'Choisir cette offre'}
                </div>
              </button>
            );
          })}
        </div>

        <label className="mx-auto mt-8 flex max-w-3xl cursor-pointer items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="checkbox"
            checked={withExpress}
            onChange={(e) => setWithExpress(e.target.checked)}
            className="h-6 w-6 flex-shrink-0 accent-primary"
          />
          <span className="flex-1">
            <span className="block font-heading font-bold text-dark">⚡ {EXPRESS.nom} — livraison en {EXPRESS.delai}</span>
            <span className="block text-sm text-text-gray">{EXPRESS.description}, quelle que soit l&apos;offre choisie.</span>
          </span>
          <span className="whitespace-nowrap font-heading text-lg font-extrabold text-primary">+{formatPrice(EXPRESS.prix)} FCFA</span>
        </label>

        <div className="mx-auto mt-6 max-w-3xl">
          <button
            type="button"
            onClick={() => offre && setStep('cv-question')}
            disabled={!offre}
            className={`w-full rounded-xl py-4 text-lg font-semibold transition ${
              offre ? 'bg-primary text-white shadow-lg hover:bg-primary-600' : 'cursor-not-allowed bg-gray-300 text-white'
            }`}
          >
            {offre ? `Continuer — ${formatPrice(total)} FCFA →` : 'Sélectionnez une offre'}
          </button>
        </div>
      </div>
    );
  }


  // ─── ÉTAPES 2 ET 3 — CV ? puis coordonnées ──────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setStep('offer-selection')}
          className="py-2 text-text-gray hover:text-dark"
        >
          ← Changer d&apos;offre ou d&apos;option
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-600 p-5 text-white shadow-xl md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-sm opacity-80">Vous commandez :</p>
            <h1 className="mb-1 font-heading text-xl font-bold md:text-3xl">{offre.nom}</h1>
            <p className="text-sm opacity-90 md:text-lg">
              {withExpress ? `+ ${EXPRESS.nom} · ` : ''}Livraison {delai}
            </p>
            {launchBadge && totalBarre !== null && (
              <span className="mt-2 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide">🎉 {launchBadge}</span>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            {totalBarre !== null && <p className="text-sm opacity-70"><s>{formatPrice(totalBarre)} FCFA</s></p>}
            <p className="text-2xl font-bold md:text-4xl">{formatPrice(total)}</p>
            <p className="text-sm opacity-80">FCFA</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl md:p-8">
        {/* ÉTAPE 2 — UNE SEULE QUESTION */}
        {step === 'cv-question' && (
          <div>
            <h2 className="mb-6 text-center font-heading text-2xl font-bold text-dark">
              Avez-vous déjà un CV ?
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleCVChoice(true)}
                className="min-h-[7rem] rounded-2xl border-2 border-gray-300 p-6 text-center transition hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
              >
                <span className="block text-4xl" aria-hidden="true">📄</span>
                <span className="mt-2 block text-xl font-bold text-dark">Oui</span>
                <span className="block text-sm text-text-gray">Je l&apos;envoie pour optimisation</span>
              </button>
              <button
                type="button"
                onClick={() => handleCVChoice(false)}
                className="min-h-[7rem] rounded-2xl border-2 border-gray-300 p-6 text-center transition hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
              >
                <span className="block text-4xl" aria-hidden="true">✨</span>
                <span className="mt-2 block text-xl font-bold text-dark">Non</span>
                <span className="block text-sm text-text-gray">Vous le créez pour moi</span>
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — CV (si oui) + coordonnées */}
        {step === 'details' && (
          <div className="space-y-5">
            {hasCV ? (
              <div>
                <label className="mb-2 block font-semibold text-dark">Votre CV</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
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
                    <>
                      <span className="block text-4xl" aria-hidden="true">✅</span>
                      <span className="mt-2 block break-all font-semibold text-dark">{cvFile.name}</span>
                      <span className="mt-1 block text-xs text-text-gray">Toucher pour changer</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-4xl" aria-hidden="true">📄</span>
                      <span className="mt-2 block font-medium text-dark">Choisir mon CV</span>
                      <span className="block text-xs text-text-gray">PDF ou DOCX, 5 Mo maximum</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-4 text-dark">
                Pas de souci ! Un conseiller vous contactera sur WhatsApp après votre paiement pour recueillir vos informations.
              </div>
            )}

            <div>
              <label htmlFor="cmd-nom" className="mb-2 block font-semibold text-dark">Nom complet</label>
              <input
                id="cmd-nom"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                placeholder="Konan Kouassi"
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3.5 text-base focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cmd-whatsapp" className="mb-2 block font-semibold text-dark">Numéro WhatsApp</label>
              <div className="flex overflow-hidden rounded-xl border-2 border-gray-300 focus-within:border-primary">
                <span className="flex items-center bg-gray-50 px-4 text-base font-medium text-text-gray" aria-hidden="true">+225</span>
                <input
                  id="cmd-whatsapp"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(formaterSaisie(e.target.value))}
                  placeholder="07 00 00 00 00"
                  aria-describedby="cmd-whatsapp-aide"
                  className="w-full px-4 py-3.5 text-base tracking-wide focus:outline-none"
                />
              </div>
              <p id="cmd-whatsapp-aide" className={`mt-1 text-xs ${whatsappNumber && !telOk ? 'text-red-600' : 'text-text-gray'}`}>
                {whatsappNumber && !telOk ? '10 chiffres attendus' : 'Pour échanger avec vous pendant la rédaction'}
              </p>
            </div>

            <div>
              <label htmlFor="cmd-email" className="mb-2 block font-semibold text-dark">
                Email <span className="text-sm font-normal text-text-gray">(optionnel)</span>
              </label>
              <input
                id="cmd-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Pour recevoir la confirmation et le reçu"
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3.5 text-base focus:border-primary focus:outline-none"
              />
              {!emailOk && <p className="mt-1 text-xs text-red-600">Email invalide</p>}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep('cv-question')}
                className="rounded-xl border-2 border-gray-300 px-6 py-4 font-medium text-dark hover:bg-gray-50"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 rounded-xl py-4 text-lg font-bold transition ${
                  canSubmit ? 'bg-primary text-white shadow-lg hover:bg-primary-600' : 'cursor-not-allowed bg-gray-300 text-white'
                }`}
              >
                {isSubmitting ? 'Envoi en cours…' : submitLabel}
              </button>
            </div>

            <p className="text-center text-xs text-text-gray">
              {paymentOnline
                ? '🔒 Paiement sécurisé via PayDunya : Orange Money, MTN MoMo ou carte bancaire.'
                : 'Notre équipe vous contacte sur WhatsApp pour finaliser le paiement.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
