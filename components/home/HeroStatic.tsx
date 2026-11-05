import Link from 'next/link'

// Version statique du hero : reprend la 1re slide de HeroSection (CV Pro ATS),
// sans carrousel ni auto-play. HeroSection est conservé mais n'est plus rendu.
const SLIDE = {
  image: '/ban.png',
  label: 'CV Pro ATS',
  titre: 'Votre CV passe les filtres ATS. Décrochez 3x plus d\'entretiens.',
  sousTitre: 'CV optimisé par des experts pour les recruteurs en Côte d\'Ivoire et à l\'international.',
  cta: 'Commander mon CV',
  href: '/services/cv-pro',
}

export default function HeroStatic() {
  return (
    <section className="relative overflow-hidden" style={{ height: '85vh', minHeight: '500px' }}>
      {/* Fond */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${SLIDE.image})`,
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

      {/* Contenu */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="w-full px-6 sm:px-10 lg:px-20 xl:px-24 mt-20 sm:mt-28">
          <div className="max-w-xl">
            <p className="mb-3 text-xs sm:text-sm font-light tracking-[0.2em] text-white/80 underline underline-offset-4">
              {SLIDE.label}
            </p>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-snug text-white">
              {SLIDE.titre}
            </h1>

            <p className="mt-4 text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed">
              {SLIDE.sousTitre}
            </p>

            {/* Ligne décorative */}
            <div className="mt-4 flex items-center gap-1.5">
              <div className="h-px w-8 bg-white/60" />
              <span className="text-white/60 text-xs">• • •</span>
            </div>

            <Link href={SLIDE.href} className="gp-btn gp-btn-primary gp-btn-lg mt-8">
              {SLIDE.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
