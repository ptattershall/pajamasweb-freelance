/**
 * Milestones API Route
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

    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('client_id', user.id)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error fetching milestones:', error)
      return NextResponse.json(
        { error: 'Failed to fetch milestones' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}

