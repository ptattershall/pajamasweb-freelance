/**
 * Resend Client Invitation API Route
 * 
 * POST /api/admin/invitations/[id]/resend
 * 
 * Generates a new token for an existing invitation and sends a new email.
 * Only OWNER users can resend invitations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, createServerSupabaseClient, generateInvitationToken } from '@/lib/auth-service'
import { sendInvitationEmail } from '@/lib/email-service'

const resendInvitationSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30).default(7),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validation = resendInvitationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { expiresInDays } = validation.data

    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Verify user is OWNER
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only admins can resend invitations' }, { status: 403 })
    }

    // Get the invitation
    const { data: invitation, error: getError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .single()

    if (getError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Generate new token
    const newToken = generateInvitationToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Update invitation with new token
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        token: newToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending', // Reset status to pending
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 })
    }

    // Get admin profile for email
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single()

    // Generate invitation URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${newToken}`

    // Send email
    try {
      await sendInvitationEmail(
        invitation.email,
        invitationUrl,
        adminProfile?.display_name || 'Admin'
      )
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        token: newToken,
        expiresAt: expiresAt.toISOString(),
        invitationUrl,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/admin/invitations/[id]/resend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

