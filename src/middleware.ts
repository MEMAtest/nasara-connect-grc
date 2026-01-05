import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Auth temporarily disabled - set to false to re-enable login
const AUTH_DISABLED = true

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (AUTH_DISABLED) {
    if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/error')) {
      const response = NextResponse.redirect(new URL('/authorization-pack', req.url))
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
      return response
    }
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth

  // Define protected routes
  const isProtectedRoute =
    pathname.startsWith('/authorization-pack') ||
    pathname.startsWith('/risk-assessment') ||
    pathname.startsWith('/smcr') ||
    pathname.startsWith('/policies') ||
    pathname.startsWith('/compliance-framework') ||
    pathname.startsWith('/training-library') ||
    pathname.startsWith('/regulatory-news') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/ai-chat') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/admin')

  // Redirect to login if trying to access protected route while not logged in
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if trying to access login while already logged in
  if (pathname === '/auth/login' && isLoggedIn) {
    const response = NextResponse.redirect(new URL('/authorization-pack', req.url))
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  if (pathname.startsWith('/auth')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, apple-icon.png (favicon files)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
