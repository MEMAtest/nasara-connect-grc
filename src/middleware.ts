import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Auth controlled via environment variable AUTH_DISABLED
// Set AUTH_DISABLED=true in .env for development, remove for production
const isAuthDisabled = () => process.env.AUTH_DISABLED === "true" || process.env.AUTH_DISABLED === "1";

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (process.env.NODE_ENV === "production" && isAuthDisabled()) {
    return NextResponse.json({ error: "AUTH_DISABLED is not allowed in production." }, { status: 500 })
  }

  const isApiRoute = pathname.startsWith('/api')
  const isAuthApi = pathname.startsWith('/api/auth')
  const isProbeRoute = pathname === '/api/health' || pathname === '/api/readiness'

  if (isAuthDisabled()) {
    if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/error')) {
      const response = NextResponse.redirect(new URL('/authorization-pack', req.url))
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
      return response
    }
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth

  if (isApiRoute && !isAuthApi && !isProbeRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Define protected routes
  const isProtectedRoute =
    pathname.startsWith('/authorization-pack') ||
    pathname.startsWith('/risk-assessment') ||
    pathname.startsWith('/smcr') ||
    pathname.startsWith('/policies') ||
    pathname.startsWith('/compliance-framework') ||
    pathname.startsWith('/reporting') ||
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

  // CSRF protection: reject state-changing requests with mismatched Origin
  if (isApiRoute && !isAuthApi && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (origin && host) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json({ error: 'CSRF origin mismatch' }, { status: 403 })
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, apple-icon.png (favicon files)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
