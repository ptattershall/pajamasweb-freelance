/**
 * Revoke Client Invitation API Route
 * 
 * DELETE /api/admin/invitations/[id]
 * 
 * Marks an invitation as expired/revoked so it can no longer be used.
 * Only OWNER users can revoke invitations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const supabase = createServerSupabaseClient()

    // Get the invitation
    const { data: invitation, error: getError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .single()

    if (getError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation is already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Cannot revoke an accepted invitation' },
        { status: 400 }
      )
    }

    // Mark invitation as expired
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        status: 'expired',
        expires_at: new Date().toISOString(), // Set expiration to now
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error revoking invitation:', updateError)
      return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: 'expired',
      },
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/invitations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

