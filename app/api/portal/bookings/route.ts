/**
 * Bookings API Route
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
    const tab = request.nextUrl.searchParams.get('tab') || 'upcoming'

    const now = new Date().toISOString()

    let query = supabase
      .from('bookings')
      .select('*')
      .eq('client_id', user.id)
      .eq('status', 'confirmed')

    if (tab === 'upcoming') {
      query = query.gte('starts_at', now).order('starts_at', { ascending: true })
    } else {
      query = query.lt('starts_at', now).order('starts_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

