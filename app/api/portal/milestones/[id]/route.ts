/**
 * Single Milestone API Route
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Fetch milestone
    const { data: milestone, error: milestoneError } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('id', id)
      .eq('client_id', user.id)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Fetch milestone updates
    const { data: updates, error: updatesError } = await supabase
      .from('milestone_updates')
      .select('*')
      .eq('milestone_id', id)
      .order('created_at', { ascending: false })

    if (updatesError) {
      console.error('Error fetching milestone updates:', updatesError)
      return NextResponse.json(
        { error: 'Failed to fetch milestone updates' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...milestone,
      updates: updates || [],
    })
  } catch (error) {
    console.error('Error fetching milestone:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestone' },
      { status: 500 }
    )
  }
}

