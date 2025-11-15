/**
 * Deliverables API Route
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
      .from('deliverables')
      .select('*')
      .eq('client_id', user.id)
      .order('delivered_at', { ascending: false })

    if (error) {
      console.error('Error fetching deliverables:', error)
      return NextResponse.json(
        { error: 'Failed to fetch deliverables' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching deliverables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deliverables' },
      { status: 500 }
    )
  }
}

