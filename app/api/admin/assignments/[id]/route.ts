/**
 * Admin Single Assignment API
 * PATCH: update (e.g. end assignment). GET: fetch one.
 * Only OWNER.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { endAssignment, updateAssignment } from '@/lib/assignment-service'
import { updateClientAssignmentSchema } from '@/lib/validation-schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const { id } = await params
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('client_assignments')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin assignment GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const { id } = await params
    const body = await request.json()
    const validation = updateClientAssignmentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await updateAssignment(id, validation.data)
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ assignment: data })
  } catch (error) {
    console.error('Admin assignment PATCH error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const { id } = await params
    const { error } = await endAssignment(id)
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin assignment DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to end assignment' },
      { status: 500 }
    )
  }
}
