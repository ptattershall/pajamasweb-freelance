/**
 * Round-robin rotation for assigning new clients to SALES/DEV.
 * Only OWNER or system should call assignClientTo*; use createAssignment after picking next member.
 */

import { createServerSupabaseClient } from '@/lib/auth-service'
import { createAssignment } from '@/lib/assignment-service'
import type { AssignmentRoleType } from '@/lib/assignment-service'

export interface RotationMemberRow {
  id: string
  user_id: string
  role_type: 'SALES' | 'DEV'
  position: number
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * Get active rotation members for a role type, ordered by position.
 */
export async function getActiveRotationMembers(
  roleType: AssignmentRoleType
): Promise<RotationMemberRow[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('rotation_members')
    .select('*')
    .eq('role_type', roleType)
    .eq('active', true)
    .order('position', { ascending: true })

  if (error) {
    console.error('getActiveRotationMembers error:', error)
    return []
  }
  return (data ?? []) as RotationMemberRow[]
}

/**
 * Get last assigned member id for a role type (from rotation_state).
 */
export async function getLastAssignedMemberId(
  roleType: AssignmentRoleType
): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('rotation_state')
    .select('last_assigned_member_id')
    .eq('role_type', roleType)
    .single()

  if (error || !data?.last_assigned_member_id) {
    return null
  }
  return data.last_assigned_member_id as string
}

/**
 * Compute next member in round-robin. Returns first member if last is null or not in list.
 */
export function computeNextMember(
  members: RotationMemberRow[],
  lastAssignedMemberId: string | null
): RotationMemberRow | null {
  if (members.length === 0) return null
  if (!lastAssignedMemberId) return members[0]!

  const idx = members.findIndex((m) => m.id === lastAssignedMemberId)
  if (idx === -1) return members[0]!
  const nextIdx = (idx + 1) % members.length
  return members[nextIdx]!
}

/**
 * Update rotation state to record who was assigned (for next round-robin).
 */
export async function setLastAssignedMember(
  roleType: AssignmentRoleType,
  memberId: string
): Promise<void> {
  const supabase = createServerSupabaseClient()
  await supabase
    .from('rotation_state')
    .update({ last_assigned_member_id: memberId, updated_at: new Date().toISOString() })
    .eq('role_type', roleType)
}

/**
 * Assign a new client to the next SALES person in rotation. Creates ACTIVE assignment.
 * Returns the assignment or error. Caller must be OWNER or trusted system.
 */
export async function assignClientToSales(clientId: string): Promise<{
  assignment: { id: string; assigned_user_id: string } | null
  error: string | null
}> {
  const members = await getActiveRotationMembers('SALES')
  if (members.length === 0) {
    return { assignment: null, error: 'No active SALES members in rotation' }
  }

  const lastId = await getLastAssignedMemberId('SALES')
  const next = computeNextMember(members, lastId)
  if (!next) {
    return { assignment: null, error: 'Could not compute next member' }
  }

  const { data, error } = await createAssignment({
    client_id: clientId,
    assigned_user_id: next.user_id,
    role_type: 'SALES',
  })
  if (error) {
    return { assignment: null, error }
  }

  await setLastAssignedMember('SALES', next.id)
  return {
    assignment: data ? { id: data.id, assigned_user_id: data.assigned_user_id } : null,
    error: null,
  }
}

/**
 * Assign a new client to the next DEV in rotation. Creates ACTIVE assignment.
 */
export async function assignClientToDev(clientId: string): Promise<{
  assignment: { id: string; assigned_user_id: string } | null
  error: string | null
}> {
  const members = await getActiveRotationMembers('DEV')
  if (members.length === 0) {
    return { assignment: null, error: 'No active DEV members in rotation' }
  }

  const lastId = await getLastAssignedMemberId('DEV')
  const next = computeNextMember(members, lastId)
  if (!next) {
    return { assignment: null, error: 'Could not compute next member' }
  }

  const { data, error } = await createAssignment({
    client_id: clientId,
    assigned_user_id: next.user_id,
    role_type: 'DEV',
  })
  if (error) {
    return { assignment: null, error }
  }

  await setLastAssignedMember('DEV', next.id)
  return {
    assignment: data ? { id: data.id, assigned_user_id: data.assigned_user_id } : null,
    error: null,
  }
}
