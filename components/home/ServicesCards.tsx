import Link from 'next/link'

const SERVICES = [
  {
    titre: 'CV Pro ATS',
    href: '/services/cv-pro',
    image: '/1.png',
    accent: false,
  },
  {
    titre: 'JobAssist',
    href: '/services/job-assist',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    accent: true,
  },
]

export default function ServicesCards() {
  return (
    <section>
      <div className="grid sm:grid-cols-2 lg:grid-cols-2">
        {SERVICES.map((s) => (
          <Link key={s.titre} href={s.href} className="group block">
            {/* Image */}
            <div
              className="h-64 w-full overflow-hidden"
              style={{
                backgroundImage: `url(${s.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="h-full w-full bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
            </div>
            {/* Titre */}
            <div className={`px-8 py-6 flex items-center justify-between ${s.accent ? 'bg-[#0F172A] text-white' : 'bg-white text-[#0F172A]'}`}>
              <span className={`font-heading text-xl font-bold ${s.accent ? 'text-primary' : ''}`}>
                {s.titre}
              </span>
              <span className={`text-primary font-bold text-xl`}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bandeau bleu foncé */}
      <div className="bg-[#0F172A] py-14">
        <div className="mx-auto w-full max-w-[1400px] px-8 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-white lg:text-4xl">
            Une Expertise Reconnue en Services Professionnels
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-0.5 w-10 bg-primary" />
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <div className="h-0.5 w-10 bg-primary" />
          </div>
          <p className="mt-4 text-white/60 text-lg">
            CVPro225 vous accompagne avec professionnalisme et efficacité.
          </p>
        </div>
      </div>
    </section>
  )
}
