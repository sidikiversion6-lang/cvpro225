import Link from 'next/link'

export default function SplitCTA() {
  return (
    <section className="grid lg:grid-cols-2">
      {/* Image gauche */}
      <div
        className="h-72 lg:h-auto"
        style={{
          backgroundImage: 'url(/tenders.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Contenu droite */}
      <div className="bg-primary px-12 py-16 flex flex-col justify-center relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/5" />

        <p className="text-white/80 text-sm uppercase tracking-widest mb-4">
          Obtenez une évaluation gratuite !
        </p>
        <h2 className="font-heading text-3xl font-extrabold text-white leading-tight lg:text-4xl relative z-10">
          Un accompagnement professionnel garanti satisfait ou refait.
        </h2>
        <Link
          href="/commander"
          className="mt-8 inline-flex items-center gap-3 border-2 border-white px-8 py-4 text-white font-semibold hover:bg-white hover:text-primary transition-all duration-300 w-fit relative z-10"
        >
          <span>→</span> Commander maintenant
        </Link>
      </div>
    </section>
  )
}
