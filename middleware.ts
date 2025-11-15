import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { generateCsrfToken, hashCsrfToken } from '@/lib/csrf-protection'

// Routes that require authentication
const adminRoutes = ['/admin']
const portalRoutes = ['/portal']
const publicPortalRoutes = ['/portal/signin', '/portal/signup', '/portal/forgot-password', '/portal/reset-password', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password']

const secret = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || 'your-secret-key-here'
)

export async function middleware(request: NextRequest) {
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

  // Handle admin routes (existing logic)
  if (isAdminRoute) {
    // Allow login page without authentication
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for auth token in cookies
    const authToken = request.cookies.get('auth-token')?.value

    // If no auth token, redirect to login
    if (!authToken) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Validate token with JWT
    try {
      await jwtVerify(authToken, secret)
    } catch (err) {
      // Token is invalid or expired, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Handle portal routes (new Supabase session-based authentication)
  if (isPortalRoute && !isPublicPortalRoute) {
    // Get Supabase session from cookies
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      // No session, redirect to signin
      const signinUrl = new URL('/auth/signin', request.url)
      signinUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signinUrl)
    }

    // Validate the session token
    try {
      // Create Supabase client to verify the session
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Verify the JWT token
      const { data: { user }, error } = await supabase.auth.getUser(authToken)

      if (error || !user) {
        // Invalid session, redirect to signin
        const signinUrl = new URL('/portal/signin', request.url)
        signinUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(signinUrl)
      }

      // Session is valid, generate CSRF token
      const response = NextResponse.next()

      // Generate and set CSRF token
      const csrfToken = generateCsrfToken()
      const csrfHash = await hashCsrfToken(csrfToken)

      response.cookies.set('csrf-token', csrfHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      response.headers.set('X-CSRF-Token', csrfToken)

      return response
    } catch (err) {
      // Error validating session, redirect to signin
      const signinUrl = new URL('/portal/signin', request.url)
      signinUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signinUrl)
    }
  }

  const response = NextResponse.next()

  // Generate CSRF token for all responses
  const csrfToken = generateCsrfToken()
  const csrfHash = await hashCsrfToken(csrfToken)

  response.cookies.set('csrf-token', csrfHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  response.headers.set('X-CSRF-Token', csrfToken)

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
}

