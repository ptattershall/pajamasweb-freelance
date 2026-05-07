import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getProfileForRequest } from '@/lib/auth-service'
import { generateIcs } from '@/lib/ics-utils'

/**
 * Generate ICS file for a booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await getProfileForRequest(request)

    if (authError || !user || !profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    let query = supabase.from('bookings').select('*').eq('id', id)
    if (profile.role === 'CLIENT') {
      query = query.eq('client_id', user.id)
    } else if (profile.role === 'SALES' || profile.role === 'DEV') {
      query = query.eq('assigned_user_id', user.id)
    }
    const { data: booking, error } = await query.single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Generate ICS content
    const icsContent = generateIcs({
      id: booking.id,
      title: booking.title,
      description: booking.description,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      location: booking.location,
      meetingLink: booking.meeting_link,
      status: booking.status,
    })

    // Return ICS file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="booking-${booking.id}.ics"`,
      },
    })
  } catch (error) {
    console.error('Error generating ICS:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


