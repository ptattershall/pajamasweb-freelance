/**
 * Dashboard API Route
 *
 * Returns dashboard statistics for the client portal
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Fetch actual statistics from database
    const now = new Date().toISOString()

    // Count invoices due (open status)
    const { count: invoicesDue } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('status', 'open')

    // Count upcoming meetings
    const { count: upcomingMeetings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .gte('starts_at', now)
      .eq('status', 'confirmed')

    // Count pending deliverables (no delivered_at date)
    const { count: pendingDeliverables } = await supabase
      .from('deliverables')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .is('delivered_at', null)

    // Count active milestones (not completed)
    const { count: activeMilestones } = await supabase
      .from('project_milestones')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .neq('status', 'completed')

    const stats = {
      invoices_due: invoicesDue || 0,
      upcoming_meetings: upcomingMeetings || 0,
      pending_deliverables: pendingDeliverables || 0,
      active_milestones: activeMilestones || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

