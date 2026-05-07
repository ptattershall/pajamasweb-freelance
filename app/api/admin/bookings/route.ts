/**
 * Admin Bookings (Meetings) API
 *
 * GET  /api/admin/bookings — list every booking with optional ?tab=upcoming|past|all
 * POST /api/admin/bookings — admin schedules a meeting and (optionally) emails the attendee
 *
 * Phase 2 of the Cal.com retirement: customers no longer self-book; only OWNER
 * users can create bookings, and we send a meeting invite (.ics attachment)
 * via Resend so the recipient can add it to their own calendar.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  requireOwner,
  createServerSupabaseClient,
} from '@/lib/auth-service'
import { adminCreateBookingSchema } from '@/lib/validation-schemas'
import { sendAdminScheduledMeeting } from '@/lib/email-service'
import {
  checkRateLimit,
  rateLimiters,
  getRateLimitHeaders,
} from '@/lib/rate-limit'

const listBookingsQuerySchema = z.object({
  tab: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
  status: z
    .enum(['confirmed', 'cancelled', 'rescheduled', 'all'])
    .default('all'),
  limit: z.coerce.number().int().min(1).max(200).default(100),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const parsed = listBookingsQuerySchema.safeParse({
      tab: request.nextUrl.searchParams.get('tab'),
      status: request.nextUrl.searchParams.get('status'),
      limit: request.nextUrl.searchParams.get('limit'),
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { tab, status, limit } = parsed.data
    const supabase = createServerSupabaseClient()
    const now = new Date().toISOString()

    let query = supabase.from('bookings').select('*')

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (tab === 'upcoming') {
      query = query.gte('starts_at', now).order('starts_at', { ascending: true })
    } else if (tab === 'past') {
      query = query.lt('starts_at', now).order('starts_at', { ascending: false })
    } else {
      query = query.order('starts_at', { ascending: false })
    }

    const { data, error } = await query.limit(limit)

    if (error) {
      console.error('Error fetching admin bookings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('Unhandled error in GET /api/admin/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error
    const { user, profile } = auth

    const { success, remaining, resetTime } = await checkRateLimit(
      user.id,
      rateLimiters.strict
    )
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(remaining, resetTime),
        }
      )
    }

    const body = await request.json()
    const validation = adminCreateBookingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const {
      client_id,
      title,
      description,
      starts_at,
      ends_at,
      attendee_email,
      attendee_name,
      location,
      meeting_link,
      agenda,
      notes,
      notify_attendee,
    } = validation.data

    const supabase = createServerSupabaseClient()

    const insertPayload = {
      client_id: client_id ?? null,
      title,
      description: description ?? null,
      starts_at,
      ends_at,
      attendee_email,
      attendee_name: attendee_name ?? null,
      location: location ?? null,
      meeting_link: meeting_link && meeting_link !== '' ? meeting_link : null,
      agenda: agenda ?? null,
      notes: notes ?? null,
      provider: 'manual',
      status: 'confirmed',
      created_by: user.id,
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select()
      .single()

    if (error || !booking) {
      console.error('Error inserting admin booking:', error)
      return NextResponse.json(
        { error: 'Failed to create meeting' },
        { status: 500 }
      )
    }

    let emailSent = false
    let emailError: string | null = null
    if (notify_attendee) {
      try {
        await sendAdminScheduledMeeting({
          id: String(booking.id),
          title,
          startsAt: new Date(starts_at),
          endsAt: new Date(ends_at),
          attendeeEmail: attendee_email,
          attendeeName: attendee_name,
          organizerName: profile.display_name || 'PajamasWeb',
          organizerEmail: user.email || null,
          description: description ?? null,
          agenda: agenda ?? null,
          location: location ?? null,
          meetingLink: meeting_link && meeting_link !== '' ? meeting_link : null,
        })
        emailSent = true
      } catch (err) {
        emailError =
          err instanceof Error ? err.message : 'Unknown email error'
        console.error('Failed to send meeting email:', err)
      }
    }

    return NextResponse.json(
      { booking, emailSent, emailError },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unhandled error in POST /api/admin/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
