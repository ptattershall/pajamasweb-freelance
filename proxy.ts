import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken, hashCsrfToken } from '@/lib/csrf-protection'
import { updateSession } from '@/utils/supabase/middleware'

// Routes that require authentication
const adminRoutes = ['/admin']
const portalRoutes = ['/portal']
const publicPortalRoutes = ['/portal/signin', '/portal/signup', '/portal/forgot-password', '/portal/reset-password', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password']

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the route is a portal route
  const isPortalRoute = portalRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the route is a public portal route
  const isPublicPortalRoute = publicPortalRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Handle admin routes
  if (isAdminRoute) {
    if (pathname === '/admin/login') {
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

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Handle portal routes
  if (isPortalRoute && !isPublicPortalRoute) {
    if (!user) {
      const signinUrl = new URL('/portal/signin', request.url)
      signinUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signinUrl)
    }
  }

  // Generate CSRF token for all allowed responses.
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

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
}

