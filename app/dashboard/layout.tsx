import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import AuthProvider from '@/components/dashboard/AuthProvider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user as { id: string; email?: string | null; nom?: string; prenom?: string }
  const nom = (user as Record<string, unknown>).nom as string || ''
  const prenom = (user as Record<string, unknown>).prenom as string || ''
  const email = user.email || ''

  const unreadCount = await prisma.message.count({
    where: {
      commande: { userId: user.id },
      auteur: 'admin',
      lu: false,
    },
  })

  const userData = { nom, prenom, email }

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF9]">
        <div className="hidden lg:block">
          <Sidebar user={userData} unreadCount={unreadCount} />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader user={userData} unreadCount={unreadCount} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
