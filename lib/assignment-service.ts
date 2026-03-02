/**
 * Client assignment service: tie clients to SALES/DEV contractors.
 * Only OWNER can create or end assignments; contractors read via RLS.
 */

import { createServerSupabaseClient } from '@/lib/auth-service'
import type { CreateClientAssignmentInput, UpdateClientAssignmentInput } from '@/lib/validation-schemas'

export type AssignmentRoleType = 'SALES' | 'DEV'
export type AssignmentStatus = 'ACTIVE' | 'ENDED'

export interface ClientAssignmentRow {
  id: string
  client_id: string
  assigned_user_id: string
  role_type: AssignmentRoleType
  status: AssignmentStatus
  started_at: string
  ended_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Get the active assignment for a client and role type, if any.
 * Use service role so OWNER or assignment logic can call regardless of RLS.
 */
export async function getActiveAssignment(
  clientId: string,
  roleType: AssignmentRoleType
): Promise<ClientAssignmentRow | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('client_assignments')
    .select('*')
    .eq('client_id', clientId)
    .eq('role_type', roleType)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  if (error) {
    console.error('getActiveAssignment error:', error)
    return null
  }
  return data as ClientAssignmentRow | null
}

/**
 * Create a new ACTIVE assignment. Ends any existing ACTIVE assignment for (client_id, role_type) first.
 * Caller must be OWNER (enforced at API layer).
 */
export async function createAssignment(
  input: CreateClientAssignmentInput
): Promise<{ data: ClientAssignmentRow | null; error: string | null }> {
  const supabase = createServerSupabaseClient()

  const existing = await getActiveAssignment(input.client_id, input.role_type)
  if (existing) {
    const { error: endError } = await supabase
      .from('client_assignments')
      .update({ status: 'ENDED', ended_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (endError) {
      return { data: null, error: endError.message }
    }
  }

  const { data, error } = await supabase
    .from('client_assignments')
    .insert({
      client_id: input.client_id,
      assigned_user_id: input.assigned_user_id,
      role_type: input.role_type,
      status: 'ACTIVE',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }
  return { data: data as ClientAssignmentRow, error: null }
}

/**
 * End an assignment by id. Caller must be OWNER (enforced at API layer).
 */
export async function endAssignment(
  assignmentId: string
): Promise<{ error: string | null }> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('client_assignments')
    .update({ status: 'ENDED', ended_at: new Date().toISOString() })
    .eq('id', assignmentId)

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

/**
 * Update assignment (e.g. status, ended_at). Caller must be OWNER.
 */
export async function updateAssignment(
  assignmentId: string,
  updates: UpdateClientAssignmentInput
): Promise<{ data: ClientAssignmentRow | null; error: string | null }> {
  const supabase = createServerSupabaseClient()
  const payload: Record<string, unknown> = {}
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.ended_at !== undefined) payload.ended_at = updates.ended_at

  const { data, error } = await supabase
    .from('client_assignments')
    .update(payload)
    .eq('id', assignmentId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }
  return { data: data as ClientAssignmentRow, error: null }
}

/**
 * List active assignments for a contractor (assigned_user_id). Use with service role for OWNER;
 * contractors use their session and RLS will filter to their own.
 */
export async function getActiveAssignmentsForUser(
  userId: string,
  roleType: AssignmentRoleType
): Promise<ClientAssignmentRow[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('client_assignments')
    .select('*')
    .eq('assigned_user_id', userId)
    .eq('role_type', roleType)
    .eq('status', 'ACTIVE')
    .order('started_at', { ascending: false })

  if (error) {
    console.error('getActiveAssignmentsForUser error:', error)
    return []
  }
  return (data ?? []) as ClientAssignmentRow[]
}

/**
 * List all assignments for a client (active and ended). OWNER only.
 */
export async function getAssignmentsForClient(
  clientId: string
): Promise<ClientAssignmentRow[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('client_assignments')
    .select('*')
    .eq('client_id', clientId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('getAssignmentsForClient error:', error)
    return []
  }
  return (data ?? []) as ClientAssignmentRow[]
}
