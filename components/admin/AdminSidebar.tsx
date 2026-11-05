'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Props {
  user: { nom: string; prenom: string; email: string }
  unreadMessages?: number
  unreadNotifs?: number
}

const NAV_GROUPS = [
  {
    label: 'Vue générale',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: '📊' },
      { href: '/admin/notifications', label: 'Notifications', icon: '🔔', badgeKey: 'notifs' as const },
    ],
  },
  {
    label: 'Commandes',
    items: [
      { href: '/admin/commandes', label: 'Toutes les commandes', icon: '📦' },
    ],
  },
  {
    label: 'Clients',
    items: [
      { href: '/admin/clients', label: 'Tous les clients', icon: '👥' },
      { href: '/admin/messages', label: 'Messages', icon: '💬', badgeKey: 'messages' as const },
    ],
  },
  {
    label: 'Services & Tarifs',
    items: [
      { href: '/admin/services/prix', label: 'Prix des packs', icon: '💰' },
      { href: '/admin/config', label: 'Configuration site', icon: '⚙️' },
    ],
  },
]

export default function AdminSidebar({ user, unreadMessages = 0, unreadNotifs = 0 }: Props) {
  const pathname = usePathname()

  const badges: Record<string, number> = { messages: unreadMessages, notifs: unreadNotifs }

  return (
    <aside className="flex h-full w-72 flex-col bg-dark">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-lg font-extrabold">
            <span className="text-white">Pro</span><span className="text-primary">224</span>
          </Link>
          <span className="rounded bg-rouge px-1.5 py-0.5 text-[0.6rem] font-bold text-white">Admin</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user.prenom} {user.nom}</p>
            <p className="truncate text-xs text-white/40">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-2 px-3 text-[0.625rem] font-bold uppercase tracking-widest text-white/30">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
              const badge = item.badgeKey ? badges[item.badgeKey] : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? 'border-l-[3px] border-primary bg-white/10 font-medium text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rouge text-[0.6rem] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-white/40 hover:text-white/60">← Voir le site</Link>
        <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-white/40 hover:text-white/60">Dashboard client</Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full rounded-lg px-3 py-2 text-left text-sm text-rouge hover:bg-rouge/10">
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
