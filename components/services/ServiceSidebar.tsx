import Link from 'next/link'

const SERVICES = [
  { slug: 'cv-pro', titre: 'CV Pro ATS', href: '/services/cv-pro' },
  { slug: 'job-assist', titre: 'JobAssist', href: '/services/job-assist' },
]

export default function ServiceSidebar({ active, accentColor }: { active: string; accentColor: string }) {
  return (
    <ul className="flex flex-col">
      {SERVICES.map((s) => {
        const isActive = s.slug === active
        return (
          <li key={s.slug}>
            <Link
              href={s.href}
              className={`flex items-center justify-between px-6 py-5 transition-all duration-300 ${
                isActive
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-gray-100 text-[#0F172A] hover:bg-gray-200'
              }`}
            >
              <span className="font-heading text-base font-semibold">{s.titre}</span>
              <span
                className="text-xl font-bold transition-all"
                style={{ color: isActive ? accentColor : '#9ca3af' }}
              >
                →
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
