import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as Record<string, unknown>).role as string
        token.nom = (user as Record<string, unknown>).nom as string
        token.prenom = (user as Record<string, unknown>).prenom as string
        token.telephone = (user as Record<string, unknown>).telephone as string
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        const user = session.user as unknown as Record<string, unknown>
        user.id = token.id
        user.role = token.role
        user.nom = token.nom
        user.prenom = token.prenom
        user.telephone = token.telephone
      }
      return session
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          telephone: user.telephone,
        }
      },
    }),
  ],
})
