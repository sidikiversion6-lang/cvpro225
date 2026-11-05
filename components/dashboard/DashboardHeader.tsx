'use client'

import { useState } from 'react'
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

export default function DashboardHeader({ user, unreadCount = 0 }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
        <Link href="/" className="text-lg font-extrabold">
          <span className="text-dark">Pro</span><span className="text-primary">224</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg" aria-label="Menu">
          <span className={`block h-[2px] w-5 rounded bg-dark transition-all ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
          <span className={`block h-[2px] w-5 rounded bg-dark transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-[2px] w-5 rounded bg-dark transition-all ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
        </button>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="border-b border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-dark">{user.prenom} {user.nom}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? 'bg-primary/5 text-primary' : 'text-gray-600'}`}>
                <span>{item.icon}</span><span className="flex-1">{item.label}</span>
                {item.badge && unreadCount > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rouge text-[0.625rem] font-bold text-white">{unreadCount}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-100 p-3 space-y-1">
          <Link href="/" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50">← Retour au site</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-rouge hover:bg-rouge/5">Se déconnecter</button>
        </div>
      </div>
    </>
  )
}
