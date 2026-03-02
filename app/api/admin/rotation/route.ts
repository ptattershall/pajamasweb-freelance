/**
 * Admin Rotation API
 * GET: list rotation members and state for a role type.
 * POST: add a member to the rotation.
 * Only OWNER.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { getActiveRotationMembers, getLastAssignedMemberId } from '@/lib/rotation-service'

const listQuerySchema = z.object({
  roleType: z.enum(['SALES', 'DEV']),
})

const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleType: z.enum(['SALES', 'DEV']),
  position: z.number().int().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const searchParams = request.nextUrl.searchParams
    const validation = listQuerySchema.safeParse({
      roleType: searchParams.get('roleType') ?? undefined,
    })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { roleType } = validation.data
    const members = await getActiveRotationMembers(roleType)
    const allMembers = await (async () => {
      const supabase = createServerSupabaseClient()
      const { data } = await supabase
        .from('rotation_members')
        .select('*')
        .eq('role_type', roleType)
        .order('position', { ascending: true })
      return (data ?? []) as Array<{
        id: string
        user_id: string
        role_type: string
        position: number
        active: boolean
        created_at: string
        updated_at: string
      }>
    })()
    const lastAssignedMemberId = await getLastAssignedMemberId(roleType)

    return NextResponse.json({
      roleType,
      members: allMembers,
      activeMembers: members,
      lastAssignedMemberId,
    })
  } catch (error) {
    console.error('Admin rotation GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list rotation' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const body = await request.json()
    const validation = addMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { userId, roleType, position } = validation.data
    const supabase = createServerSupabaseClient()

    const pos = position ?? (await getNextPosition(supabase, roleType))
    const { data, error } = await supabase
      .from('rotation_members')
      .insert({
        user_id: userId,
        role_type: roleType,
        position: pos,
        active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'User is already in the rotation for this role type' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ member: data }, { status: 201 })
  } catch (error) {
    console.error('Admin rotation POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add member' },
      { status: 500 }
    )
  }
}

async function getNextPosition(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  roleType: string
): Promise<number> {
  const { data } = await supabase
    .from('rotation_members')
    .select('position')
    .eq('role_type', roleType)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.position != null ? (data.position as number) + 1 : 0
}
