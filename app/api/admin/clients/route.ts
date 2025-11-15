/**
 * Admin Clients List API Route
 * 
 * GET /api/admin/clients
 * 
 * Lists all CLIENT role users with their invitation status and details.
 * Only OWNER users can list clients.
 * 
 * Query Parameters:
 * - status: 'pending' | 'active' | 'all' (default: 'all')
 * - search: string (search by email or display_name)
 * - limit: number (1-100, default: 20)
 * - offset: number (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'

const listClientsSchema = z.object({
  status: z.enum(['pending', 'active', 'all']).default('all'),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const searchParams = request.nextUrl.searchParams
    const validation = listClientsSchema.safeParse({
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { status, search, limit, offset } = validation.data

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
      return NextResponse.json({ error: 'Only admins can list clients' }, { status: 403 })
    }

    // Build query
    let query = supabase
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
      .eq('role', 'CLIENT')
      .order('created_at', { ascending: false })

    // Filter by status
    if (status === 'pending') {
      query = query.is('invitation_accepted_at', null)
    } else if (status === 'active') {
      query = query.not('invitation_accepted_at', 'is', null)
    }

    // Filter by search term
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,auth_users.email.ilike.%${search}%`)
    }

    // Get total count
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CLIENT')

    // Apply pagination
    const { data: clients, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Format response
    const formattedClients = clients.map((client: any) => ({
      id: client.user_id,
      name: client.display_name,
      email: client.auth_users?.email,
      company: client.company,
      status: client.invitation_accepted_at ? 'active' : 'pending',
      createdAt: client.created_at,
      acceptedAt: client.invitation_accepted_at,
      invitedBy: client.invited_by,
    }))

    return NextResponse.json({
      success: true,
      clients: formattedClients,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: offset + limit < (count || 0),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

