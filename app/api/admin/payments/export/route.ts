/**
 * Admin Payment History Export API Route
 *
 * GET /api/admin/payments/export
 *
 * Returns payment history as CSV. Optional query: status, type, dateFrom, dateTo.
 * Only OWNER can access.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import type { Payment } from '@/lib/supabase'

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

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
      return NextResponse.json({ error: 'Only admins can export payments' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (type === 'deposit' || type === 'retainer' || type === 'invoice') {
      query = query.eq('type', type)
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data, error } = await query.limit(10000)

    if (error) {
      console.error('Error fetching payments for export:', error)
      return NextResponse.json({ error: 'Failed to export payments' }, { status: 500 })
    }

    const payments = (data as Payment[]) || []
    const headers = [
      'id',
      'client_id',
      'intent_id',
      'type',
      'amount_cents',
      'currency',
      'status',
      'related_service',
      'service_name',
      'customer_email',
      'created_at',
    ]
    const rows = payments.map((p) => [
      escapeCsv(p.id),
      escapeCsv(p.client_id),
      escapeCsv(p.intent_id),
      escapeCsv(p.type),
      escapeCsv(p.amount_cents),
      escapeCsv(p.currency),
      escapeCsv(p.status),
      escapeCsv(p.related_service),
      escapeCsv((p.metadata as { service_name?: string } | null)?.service_name),
      escapeCsv((p.metadata as { customer_email?: string } | null)?.customer_email),
      escapeCsv(p.created_at),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const filename = `payments-export-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/payments/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
