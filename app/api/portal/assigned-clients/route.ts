/**
 * Portal: list clients assigned to the current user (SALES or DEV).
 * Returns minimal client info for contractor dashboard.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireRole, createServerSupabaseClient } from '@/lib/auth-service'
import { getActiveAssignmentsForUser } from '@/lib/assignment-service'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['SALES', 'DEV'])
    if (!auth.ok) return auth.error
    const { user, profile } = auth

    const roleType = profile.role === 'SALES' ? 'SALES' : 'DEV'
    const assignments = await getActiveAssignmentsForUser(user.id, roleType)
    if (assignments.length === 0) {
      return NextResponse.json({ clients: [] })
    }

    const supabase = createServerSupabaseClient()
    const clientIds = [...new Set(assignments.map((a) => a.client_id))]
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, company, created_at')
      .in('user_id', clientIds)

    if (error) {
      console.error('Assigned clients fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    const byId = new Map((profiles ?? []).map((p) => [p.user_id, p]))
    const clients = assignments.map((a) => ({
      assignmentId: a.id,
      clientId: a.client_id,
      startedAt: a.started_at,
      ...byId.get(a.client_id),
    }))

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Assigned clients error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list assigned clients' },
      { status: 500 }
    )
  }
}
