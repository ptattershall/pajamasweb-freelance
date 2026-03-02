/**
 * Admin Payment Revenue Metrics API Route
 *
 * GET /api/admin/payments/metrics
 *
 * Returns revenue metrics (total revenue, completed count). Optional date range.
 * Only OWNER can access.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const supabase = createServerSupabaseClient()

    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    let query = supabase
      .from('payments')
      .select('id, amount_cents')
      .in('status', ['completed', 'succeeded', 'paid'])

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data, error } = await query.limit(50000)

    if (error) {
      console.error('Error fetching payment metrics:', error)
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
    }

    const rows = (data as { id: string; amount_cents: number }[]) || []
    const totalRevenueCents = rows.reduce((sum, p) => sum + p.amount_cents, 0)

    return NextResponse.json({
      totalRevenueCents,
      completedCount: rows.length,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/payments/metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
