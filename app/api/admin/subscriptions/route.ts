/**
 * Admin Subscriptions List API Route
 *
 * GET /api/admin/subscriptions
 *
 * Lists all subscriptions (no user filter). Only OWNER can access.
 * Query: status, limit, offset
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import type { Subscription } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only admins can view all subscriptions' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    let query = supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching admin subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    return NextResponse.json({
      subscriptions: (data as Subscription[]) || [],
      total: count ?? 0,
      limit,
      offset,
      hasMore: offset + (data?.length ?? 0) < (count ?? 0),
    })
  } catch (error) {
    console.error('Error in GET /api/admin/subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
