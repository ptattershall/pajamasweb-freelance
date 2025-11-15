/**
 * Admin Single Milestone API Route
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { updateMilestoneSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf-protection'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate CSRF token
    const csrfValidation = await validateCsrfToken(request)
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: csrfValidation.error || 'CSRF validation failed' },
        { status: 403 }
      )
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
    const validation = updateMilestoneSchema.safeParse(body)
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
      return NextResponse.json({ error: 'Only admins can update milestones' }, { status: 403 })
    }

    const { title, description, due_date, status, progress_percent } = validation.data

    // Update milestone
    const { data, error } = await supabase
      .from('project_milestones')
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(due_date !== undefined && { due_date: due_date || null }),
        ...(status && { status }),
        ...(progress_percent !== undefined && { progress_percent }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating milestone:', error)
      return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating milestone:', error)
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate CSRF token
    const csrfValidation = await validateCsrfToken(request)
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: csrfValidation.error || 'CSRF validation failed' },
        { status: 403 }
      )
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

    const supabase = createServerSupabaseClient()

    // Verify user is OWNER
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only admins can delete milestones' }, { status: 403 })
    }

    // Delete milestone
    const { error } = await supabase
      .from('project_milestones')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting milestone:', error)
      return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 })
  }
}

