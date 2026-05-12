/**
 * Accept Invitation API Route
 * 
 * POST /api/auth/accept-invitation
 * 
 * Accepts an invitation and creates a new user account.
 * This is a public endpoint (no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { routeAfterSignIn } from '@/lib/auth-routing'
import { acceptInvitation } from '@/lib/auth-service'
import type { ProfileRole } from '@/lib/validation-schemas'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(1, 'Display name is required'),
  company: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment configuration' },
        { status: 500 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = acceptInvitationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { token, password, display_name, company } = validation.data

    // Accept invitation and create user
    const result = await acceptInvitation(token, password, display_name, company)

    if (!result.success) {
      throw new Error('Failed to accept invitation')
    }

    // Sign the new user in with the same SSR cookie strategy as the shared
    // signin flow so the browser lands with a valid Supabase session.
    let response = NextResponse.json({ success: true }, { status: 201 })
    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.json({ success: true }, { status: 201 })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const {
      data: { session, user },
      error: sessionError,
    } = await supabase.auth.signInWithPassword({
      email: result.user.email!,
      password,
    })

    if (sessionError || !session || !user) {
      throw new Error('Failed to create session')
    }

    let role: ProfileRole | null = null
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single<{ role: ProfileRole }>()

    if (!profileError && profile) {
      role = profile.role
    }

    const redirectTo = routeAfterSignIn(role, null)

    const finalResponse = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
        role,
        redirectTo,
      },
      { status: 201 }
    )

    response.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie
      finalResponse.cookies.set(name, value, options)
    })

    return finalResponse
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invitation' },
      { status: 400 }
    )
  }
}

