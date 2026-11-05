'use client'

import Link from 'next/link'
import { useVisaSimulator } from '@/hooks/useVisaSimulator'
import { DESTINATIONS, getDestinationConfig, getScoreLevelConfig } from '@/lib/visa-config'
import ScoreCircle from './ScoreCircle'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+224600000000'

export default function VisaSimulator() {
  const {
    destination, config, result,
    setDestination, toggleDoc, checkAll, uncheckAll, isChecked,
  } = useVisaSimulator()

  const levelConfig = result ? getScoreLevelConfig(result.level) : null

  const waMessage = result && config
    ? `Bonjour, j'ai testé le simulateur visa pour ${config.label}. Mon score est ${result.score}/100. J'ai besoin d'aide.`
    : ''

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">

      {/* ── Partie haute : sélection destination ── */}
      <div className="bg-dark p-6">
        <h3 className="font-heading text-xl font-bold text-white">
          🛂 Évaluez votre dossier visa
        </h3>
        <p className="mt-1 text-sm text-white/60">
          Sélectionnez votre destination et cochez les documents que vous possédez
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {DESTINATIONS.map((dest) => {
            const cfg = getDestinationConfig(dest)
            const active = destination === dest
            return (
              <button
                key={dest}
                onClick={() => setDestination(dest)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-white/20 bg-white/10 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                <span className="text-lg">{cfg.flag}</span>
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Partie basse ── */}
      {!destination ? (
        <div className="px-6 py-16 text-center">
          <span className="text-5xl">🌍</span>
          <p className="mt-4 text-sm text-gray-400">
            Sélectionnez une destination pour commencer l&apos;évaluation
          </p>
        </div>
      ) : config && result && levelConfig ? (
        <div className="grid lg:grid-cols-2">

          {/* ── Colonne gauche : Documents ── */}
          <div className="border-r border-gray-100 p-6">
            <div className="mb-4">
              <h4 className="font-heading text-base font-bold text-dark">
                Documents requis — {config.label}
              </h4>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {config.formUrl && (
                  <a href={config.formUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    Formulaire {config.formLabel} →
                  </a>
                )}
                <a href={config.platformUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-vert hover:underline">
                  RDV sur {config.platform} →
                </a>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={checkAll} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50">
                  Tout cocher
                </button>
                <button onClick={uncheckAll} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50">
                  Tout décocher
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {config.documents.map((doc) => {
                const checked = isChecked(doc.id)
                return (
                  <label
                    key={doc.id}
                    className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      checked
                        ? 'border-vert/30 bg-vert/5'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDoc(doc.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-vert accent-vert"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${checked ? 'font-medium text-vert-dark' : 'text-gray-700'}`}>
                          {doc.label}
                        </span>
                        <span className={`flex-shrink-0 text-xs font-semibold ${checked ? 'text-vert' : 'text-gray-400'}`}>
                          {doc.points} pts
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        {doc.obligatoire && (
                          <span className="text-[0.6875rem] font-semibold text-rouge">Obligatoire</span>
                        )}
                        {doc.description && (
                          <span className="text-[0.6875rem] text-gray-400">{doc.description}</span>
                        )}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* ── Colonne droite : Score ── */}
          <div className="bg-[#FAFAFA] p-6 lg:sticky lg:top-24 lg:self-start">

            {/* Cercle de score */}
            <div className="flex flex-col items-center">
              <ScoreCircle score={result.score} level={result.level} />

              <div
                className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold"
                style={{ backgroundColor: levelConfig.bgColor, color: levelConfig.color }}
              >
                {levelConfig.emoji} {levelConfig.label}
              </div>

              <p className="mt-2 text-center text-sm italic text-gray-500">{levelConfig.message}</p>
            </div>

            {/* Barre de progression */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full transition-all duration-600 ease-out"
                  style={{ width: `${result.score}%`, backgroundColor: levelConfig.color }}
                />
              </div>
              <span className="text-xs font-semibold" style={{ color: levelConfig.color }}>{result.score}%</span>
            </div>

            <p className="mt-2 text-center text-sm text-gray-500">
              {result.checkedCount} / {result.totalCount} documents fournis
            </p>

            {/* Documents manquants */}
            {result.missing.length > 0 && (
              <div className="mt-5">
                <p className="flex items-center gap-1.5 text-sm font-bold text-rouge">
                  ⚠️ Documents manquants ({result.missing.length})
                </p>
                <div className="mt-2 space-y-1">
                  {result.missing.map((label) => (
                    <div key={label} className="flex items-start gap-2 rounded-lg bg-rouge/5 px-3 py-2 text-sm text-gray-700">
                      <span className="mt-0.5 text-rouge">✗</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA selon le score */}
            <div className="mt-6">
              {result.score >= 90 && result.missing.length === 0 ? (
                <div className="rounded-xl border border-vert/20 bg-vert/5 p-4">
                  <p className="font-heading text-sm font-bold text-vert">🎉 Votre dossier est prêt !</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Félicitations ! Votre dossier semble complet. Vous pouvez procéder au dépôt en toute confiance.
                  </p>
                  <a
                    href={config.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gp-btn mt-3 w-full rounded-full border-2 border-vert text-sm text-vert hover:bg-vert hover:text-white"
                  >
                    Prendre RDV maintenant →
                  </a>
                </div>
              ) : result.score >= 70 ? (
                <div className="rounded-xl border border-jaune/30 bg-jaune/5 p-4">
                  <p className="font-heading text-sm font-bold" style={{ color: '#D4A300' }}>👍 Dossier presque complet</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Quelques ajustements mineurs et votre dossier sera parfait.
                  </p>
                  <Link
                    href="/services/visa-check?pack=analyse"
                    className="gp-btn gp-btn-primary mt-3 w-full rounded-full text-sm"
                  >
                    Faire vérifier mon dossier
                  </Link>
                </div>
              ) : result.score >= 50 ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="font-heading text-sm font-bold text-primary">⚠️ Attention — Documents manquants</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Des documents importants manquent. Notre équipe peut vous aider à les obtenir.
                  </p>
                  <Link
                    href="/services/visa-check?pack=assistance"
                    className="gp-btn gp-btn-primary mt-3 w-full rounded-full text-sm"
                  >
                    Demander l&apos;assistance Visa Check
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-rouge/20 bg-rouge/5 p-4">
                  <p className="font-heading text-sm font-bold text-rouge">🚨 Dossier insuffisant</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Votre dossier présente des lacunes importantes. Un accompagnement complet est recommandé.
                  </p>
                  <Link
                    href="/services/visa-check?pack=complet"
                    className="gp-btn mt-3 w-full rounded-full bg-rouge text-sm text-white hover:opacity-90"
                  >
                    Commander le Pack Complet
                  </Link>
                  <a
                    href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gp-btn gp-btn-whatsapp mt-2 w-full rounded-full text-sm"
                  >
                    Parler à un conseiller →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
