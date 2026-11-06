'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { ServiceType, PackType, ModePaiement } from '@/types/commande'
import { PRIX_PACKS, LABELS_SERVICE, LABELS_PACK, SERVICE_COLORS } from '@/types/commande'
import { getPacksByService, formatPrix, PACK_FEATURES, SECTEURS } from '@/lib/commande-config'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

const SERVICES_LIST: { key: ServiceType; emoji: string; desc: string }[] = [
  { key: 'cv', emoji: '📄', desc: 'CV optimisé ATS' },
  { key: 'job', emoji: '💼', desc: 'Candidature emploi' },
]

const STEPS = ['Service & Pack', 'Vos informations', 'Détails', 'Confirmation']

export default function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initService = (searchParams.get('service') || '') as ServiceType | ''
  const initPack = (searchParams.get('pack') || '') as PackType | ''

  const [step, setStep] = useState(initService && initPack ? 1 : 0)
  const [service, setService] = useState<ServiceType | ''>(initService)
  const [pack, setPack] = useState<PackType | ''>(initPack)
  const [paiement, setPaiement] = useState<ModePaiement | ''>('')
  const [cgv, setCgv] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'payment_unavailable'>('idle')

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', ville: '', message: '',
    secteur_activite: '', niveau_etudes: '', annees_experience: '', langue_cv: 'francais',
    cv_existant: '', destination_visa: '', date_voyage_prevue: '', motif_voyage: '',
    secteur_recherche: '', type_contrat: '', offre_url: '',
    nom_entreprise: '', secteur_entreprise: '', ao_url: '',
  })

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }))
  const montant = pack ? PRIX_PACKS[pack] || 0 : 0
  const color = service ? SERVICE_COLORS[service] : '#0F7B5A'

  const canProceedStep0 = service && pack
  const canProceedStep1 = form.prenom && form.nom && form.email && form.telephone

  async function handleSubmit() {
    if (!service || !pack) return
    setStatus('loading')

    const details: Record<string, string> = {}
    if (service === 'cv') {
      if (form.secteur_activite) details.secteur_activite = form.secteur_activite
      if (form.niveau_etudes) details.niveau_etudes = form.niveau_etudes
      if (form.annees_experience) details.annees_experience = form.annees_experience
      details.langue_cv = form.langue_cv
      details.cv_existant = form.cv_existant
    } else if (service === 'visa') {
      if (form.destination_visa) details.destination_visa = form.destination_visa
      if (form.date_voyage_prevue) details.date_voyage_prevue = form.date_voyage_prevue
      if (form.motif_voyage) details.motif_voyage = form.motif_voyage
    } else if (service === 'job') {
      if (form.secteur_recherche) details.secteur_recherche = form.secteur_recherche
      if (form.type_contrat) details.type_contrat = form.type_contrat
      if (form.offre_url) details.offre_url = form.offre_url
    } else if (service === 'tender') {
      if (form.nom_entreprise) details.nom_entreprise = form.nom_entreprise
      if (form.secteur_entreprise) details.secteur_entreprise = form.secteur_entreprise
      if (form.ao_url) details.ao_url = form.ao_url
    }

    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service, pack, nom: form.nom, prenom: form.prenom,
          email: form.email, telephone: form.telephone,
          ville: form.ville, message: form.message,
          mode_paiement: paiement || undefined, details,
        }),
      })
      const json = await res.json()
      if (json.code === 'PAYMENT_UNAVAILABLE') {
        setStatus('payment_unavailable')
        return
      }
      if (!res.ok || !json.success) throw new Error(json.error)

      if (json.requires_payment && json.checkout_url) {
        window.location.href = json.checkout_url
        return
      }

      router.push(`/commander/confirmation?ref=${json.ref}&service=${service}&pack=${pack}`)
    } catch {
      setStatus('error')
    }
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
  const selectCls = inputCls

  return (
    <div className="mx-auto max-w-3xl py-12">
      {/* En-tête */}
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: `${color}12`, color }}>
          Nouvelle commande
        </span>
        <h1 className="font-heading text-3xl font-black text-dark">{STEPS[step]}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Remplissez le formulaire en 4 étapes.{' '}
          <a href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-vert hover:underline">
            Ou commandez sur WhatsApp
          </a>
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-10 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i < step ? 'bg-vert text-white' : i === step ? 'text-white' : 'bg-gray-200 text-gray-400'
                }`}
                style={i === step ? { backgroundColor: color } : undefined}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="mt-1.5 hidden text-[0.65rem] font-medium text-gray-400 sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 w-8 rounded sm:w-12 ${i < step ? 'bg-vert' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── ÉTAPE 0 : Service & Pack ── */}
      {step === 0 && (
        <div>
          <p className="mb-4 font-heading text-sm font-bold text-dark">Quel service vous intéresse ?</p>
          <div className="grid grid-cols-2 gap-4">
            {SERVICES_LIST.map((s) => {
              const active = service === s.key
              const c = SERVICE_COLORS[s.key]
              return (
                <button
                  key={s.key}
                  onClick={() => { setService(s.key); setPack('') }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    active ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={active ? { borderColor: c, backgroundColor: `${c}08` } : undefined}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="font-heading text-sm font-bold text-dark">{LABELS_SERVICE[s.key]}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {service && (
            <div className="mt-8">
              <p className="mb-4 font-heading text-sm font-bold text-dark">Choisissez votre pack</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {getPacksByService(service).map((p, i) => {
                  const active = pack === p
                  const isMiddle = i === 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPack(p)}
                      className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
                        active ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={active ? { borderColor: color, backgroundColor: `${color}08` } : undefined}
                    >
                      {isMiddle && (
                        <span className="absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold text-white" style={{ backgroundColor: color }}>
                          Recommandé
                        </span>
                      )}
                      <p className="font-heading text-sm font-bold text-dark">{LABELS_PACK[p]}</p>
                      <p className="mt-1 text-lg font-extrabold" style={{ color }}>{formatPrix(PRIX_PACKS[p] || 0)}</p>
                      <ul className="mt-3 space-y-1">
                        {(PACK_FEATURES[p] || []).map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-gray-500">
                            <span className="mt-0.5 text-vert">✓</span>{f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            disabled={!canProceedStep0}
            onClick={() => setStep(1)}
            className="gp-btn gp-btn-primary mt-8 w-full rounded-full py-3.5 font-bold disabled:opacity-40"
          >
            Continuer →
          </button>
        </div>
      )}

      {/* ── ÉTAPE 1 : Informations personnelles ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Prénom *</label>
              <input value={form.prenom} onChange={(e) => update('prenom', e.target.value)} className={inputCls} placeholder="Votre prénom" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Nom *</label>
              <input value={form.nom} onChange={(e) => update('nom', e.target.value)} className={inputCls} placeholder="Votre nom" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Email *</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputCls} placeholder="votre@email.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Téléphone WhatsApp *</label>
            <input type="tel" value={form.telephone} onChange={(e) => update('telephone', e.target.value)} className={inputCls} placeholder="+225 07 99 07 62 41" />
            <p className="mt-1 text-xs text-gray-400">📱 Nous vous contacterons sur ce numéro pour confirmer votre commande</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Ville / Localité</label>
            <input value={form.ville} onChange={(e) => update('ville', e.target.value)} className={inputCls} placeholder="Abidjan, Bouaké, Yamoussoukro..." />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Message complémentaire</label>
            <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={3} className={inputCls}
              placeholder={service === 'cv' ? 'Décrivez votre parcours en quelques mots...'
                : service === 'visa' ? 'Précisez votre destination et motif...'
                : service === 'job' ? 'Décrivez le type de poste recherché...'
                : 'Décrivez votre secteur d\'activité...'} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="gp-btn gp-btn-outline flex-1 rounded-full py-3.5 font-bold">← Retour</button>
            <button disabled={!canProceedStep1} onClick={() => setStep(2)} className="gp-btn gp-btn-primary flex-1 rounded-full py-3.5 font-bold disabled:opacity-40">Continuer →</button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : Détails spécifiques ── */}
      {step === 2 && (
        <div className="space-y-5">
          {service === 'cv' && (
            <>
              <p className="font-heading text-base font-bold text-dark">Détails pour votre CV</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Secteur d&apos;activité *</label>
                <select value={form.secteur_activite} onChange={(e) => update('secteur_activite', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Niveau d&apos;études *</label>
                <select value={form.niveau_etudes} onChange={(e) => update('niveau_etudes', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {['Bac', 'Bac+2', 'Bac+3', 'Bac+4/5', 'Bac+6 et plus', 'Autre'].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Années d&apos;expérience</label>
                <select value={form.annees_experience} onChange={(e) => update('annees_experience', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {['Aucune', '1-2 ans', '3-5 ans', '6-10 ans', 'Plus de 10 ans'].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Langue du CV</label>
                <div className="flex gap-4 mt-1">
                  {[{ v: 'francais', l: 'Français' }, { v: 'anglais', l: 'Anglais' }, { v: 'bilingue', l: 'Bilingue' }].map((o) => (
                    <label key={o.v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" name="langue_cv" value={o.v} checked={form.langue_cv === o.v} onChange={() => update('langue_cv', o.v)} className="accent-primary" />{o.l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Avez-vous un CV existant ?</label>
                <div className="flex gap-4 mt-1">
                  {[{ v: 'oui', l: 'Oui, je vais vous l\'envoyer' }, { v: 'non', l: 'Non, on part de zéro' }].map((o) => (
                    <label key={o.v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" name="cv_existant" value={o.v} checked={form.cv_existant === o.v} onChange={() => update('cv_existant', o.v)} className="accent-primary" />{o.l}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {service === 'visa' && (
            <>
              <p className="font-heading text-base font-bold text-dark">Détails pour votre dossier visa</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Destination *</label>
                <select value={form.destination_visa} onChange={(e) => update('destination_visa', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {['France', 'États-Unis', 'Canada', 'Turquie', 'Espace Schengen', 'Autre'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Date de voyage prévue</label>
                <input type="date" value={form.date_voyage_prevue} onChange={(e) => update('date_voyage_prevue', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Motif du voyage *</label>
                <select value={form.motif_voyage} onChange={(e) => update('motif_voyage', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {['Tourisme', 'Études', 'Travail', 'Visite familiale', 'Affaires', 'Autre'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </>
          )}

          {service === 'job' && (
            <>
              <p className="font-heading text-base font-bold text-dark">Détails pour votre candidature</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Secteur de recherche *</label>
                <select value={form.secteur_recherche} onChange={(e) => update('secteur_recherche', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Type de contrat</label>
                <select value={form.type_contrat} onChange={(e) => update('type_contrat', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {['CDI', 'CDD', 'Stage', 'Freelance', 'Tout'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Lien de l&apos;offre</label>
                <input type="url" value={form.offre_url} onChange={(e) => update('offre_url', e.target.value)} className={inputCls} placeholder="https://..." />
                <p className="mt-1 text-xs text-gray-400">Si vous avez déjà une offre précise, collez le lien ici</p>
              </div>
            </>
          )}

          {service === 'tender' && (
            <>
              <p className="font-heading text-base font-bold text-dark">Détails pour l&apos;appel d&apos;offres</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Nom de l&apos;entreprise *</label>
                <input value={form.nom_entreprise} onChange={(e) => update('nom_entreprise', e.target.value)} className={inputCls} placeholder="Votre entreprise" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Secteur d&apos;activité *</label>
                <select value={form.secteur_entreprise} onChange={(e) => update('secteur_entreprise', e.target.value)} className={selectCls}>
                  <option value="">Choisir...</option>
                  {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Lien de l&apos;appel d&apos;offres</label>
                <input type="url" value={form.ao_url} onChange={(e) => update('ao_url', e.target.value)} className={inputCls} placeholder="https://anrmp.ci/..." />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="gp-btn gp-btn-outline flex-1 rounded-full py-3.5 font-bold">← Retour</button>
            <button onClick={() => setStep(3)} className="gp-btn gp-btn-primary flex-1 rounded-full py-3.5 font-bold">Continuer →</button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 : Récapitulatif & Paiement ── */}
      {step === 3 && service && pack && (
        <div className="space-y-8">
          {/* Récap */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <span className="text-xl">{SERVICES_LIST.find((s) => s.key === service)?.emoji}</span>
              <span className="font-heading text-base font-bold text-dark">
                {LABELS_SERVICE[service]} — {LABELS_PACK[pack]}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Nom</span><span className="font-medium text-dark">{form.prenom} {form.nom}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-dark">{form.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-medium text-dark">{form.telephone}</span></div>
              {form.ville && <div className="flex justify-between"><span className="text-gray-500">Ville</span><span className="font-medium text-dark">{form.ville}</span></div>}
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="font-heading text-base font-bold text-dark">Montant</span>
                <span className="font-heading text-xl font-black" style={{ color }}>{formatPrix(montant)}</span>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div>
            <p className="mb-4 font-heading text-sm font-bold text-dark">Mode de paiement</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'orange_money' as ModePaiement, icon: 'OM', bg: '#0F7B5A', label: 'Orange Money', sub: 'Côte d\'Ivoire' },
                { key: 'mtn_momo' as ModePaiement, icon: 'MTN', bg: '#FFCC00', label: 'MTN MoMo', sub: 'Mobile Money', textColor: '#0F172A' },
                { key: 'paydunya' as ModePaiement, icon: 'PD', bg: '#2563EB', label: 'PayDunya', sub: 'Carte & Mobile' },
                { key: 'virement' as ModePaiement, icon: '🏦', bg: '#E5E7EB', label: 'Virement', sub: 'Banques locales', emoji: true },
              ]).map((p) => {
                const active = paiement === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => { setPaiement(p.key); setStatus('idle') }}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      active ? 'shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={active ? { borderColor: p.bg } : undefined}
                  >
                    {p.emoji ? (
                      <span className="text-2xl">{p.icon}</span>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: p.bg, color: p.textColor || 'white' }}>
                        {p.icon}
                      </span>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-semibold text-dark">{p.label}</p>
                      <p className="text-xs text-gray-400">{p.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Paiement à la commande via Orange Money, MTN MoMo, virement ou PayDunya.
            </p>
          </div>

          {/* CGV */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary" />
            <span className="text-sm text-gray-600">
              J&apos;accepte les{' '}
              <Link href="/cgv" className="font-medium text-primary hover:underline">Conditions Générales de Vente</Link>
              {' '}et la{' '}
              <Link href="/confidentialite" className="font-medium text-primary hover:underline">Politique de confidentialité</Link>
            </span>
          </label>

          {status === 'payment_unavailable' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Paiement en ligne bientôt disponible. Contactez-nous sur{' '}
              <a href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                WhatsApp
              </a>{' '}
              pour finaliser votre commande, ou choisissez le virement.
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-xl border border-rouge/20 bg-rouge/5 px-4 py-3 text-sm text-rouge">
              Une erreur est survenue. Veuillez réessayer ou nous contacter sur WhatsApp.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="gp-btn gp-btn-outline flex-1 rounded-full py-3.5 font-bold">← Retour</button>
            <button
              disabled={!cgv || status === 'loading'}
              onClick={handleSubmit}
              className="gp-btn flex-1 rounded-full py-3.5 text-base font-bold text-white disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" /></svg>
                  Traitement en cours...
                </span>
              ) : 'Confirmer ma commande →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
