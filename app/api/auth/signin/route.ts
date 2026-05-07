/**
 * Sign In API Route
 */

import { signInSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const validation = signInSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

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

    // Sign in user
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

    const finalResponse = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      { status: 200 }
    )

    response.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie)
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

