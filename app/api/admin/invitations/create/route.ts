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
import { requireOwner, createInvitation, createServerSupabaseClient } from '@/lib/auth-service'
import { sendInvitationEmail } from '@/lib/email-service'

const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  expiresInDays: z.number().int().min(1).max(30).default(7),
  role: z.enum(['CLIENT', 'SALES', 'DEV']).default('CLIENT'),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error
    const { user } = auth

    const supabase = createServerSupabaseClient()

    // Validate request body
    const body = await request.json()
    const validation = createInvitationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, expiresInDays, role } = validation.data

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
      expiresInDays,
      role
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
          role: invitation.role ?? 'CLIENT',
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

