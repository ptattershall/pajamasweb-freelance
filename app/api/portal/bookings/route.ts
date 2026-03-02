/**
 * Bookings API Route
 * CLIENT: own bookings (client_id). SALES/DEV: bookings assigned to them (assigned_user_id).
 */

import { getProfileForRequest, createServerSupabaseClient } from '@/lib/auth-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getProfileForRequest(request)

    if (authError || !user || !profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const tab = request.nextUrl.searchParams.get('tab') || 'upcoming'
    const now = new Date().toISOString()

    let query = supabase.from('bookings').select('*').eq('status', 'confirmed')

    if (profile.role === 'CLIENT') {
      query = query.eq('client_id', user.id)
    } else if (profile.role === 'SALES' || profile.role === 'DEV') {
      query = query.eq('assigned_user_id', user.id)
    } else if (profile.role === 'OWNER') {
      // Owner in portal can see all; no extra filter
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

