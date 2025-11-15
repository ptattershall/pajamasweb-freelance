/**
 * Admin Notifications API Route
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { createNotificationSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit (strict limit for admin operations)
    const { success, remaining, resetTime } = await checkRateLimit(user.id, rateLimiters.strict)
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

    // Validate input with Zod
    const validation = createNotificationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Verify user is OWNER
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only admins can create notifications' }, { status: 403 })
    }

    const { client_id, milestone_id, notification_type, message } = validation.data

    // Create notification
    const { data, error } = await supabase
      .from('milestone_notifications')
      .insert({
        client_id,
        milestone_id,
        notification_type,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

