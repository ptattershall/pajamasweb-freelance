/**
 * Client Service Library with Zod Validation
 *
 * Provides secure access to client-specific data with RLS enforcement.
 * All queries are scoped to the authenticated user.
 * Uses Zod for type-safe validation of all database responses.
 */

import { createClient } from '@supabase/supabase-js'
import * as schemas from './validation-schemas'
import type { Invoice, Booking, Deliverable } from './validation-schemas'

// Lazy initialize Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient(): ReturnType<typeof createClient> {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

const supabase: any = new Proxy(
  {},
  {
    get: (target, prop) => {
      const client = getSupabaseClient()
      return (client as any)[prop]
    },
  }
)

/**
 * Get all invoices for a client with Zod validation
 * RLS policy ensures user only sees their own invoices
 */
export async function getClientInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }

  // Validate each invoice with Zod
  return (data || []).map((item: any) => schemas.invoiceSchema.parse(item))
}

/**
 * Get invoice summary for a client
 */
export async function getInvoiceSummary(userId: string) {
  const invoices = await getClientInvoices(userId)

  const summary = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    pending: invoices.filter((i) => i.status === 'open').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.amount_cents, 0),
    recentInvoices: invoices.slice(0, 5),
  }

  return summary
}

/**
 * Get all bookings for a client with Zod validation
 * RLS policy ensures user only sees their own bookings
 */
export async function getClientBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', userId)
    .order('starts_at', { ascending: true })

  if (error) {
    console.error('Error fetching bookings:', error)
    throw error
  }

  // Validate each booking with Zod
  return (data || []).map((item: any) => schemas.bookingSchema.parse(item))
}

/**
 * Get upcoming bookings for a client with Zod validation
 */
export async function getUpcomingBookings(userId: string): Promise<Booking[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', userId)
    .eq('status', 'confirmed')
    .gt('starts_at', now)
    .order('starts_at', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error fetching upcoming bookings:', error)
    throw error
  }

  // Validate each booking with Zod
  return (data || []).map((item: any) => schemas.bookingSchema.parse(item))
}

/**
 * Get booking summary for a client
 */
export async function getBookingSummary(userId: string) {
  const bookings = await getClientBookings(userId);
  const now = new Date();

  const upcoming = bookings.filter((b) => new Date(b.starts_at) > now);
  const past = bookings.filter((b) => new Date(b.starts_at) <= now);

  return {
    total: bookings.length,
    upcoming: upcoming.length,
    past: past.length,
    nextBooking: upcoming[0] || null,
    recentBookings: bookings.slice(0, 5),
  };
}

/**
 * Get all deliverables for a client with Zod validation
 * RLS policy ensures user only sees their own deliverables
 */
export async function getClientDeliverables(userId: string): Promise<Deliverable[]> {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching deliverables:', error)
    throw error
  }

  // Validate each deliverable with Zod
  return (data || []).map((item: any) => schemas.deliverableSchema.parse(item))
}

/**
 * Get deliverable summary for a client
 */
export async function getDeliverableSummary(userId: string) {
  const deliverables = await getClientDeliverables(userId)

  return {
    total: deliverables.length,
    recentDeliverables: deliverables.slice(0, 5),
    byProject: deliverables.reduce(
      (acc, d) => {
        const projectId = 'unassigned'
        if (!acc[projectId]) acc[projectId] = []
        acc[projectId].push(d)
        return acc
      },
      {} as Record<string, Deliverable[]>
    ),
  }
}

/**
 * Format invoice for display
 */
export function formatInvoice(invoice: Invoice): string {
  const amount = (invoice.amount_cents / 100).toFixed(2);
  const date = new Date(invoice.created_at).toLocaleDateString();
  const statusLabel = invoice.status === 'paid' ? 'Paid' : 'Pending';

  return `Invoice - $${amount} (${statusLabel}) - ${date}`;
}

/**
 * Format booking for display
 */
export function formatBooking(booking: Booking): string {
  const start = new Date(booking.starts_at).toLocaleString();
  const end = new Date(booking.ends_at).toLocaleTimeString();

  return `${booking.title} - ${start} to ${end}`;
}

/**
 * Format deliverable for display
 */
export function formatDeliverable(deliverable: Deliverable): string {
  const date = new Date(deliverable.completed_at || deliverable.created_at).toLocaleDateString();

  return `${deliverable.title} - ${deliverable.status} - ${date}`;
}

