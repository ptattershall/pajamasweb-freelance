/**
 * Create Client Invitation API Route
 * 
 * POST /api/admin/invitations/create
 * 
 * Creates a new invitation for a client and sends an email with the invitation link.
 * Only OWNER users can create invitations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth-service'
import { createInvitation } from '@/lib/auth-service'
import { createServerSupabaseClient } from '@/lib/auth-service'
import { sendInvitationEmail } from '@/lib/email-service'

const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  expiresInDays: z.number().int().min(1).max(30).default(7),
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is OWNER
    const supabase = createServerSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only admins can create invitations' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validation = createInvitationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, expiresInDays } = validation.data

    // Check if invitation already exists for this email
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this email' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Create invitation
    const { invitation, token, success } = await createInvitation(
      email,
      user.id,
      expiresInDays
    )

    if (!success) {
      throw new Error('Failed to create invitation')
    }

    // Send invitation email
    try {
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${token}`
      await sendInvitationEmail(email, invitationUrl, user.email || 'Admin')
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expires_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create invitation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

