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
import { acceptInvitation } from '@/lib/auth-service'
import { createServerSupabaseClient } from '@/lib/auth-service'

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(1, 'Display name is required'),
  company: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
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

    // Create session for the new user
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.signInWithPassword({
      email: result.user.email!,
      password,
    })

    if (sessionError || !session) {
      throw new Error('Failed to create session')
    }

    // Create response with auth cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      },
      { status: 201 }
    )

    // Set auth token cookie
    response.cookies.set('auth-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invitation' },
      { status: 400 }
    )
  }
}

