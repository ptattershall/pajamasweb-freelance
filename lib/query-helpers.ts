/**
 * Type-Safe Query Helpers with Zod Validation
 * 
 * These helpers provide type-safe database queries using Supabase REST API
 * with automatic Zod validation for both input and output.
 */

import { createClient } from '@supabase/supabase-js'
import * as schemas from './validation-schemas'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================================
// PROFILE QUERIES
// ============================================================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return schemas.profileSchema.parse(data)
}

export async function createProfile(input: schemas.CreateProfileInput) {
  const validated = schemas.createProfileSchema.parse(input)
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([validated])
    .select()
    .single()

  if (error) throw error
  return schemas.profileSchema.parse(data)
}

export async function updateProfile(
  userId: string,
  input: schemas.UpdateProfileInput
) {
  const validated = schemas.updateProfileSchema.parse(input)
  
  const { data, error } = await supabase
    .from('profiles')
    .update(validated)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return schemas.profileSchema.parse(data)
}

// ============================================================================
// BOOKING QUERIES
// ============================================================================

export async function getBooking(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return schemas.bookingSchema.parse(data)
}

export async function getClientBookings(clientId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', clientId)
    .order('starts_at', { ascending: false })

  if (error) throw error
  return data.map(item => schemas.bookingSchema.parse(item))
}

export async function createBooking(input: schemas.CreateBookingInput) {
  const validated = schemas.createBookingSchema.parse(input)
  
  const { data, error } = await supabase
    .from('bookings')
    .insert([validated])
    .select()
    .single()

  if (error) throw error
  return schemas.bookingSchema.parse(data)
}

export async function updateBooking(
  id: string,
  input: schemas.UpdateBookingInput
) {
  const validated = schemas.updateBookingSchema.parse(input)
  
  const { data, error } = await supabase
    .from('bookings')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return schemas.bookingSchema.parse(data)
}

// ============================================================================
// INVOICE QUERIES
// ============================================================================

export async function getInvoice(id: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return schemas.invoiceSchema.parse(data)
}

export async function getClientInvoices(clientId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(item => schemas.invoiceSchema.parse(item))
}

export async function createInvoice(input: schemas.CreateInvoiceInput) {
  const validated = schemas.createInvoiceSchema.parse(input)
  
  const { data, error } = await supabase
    .from('invoices')
    .insert([validated])
    .select()
    .single()

  if (error) throw error
  return schemas.invoiceSchema.parse(data)
}

export async function updateInvoice(
  id: string,
  input: schemas.UpdateInvoiceInput
) {
  const validated = schemas.updateInvoiceSchema.parse(input)

  const { data, error } = await supabase
    .from('invoices')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return schemas.invoiceSchema.parse(data)
}

// ============================================================================
// CONTRACT QUERIES
// ============================================================================

export async function getContract(id: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return schemas.contractSchema.parse(data)
}

export async function getClientContracts(clientId: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(item => schemas.contractSchema.parse(item))
}

export async function createContract(input: schemas.CreateContractInput) {
  const validated = schemas.createContractSchema.parse(input)

  const { data, error } = await supabase
    .from('contracts')
    .insert([validated])
    .select()
    .single()

  if (error) throw error
  return schemas.contractSchema.parse(data)
}

export async function updateContract(
  id: string,
  input: schemas.UpdateContractInput
) {
  const validated = schemas.updateContractSchema.parse(input)

  const { data, error } = await supabase
    .from('contracts')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return schemas.contractSchema.parse(data)
}

// ============================================================================
// DELIVERABLE QUERIES
// ============================================================================

export async function getDeliverable(id: string) {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return schemas.deliverableSchema.parse(data)
}

export async function getClientDeliverables(clientId: string) {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(item => schemas.deliverableSchema.parse(item))
}

export async function createDeliverable(input: schemas.CreateDeliverableInput) {
  const validated = schemas.createDeliverableSchema.parse(input)

  const { data, error } = await supabase
    .from('deliverables')
    .insert([validated])
    .select()
    .single()

  if (error) throw error
  return schemas.deliverableSchema.parse(data)
}

export async function updateDeliverable(
  id: string,
  input: schemas.UpdateDeliverableInput
) {
  const validated = schemas.updateDeliverableSchema.parse(input)

  const { data, error } = await supabase
    .from('deliverables')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return schemas.deliverableSchema.parse(data)
}

// ============================================================================
// PROJECT MILESTONE QUERIES
// ============================================================================

export async function getProjectMilestone(id: string) {
  const { data, error } = await supabase
    .from('project_milestones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return schemas.projectMilestoneSchema.parse(data)
}

export async function getClientProjectMilestones(clientId: string) {
  const { data, error } = await supabase
    .from('project_milestones')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data.map(item => schemas.projectMilestoneSchema.parse(item))
}

export async function createProjectMilestone(input: schemas.CreateProjectMilestoneInput) {
  const validated = schemas.createProjectMilestoneSchema.parse(input)

  const { data, error } = await supabase
    .from('project_milestones')
    .insert([validated])
    .select()
    .single()

  if (error) throw error
  return schemas.projectMilestoneSchema.parse(data)
}

export async function updateProjectMilestone(
  id: string,
  input: schemas.UpdateProjectMilestoneInput
) {
  const validated = schemas.updateProjectMilestoneSchema.parse(input)

  const { data, error } = await supabase
    .from('project_milestones')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return schemas.projectMilestoneSchema.parse(data)
}

// ============================================================================
// MILESTONE UPDATE QUERIES
// ============================================================================

export async function getMilestoneUpdate(id: string) {
  const { data, error } = await supabase
    .from('milestone_updates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return schemas.milestoneUpdateRecordSchema.parse(data)
}

export async function getMilestoneUpdates(milestoneId: string) {
  const { data, error } = await supabase
    .from('milestone_updates')
    .select('*')
    .eq('milestone_id', milestoneId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(item => schemas.milestoneUpdateRecordSchema.parse(item))
}

export async function createMilestoneUpdate(input: schemas.CreateMilestoneUpdateRecordInput) {
  const validated = schemas.createMilestoneUpdateRecordSchema.parse(input)

  const { data, error } = await supabase
    .from('milestone_updates')
    .insert([validated])
    .select()
    .single()

  if (error) throw error
  return schemas.milestoneUpdateRecordSchema.parse(data)
}

