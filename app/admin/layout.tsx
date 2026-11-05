import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user as Record<string, unknown>
  if (user.role !== 'admin') redirect('/dashboard')

  const [unreadMessages, unreadNotifs] = await Promise.all([
    prisma.message.count({ where: { auteur: 'client', lu: false } }),
    prisma.notification.count({ where: { lu: false } }),
  ])

  const userData = {
    nom: (user.nom as string) || '',
    prenom: (user.prenom as string) || '',
    email: (session.user.email as string) || '',
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar user={userData} unreadMessages={unreadMessages} unreadNotifs={unreadNotifs} />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
