/**
 * Sign In API Route
 *
 * Uses the Supabase SSR pattern: a single `response` object owned by the
 * `setAll` cookies callback is mutated as auth cookies are set. After a
 * successful sign-in, the final JSON body is built and the auth cookies
 * are copied from `response` onto it explicitly (name, value, options) so
 * the browser persists them and subsequent requests are recognized as
 * authenticated by the proxy middleware.
 *
 * Returns `{ success, user: { id, email }, role, redirectTo }` so the client
 * can navigate directly to the resolved post-sign-in destination.
 */

import { isSafeRedirect, routeAfterSignIn } from '@/lib/auth-routing'
import { getUserRole } from '@/lib/user-role'
import { signInSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'

const signInRequestSchema = signInSchema.extend({
  redirect: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = signInRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, redirect } = validation.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabasePublishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment configuration' },
        { status: 500 }
      )
    }

    let response = NextResponse.json({ success: true }, { status: 200 })

    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.json({ success: true }, { status: 200 })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Sign in failed' },
        { status: 401 }
      )
    }

    const role = await getUserRole(data.user.id)
    const redirectTarget = redirect ?? null
    const baseRedirectTo = routeAfterSignIn(role, redirectTarget)
    const redirectTo =
      baseRedirectTo === '/auth/redirect' && isSafeRedirect(redirectTarget)
        ? `/auth/redirect?${new URLSearchParams({ redirect: redirectTarget }).toString()}`
        : baseRedirectTo

    const finalResponse = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        role,
        redirectTo,
      },
      { status: 200 }
    )

    response.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie
      finalResponse.cookies.set(name, value, options)
    })

    return finalResponse
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign in failed' },
      { status: 500 }
    )
  }
}
