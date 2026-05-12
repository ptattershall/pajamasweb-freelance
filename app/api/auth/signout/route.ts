/**
 * Sign Out API Route
 *
 * Handles user sign out and clears the Supabase SSR session cookies.
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const shouldClearAuthCookie = (name: string): boolean => {
  return (
    name === 'auth-token' ||
    /^sb-.*-auth-token(?:-\d+)?$/.test(name) ||
    /^sb-.*-auth-token-code-verifier$/.test(name)
  )
}

export async function POST(request: NextRequest) {
  try {
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

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }

    request.cookies.getAll().forEach(({ name }) => {
      if (shouldClearAuthCookie(name)) {
        response.cookies.set(name, '', {
          maxAge: 0,
          path: '/',
        })
      }
    })

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign out failed' },
      { status: 500 }
    )
  }
}

