/**
 * Admin Single Rotation Member API
 * PATCH: update position or active. DELETE: remove from rotation.
 * Only OWNER.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'

const updateMemberSchema = z.object({
  position: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const { id } = await params
    const body = await request.json()
    const validation = updateMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('rotation_members')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    console.error('Admin rotation member PATCH error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update member' },
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
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from('rotation_members').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin rotation member DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    )
  }
}
