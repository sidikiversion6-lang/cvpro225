'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Props {
  user: { nom: string; prenom: string; email: string }
  unreadCount?: number
}

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
  { href: '/dashboard/commandes', label: 'Mes commandes', icon: '📦' },
  { href: '/dashboard/documents', label: 'Mes documents', icon: '📄' },
  { href: '/dashboard/messages', label: 'Messages', icon: '💬', badge: true },
  { href: '/dashboard/profil', label: 'Mon profil', icon: '⚙️' },
]

export default function Sidebar({ user, unreadCount = 0 }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100 p-5">
        <Link href="/" className="text-lg font-extrabold">
          <span className="text-dark">CVPro</span><span className="text-primary">225</span>
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-dark">{user.prenom} {user.nom}</p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-l-[3px] border-primary bg-primary/5 text-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rouge text-[0.625rem] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-3 space-y-1">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50">
          ← Retour au site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rouge hover:bg-rouge/5"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
