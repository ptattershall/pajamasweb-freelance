/**
 * Admin Assignments API
 * GET: list assignments (by clientId or assignedUserId). POST: create assignment.
 * Only OWNER.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { createAssignment } from '@/lib/assignment-service'
import { createClientAssignmentSchema } from '@/lib/validation-schemas'

const listQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  roleType: z.enum(['SALES', 'DEV']).optional(),
  status: z.enum(['ACTIVE', 'ENDED']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const searchParams = request.nextUrl.searchParams
    const validation = listQuerySchema.safeParse({
      clientId: searchParams.get('clientId') ?? undefined,
      assignedUserId: searchParams.get('assignedUserId') ?? undefined,
      roleType: searchParams.get('roleType') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { clientId, assignedUserId, roleType, status } = validation.data

    const supabase = createServerSupabaseClient()
    let query = supabase.from('client_assignments').select('*').order('started_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)
    if (assignedUserId) query = query.eq('assigned_user_id', assignedUserId)
    if (roleType) query = query.eq('role_type', roleType)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      console.error('Admin assignments list error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ assignments: data ?? [] })
  } catch (error) {
    console.error('Admin assignments GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const body = await request.json()
    const validation = createClientAssignmentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await createAssignment(validation.data)
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ assignment: data }, { status: 201 })
  } catch (error) {
    console.error('Admin assignments POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create assignment' },
      { status: 500 }
    )
  }
}
