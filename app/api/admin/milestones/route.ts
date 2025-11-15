/**
 * Admin Milestones API Route
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { createMilestoneSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf-protection'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Verify user is OWNER
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only admins can access this' }, { status: 403 })
    }

    // Get all milestones with client info
    const { data, error } = await supabase
      .from('project_milestones')
      .select(`
        *,
        profiles:client_id(display_name, company)
      `)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error fetching milestones:', error)
      return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const validation = createMilestoneSchema.safeParse(body)
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
      return NextResponse.json({ error: 'Only admins can create milestones' }, { status: 403 })
    }

    const { client_id, title, description, due_date, status, progress_percent } = validation.data

    // Create milestone
    const { data, error } = await supabase
      .from('project_milestones')
      .insert({
        client_id,
        title,
        description: description || null,
        due_date: due_date || null,
        status: status || 'pending',
        progress_percent: progress_percent || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating milestone:', error)
      return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating milestone:', error)
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
  }
}

