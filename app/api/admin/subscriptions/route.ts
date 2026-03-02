/**
 * Admin Subscriptions List API Route
 *
 * GET /api/admin/subscriptions
 *
 * Lists all subscriptions (no user filter). Only OWNER can access.
 * Query: status, limit, offset
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import type { Subscription } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const supabase = createServerSupabaseClient()

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
