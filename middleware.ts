import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isAdmin = req.nextUrl.pathname.startsWith('/admin')

  if ((isDashboard || isAdmin) && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdmin && (req.auth?.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
