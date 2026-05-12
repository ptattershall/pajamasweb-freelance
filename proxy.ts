import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken, hashCsrfToken } from '@/lib/csrf-protection'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { buildProtectedRedirectTarget, defaultRouteForRole } from '@/lib/auth-routing'
import type { ProfileRole } from '@/lib/validation-schemas'

const adminPrefix = '/admin'
const portalPrefix = '/portal'
const clientPrefix = '/client'

const publicAuthRoutes = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/accept-invitation',
  '/auth/callback',
  '/portal/signin',
  '/portal/signup',
  '/portal/forgot-password',
  '/portal/reset-password',
  '/client/signin',
]

const isPublicAuthRoute = (pathname: string): boolean =>
  publicAuthRoutes.some((route) => pathname.startsWith(route))

const isAdminRoute = (pathname: string): boolean =>
  pathname.startsWith(adminPrefix) && pathname !== '/admin/login'

const isPortalRoute = (pathname: string): boolean =>
  pathname.startsWith(portalPrefix) && !isPublicAuthRoute(pathname)

const isClientRoute = (pathname: string): boolean =>
  pathname.startsWith(clientPrefix) && !isPublicAuthRoute(pathname)

const fetchRole = async (request: NextRequest): Promise<ProfileRole | null> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll() {
        // Read-only role lookup; cookies already refreshed by updateSession.
      },
    },
  })

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userData.user.id)
    .single<{ role: ProfileRole }>()

  return profile?.role ?? null
}

const setCsrf = async (response: NextResponse): Promise<NextResponse> => {
  const csrfToken = generateCsrfToken()
  const csrfHash = await hashCsrfToken(csrfToken)

  response.cookies.set('csrf-token', csrfHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  response.headers.set('X-CSRF-Token', csrfToken)
  return response
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  if (pathname === '/admin/login') {
    return setCsrf(response)
  }

  const needsAuth =
    isAdminRoute(pathname) || isPortalRoute(pathname) || isClientRoute(pathname)

  if (!needsAuth) {
    return setCsrf(response)
  }

  if (!user) {
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set(
      'redirect',
      buildProtectedRedirectTarget(pathname, request.nextUrl.search)
    )
    return NextResponse.redirect(signinUrl)
  }

  const role = await fetchRole(request)

  // Role-based gating
  if (isAdminRoute(pathname) && role !== 'OWNER') {
    return NextResponse.redirect(
      new URL(defaultRouteForRole(role), request.url)
    )
  }

  if (isPortalRoute(pathname)) {
    if (role !== 'OWNER' && role !== 'SALES' && role !== 'DEV') {
      return NextResponse.redirect(
        new URL(defaultRouteForRole(role), request.url)
      )
    }
  }

  if (isClientRoute(pathname) && role !== 'CLIENT') {
    return NextResponse.redirect(
      new URL(defaultRouteForRole(role), request.url)
    )
  }

  return setCsrf(response)
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*', '/client/:path*'],
}
