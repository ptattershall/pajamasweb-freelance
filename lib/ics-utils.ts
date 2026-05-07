/**
 * ICS (iCalendar) utilities
 *
 * Generates RFC-5545 compliant calendar event payloads for download links
 * and email attachments. Kept dependency-free so it works in any runtime.
 */

export interface IcsBookingData {
  id: string
  title: string
  description?: string | null
  startsAt: Date | string
  endsAt: Date | string
  location?: string | null
  meetingLink?: string | null
  status?: string | null
  organizerEmail?: string | null
  organizerName?: string | null
  attendeeEmail?: string | null
  attendeeName?: string | null
}

const formatIcsDate = (date: Date | string): string =>
  new Date(date)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

const escapeIcsText = (text: string): string =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

export const generateIcs = (booking: IcsBookingData): string => {
  const now = formatIcsDate(new Date())
  const start = formatIcsDate(booking.startsAt)
  const end = formatIcsDate(booking.endsAt)

  const lines: string[] = [
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
    `SUMMARY:${escapeIcsText(booking.title)}`,
  ]

  if (booking.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(booking.description)}`)
  }

  if (booking.location) {
    lines.push(`LOCATION:${escapeIcsText(booking.location)}`)
  }

  if (booking.meetingLink) {
    lines.push(`URL:${booking.meetingLink}`)
  }

  if (booking.organizerEmail) {
    const orgName = booking.organizerName ? escapeIcsText(booking.organizerName) : ''
    lines.push(
      `ORGANIZER${orgName ? `;CN=${orgName}` : ''}:mailto:${booking.organizerEmail}`
    )
  }

  if (booking.attendeeEmail) {
    const attName = booking.attendeeName ? escapeIcsText(booking.attendeeName) : ''
    lines.push(
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE${
        attName ? `;CN=${attName}` : ''
      }:mailto:${booking.attendeeEmail}`
    )
  }

  lines.push(
    `STATUS:${booking.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  )

  return lines.join('\r\n')
}

/**
 * Buffer form for use with Resend's `attachments[].content` parameter.
 */
export const generateIcsBuffer = (booking: IcsBookingData): Buffer =>
  Buffer.from(generateIcs(booking), 'utf-8')
