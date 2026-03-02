import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getProfileForRequest } from '@/lib/auth-service'

type BookingForICS = {
  id: string
  starts_at: string
  ends_at: string
  title: string
  description?: string | null
  location?: string | null
  meeting_link?: string | null
  status: string
}

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
    const icsContent = generateICS(booking)

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

/**
 * Generate ICS file content
 */
function generateICS(booking: BookingForICS): string {
  const formatICSDate = (date: string) => {
    return new Date(date)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  }

  const escapeICSText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const now = formatICSDate(new Date().toISOString())
  const start = formatICSDate(booking.starts_at)
  const end = formatICSDate(booking.ends_at)

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PajamasWeb//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@pajamasweb.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICSText(booking.title)}`,
  ]

  if (booking.description) {
    icsContent.push(`DESCRIPTION:${escapeICSText(booking.description)}`)
  }

  if (booking.location) {
    icsContent.push(`LOCATION:${escapeICSText(booking.location)}`)
  }

  if (booking.meeting_link) {
    icsContent.push(`URL:${booking.meeting_link}`)
  }

  icsContent.push(
    `STATUS:${booking.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  )

  return icsContent.join('\r\n')
}

