'use client'

import { useState, useEffect } from 'react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

const SLIDES = [
  {
    image: '/ban.png',
    label: 'CV Pro ATS',
    titre: 'Votre CV passe les filtres ATS. Décrochez 3x plus d\'entretiens.',
    sousTitre: 'CV optimisé par des experts pour les recruteurs en Côte d\'Ivoire et à l\'international.',
    cta: 'Commander mon CV',
    href: '/services/cv-pro',
  },
  {
    image: '/ban1.png',
    label: 'JobAssist',
    titre: 'Candidatures qui se démarquent. Résultats qui parlent.',
    sousTitre: 'Lettre de motivation, profil LinkedIn, coaching : l\'accompagnement complet pour décrocher le poste.',
    cta: 'Booster ma candidature',
    href: '/services/job-assist',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <section className="relative overflow-hidden" style={{ height: '85vh', minHeight: '500px' }}>
      {/* Slides background */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === current ? 1 : 0,
            backgroundImage: `url(${s.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Léger flou sur la gauche qui s'estompe vers la droite */}
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              maskImage: 'linear-gradient(to right, black 30%, transparent 65%)',
              WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 65%)',
            }}
          />
          {/* Assombrissement en fondu pour renforcer la lisibilité */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(13,31,53,0.70) 0%, rgba(13,31,53,0.35) 55%, rgba(13,31,53,0.0) 100%)' }}
          />
        </div>
      ))}

      {/* Contenu */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="w-full px-6 sm:px-10 lg:px-20 xl:px-24 mt-20 sm:mt-28">
          <div className="max-w-xl">
            {/* Label */}
            <p className="mb-3 text-xs sm:text-sm font-light tracking-[0.2em] text-white/80 underline underline-offset-4">
              {slide.label}
            </p>

            {/* Titre */}
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-snug text-white">
              {slide.titre}
            </h1>

            {/* Sous-titre */}
            <p className="mt-4 text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed">
              {slide.sousTitre}
            </p>

            {/* Ligne décorative */}
            <div className="mt-4 flex items-center gap-1.5">
              <div className="h-px w-8 bg-white/60" />
              <span className="text-white/60 text-xs">• • •</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flèches — cachées sur mobile */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white text-2xl hover:border-white hover:bg-white/10 transition-all"
      >‹</button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white text-2xl hover:border-white hover:bg-white/10 transition-all"
      >›</button>

      {/* Indicateurs */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-300 ${i === current ? 'w-8 bg-primary' : 'w-3 bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  )
}
