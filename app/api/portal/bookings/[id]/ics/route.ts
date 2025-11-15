import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-service'

/**
 * Generate ICS file for a booking
 */
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

    // Fetch the booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('client_id', user.id)
      .single()

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
function generateICS(booking: any): string {
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

  let icsContent = [
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

