/**
 * Admin Milestone Updates API Route
 */

import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { milestoneUpdateSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error
    const { user } = auth

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

