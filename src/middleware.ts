import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

// Use the Edge-compatible auth config (no database imports)
const { auth } = NextAuth(authConfig)

// Auth controlled via environment variable AUTH_DISABLED
// Set AUTH_DISABLED=true in .env for development, remove for production
const isAuthDisabled = () => process.env.AUTH_DISABLED === "true" || process.env.AUTH_DISABLED === "1";

// ---------------------------------------------------------------------------
// Global rate limiting (in-memory sliding window, per Edge instance)
// Provides baseline protection; per-route Upstash limiters apply stricter caps.
// ---------------------------------------------------------------------------
const GLOBAL_WINDOW_MS = 60_000 // 1 minute
const GLOBAL_MAX_REQUESTS = 200 // 200 requests per IP per minute

const ipRequestLog = new Map<string, number[]>()

// Prevent unbounded memory growth — prune every 5 minutes
let lastPrune = Date.now()
function pruneStaleEntries() {
  const now = Date.now()
  if (now - lastPrune < 300_000) return
  lastPrune = now
  const cutoff = now - GLOBAL_WINDOW_MS
  for (const [ip, timestamps] of ipRequestLog) {
    const valid = timestamps.filter(t => t > cutoff)
    if (valid.length === 0) ipRequestLog.delete(ip)
    else ipRequestLog.set(ip, valid)
  }
}

function isGlobalRateLimited(ip: string): boolean {
  pruneStaleEntries()
  const now = Date.now()
  const cutoff = now - GLOBAL_WINDOW_MS
  const timestamps = ipRequestLog.get(ip) ?? []
  const recent = timestamps.filter(t => t > cutoff)
  recent.push(now)
  ipRequestLog.set(ip, recent)
  return recent.length > GLOBAL_MAX_REQUESTS
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (process.env.NODE_ENV === "production" && isAuthDisabled()) {
    return NextResponse.json({ error: "AUTH_DISABLED is not allowed in production." }, { status: 500 })
  }

  const isApiRoute = pathname.startsWith('/api')
  const isAuthApi = pathname.startsWith('/api/auth')
  const isProbeRoute = pathname === '/api/health' || pathname === '/api/readiness'

  // Global rate limiting for all API routes (except probes and auth)
  if (isApiRoute && !isAuthApi && !isProbeRoute) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'anonymous'
    if (isGlobalRateLimited(ip)) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' } },
        { status: 429 }
      )
    }
  }

  if (isAuthDisabled()) {
    if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/error')) {
      const response = NextResponse.redirect(new URL('/dashboard', req.url))
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
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/grc-hub') ||
    pathname.startsWith('/authorization-pack') ||
    pathname.startsWith('/risk-assessment') ||
    pathname.startsWith('/smcr') ||
    pathname.startsWith('/policies') ||
    pathname.startsWith('/compliance-framework') ||
    pathname.startsWith('/reporting') ||
    pathname.startsWith('/registers') ||
    pathname.startsWith('/training-library') ||
    pathname.startsWith('/regulatory-news') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/ai-chat') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/logout') ||
    pathname.startsWith('/invites')

  // Redirect to login if trying to access protected route while not logged in
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if trying to access login while already logged in
  if (pathname === '/auth/login' && isLoggedIn) {
    const response = NextResponse.redirect(new URL('/dashboard', req.url))
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
