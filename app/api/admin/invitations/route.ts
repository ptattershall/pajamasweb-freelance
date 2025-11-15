/**
 * List Client Invitations API Route
 * 
 * GET /api/admin/invitations
 * 
 * Lists all invitations with optional filtering by status.
 * Only OWNER users can list invitations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth-service'
import { createServerSupabaseClient } from '@/lib/auth-service'

const listInvitationsSchema = z.object({
  status: z.enum(['pending', 'accepted', 'expired']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(request: NextRequest) {
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
        { error: 'Only admins can list invitations' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const validation = listInvitationsSchema.safeParse({
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { status, limit, offset } = validation.data

    // Build query
    let query = supabase
      .from('invitations')
      .select('*, profiles:created_by(display_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(
      {
        success: true,
        invitations: data || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('List invitations error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list invitations' },
      { status: 500 }
    )
  }
}

