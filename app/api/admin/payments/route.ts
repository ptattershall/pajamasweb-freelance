/**
 * Admin Payments List API Route
 *
 * GET /api/admin/payments
 *
 * Lists all payments (no client filter). Only OWNER can access.
 * Query: status, type, dateFrom, dateTo, limit, offset
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import type { Payment } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const supabase = createServerSupabaseClient()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const typeParam = searchParams.get('type')
    const type: 'deposit' | 'retainer' | 'invoice' | undefined =
      typeParam === 'deposit' || typeParam === 'retainer' || typeParam === 'invoice' ? typeParam : undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching admin payments:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json({
      payments: (data as Payment[]) || [],
      total: count ?? 0,
      limit,
      offset,
      hasMore: offset + (data?.length ?? 0) < (count ?? 0),
    })
  } catch (error) {
    console.error('Error in GET /api/admin/payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
