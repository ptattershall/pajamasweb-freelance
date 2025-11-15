/**
 * Admin Milestone Updates API Route
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { milestoneUpdateSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    const validation = milestoneUpdateSchema.safeParse(body)
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
      return NextResponse.json({ error: 'Only admins can add updates' }, { status: 403 })
    }

    const { update_text } = validation.data

    // Create milestone update
    const { data, error } = await supabase
      .from('milestone_updates')
      .insert({
        milestone_id: id,
        update_text,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating update:', error)
      return NextResponse.json({ error: 'Failed to create update' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating update:', error)
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 })
  }
}

