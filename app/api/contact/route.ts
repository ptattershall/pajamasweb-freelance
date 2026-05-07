/**
 * Public Contact API
 *
 * POST /api/contact
 *
 * Replaces the customer self-booking flow with a simple message intake. Anyone
 * can submit (signed in or not). Heavily rate-limited by IP. Stores the message
 * in `contact_messages` and emails the admin a notification with replyTo set
 * to the sender so hitting Reply lands directly in their thread.
 */

import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient, getAuthenticatedUser } from '@/lib/auth-service'
import { createContactMessageSchema } from '@/lib/validation-schemas'
import { sendAdminContactNotification } from '@/lib/email-service'
import {
  checkIpRateLimit,
  getClientIp,
  getRateLimitHeaders,
  rateLimiters,
} from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { success, remaining, resetTime } = await checkIpRateLimit(
      ip,
      rateLimiters.strict
    )
    if (!success) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again in a minute.' },
        { status: 429, headers: getRateLimitHeaders(remaining, resetTime) }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const validation = createContactMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, subject, body: messageBody } = validation.data
    const trimmedSubject = subject?.trim() || null

    // Optionally link to authenticated user, but never require it.
    const { user } = await getAuthenticatedUser(request)

    const userAgent = request.headers.get('user-agent') ?? null

    const supabase = createServerSupabaseClient()
    const { data: inserted, error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: trimmedSubject,
        body: messageBody.trim(),
        user_id: user?.id ?? null,
        source: 'web',
        user_agent: userAgent,
      })
      .select('id, created_at')
      .single()

    if (error || !inserted) {
      console.error('Error inserting contact message:', error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      )
    }

    // Notify admin (best-effort: don't fail the request if email is misconfigured).
    try {
      await sendAdminContactNotification({
        id: String(inserted.id),
        name: name.trim(),
        email: email.trim(),
        subject: trimmedSubject,
        body: messageBody.trim(),
        isAuthenticated: Boolean(user),
        receivedAt: new Date(String(inserted.created_at)),
      })
    } catch (notifyError) {
      console.error(
        'Contact message stored but admin notification failed:',
        notifyError
      )
    }

    return NextResponse.json(
      { success: true, id: inserted.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unhandled error in POST /api/contact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
