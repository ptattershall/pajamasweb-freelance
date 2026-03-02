/**
 * Admin Single Client API Route
 * 
 * GET /api/admin/clients/[id]
 * 
 * Gets details for a specific client including their invitations and status.
 * Only OWNER users can view client details.
 */

import { NextRequest, NextResponse } from 'next/server'

type AuthUserRef = { email?: string }
type AuthUsersRelation = AuthUserRef | AuthUserRef[]

type InvitationRow = {
  id: string
  email: string
  status: string
  created_at: string | null
  expires_at: string | null
  accepted_at: string | null
  created_by: string | null
}
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const supabase = createServerSupabaseClient()

    // Get client profile
    const { data: client, error: clientError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        company,
        email_verified,
        created_at,
        invited_by,
        invitation_accepted_at,
        auth_users:user_id(email)
      `)
      .eq('user_id', id)
      .eq('role', 'CLIENT')
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get invitations for this client (auth_users is relation from user_id(email) – object or array)
    const authUsers = client.auth_users as AuthUsersRelation | null
    const clientEmail = Array.isArray(authUsers) ? authUsers[0]?.email : authUsers?.email
    const { data: invitations, error: invError } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        status,
        created_at,
        expires_at,
        accepted_at,
        created_by
      `)
      .eq('email', clientEmail)
      .order('created_at', { ascending: false })

    if (invError) {
      console.error('Error fetching invitations:', invError)
    }

    // Format response
    return NextResponse.json({
      success: true,
      client: {
        id: client.user_id,
        name: client.display_name,
        email: clientEmail,
        company: client.company,
        status: client.invitation_accepted_at ? 'active' : 'pending',
        createdAt: client.created_at,
        acceptedAt: client.invitation_accepted_at,
        invitedBy: client.invited_by,
      },
      invitations: invitations?.map((inv: InvitationRow) => ({
        id: inv.id,
        email: inv.email,
        status: inv.status,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
        acceptedAt: inv.accepted_at,
      })) || [],
    })
  } catch (error) {
    console.error('Error in GET /api/admin/clients/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

