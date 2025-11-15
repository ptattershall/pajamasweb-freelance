/**
 * Booking Service with Zod Validation
 *
 * Provides type-safe booking operations with automatic validation
 * using Zod schemas from validation-schemas.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as schemas from './validation-schemas'
import type { CreateBookingInput, UpdateBookingInput, Booking } from './validation-schemas'

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
 * @deprecated Use CreateBookingInput from validation-schemas instead
 */
export interface BookingData {
  clientId: string
  title: string
  description?: string
  startsAt: Date
  endsAt: Date
  externalId: string
  attendeeEmail: string
  attendeeName?: string
  status?: 'confirmed' | 'cancelled' | 'rescheduled'
}

/**
 * Create a new booking in the database with Zod validation
 */
export async function createBooking(data: CreateBookingInput | BookingData): Promise<Booking> {
  try {
    // Convert legacy BookingData format to CreateBookingInput if needed
    let input: CreateBookingInput
    if ('startsAt' in data && data.startsAt instanceof Date) {
      // Legacy format
      input = {
        client_id: data.clientId,
        title: data.title,
        description: data.description,
        starts_at: data.startsAt.toISOString(),
        ends_at: data.endsAt.toISOString(),
        external_id: data.externalId,
        attendee_email: data.attendeeEmail,
        attendee_name: data.attendeeName,
        provider: 'calcom',
      }
    } else {
      input = data as CreateBookingInput
    }

    // Validate input with Zod
    const validated = schemas.createBookingSchema.parse(input)

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([validated])
      .select()
      .single()

    if (error) throw error

    // Validate output with Zod
    const validatedBooking = schemas.bookingSchema.parse(booking)

    // Log to booking history
    await logBookingHistory(validatedBooking.id, 'created', null, validatedBooking)

    return validatedBooking
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

/**
 * Update an existing booking with Zod validation
 */
export async function updateBooking(
  externalId: string,
  updates: UpdateBookingInput | Partial<BookingData>
): Promise<Booking> {
  try {
    // Get existing booking
    const { data: existing } = await supabase
      .from('bookings')
      .select('*')
      .eq('external_id', externalId)
      .single()

    if (!existing) {
      throw new Error(`Booking not found: ${externalId}`)
    }

    // Convert legacy format if needed
    let input: UpdateBookingInput
    if ('startsAt' in updates && updates.startsAt instanceof Date) {
      // Legacy format
      input = {
        title: updates.title,
        starts_at: updates.startsAt.toISOString(),
        ends_at: updates.endsAt?.toISOString(),
      }
    } else {
      input = updates as UpdateBookingInput
    }

    // Validate input with Zod
    const validated = schemas.updateBookingSchema.parse(input)

    // Update booking
    const { data: updated, error } = await supabase
      .from('bookings')
      .update({
        ...validated,
        status: 'rescheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('external_id', externalId)
      .select()
      .single()

    if (error) throw error

    // Validate output with Zod
    const validatedBooking = schemas.bookingSchema.parse(updated)

    // Log to booking history
    await logBookingHistory(validatedBooking.id, 'updated', existing, validatedBooking)

    return validatedBooking
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

/**
 * Cancel a booking with Zod validation
 */
export async function cancelBooking(externalId: string): Promise<Booking> {
  try {
    const { data: existing } = await supabase
      .from('bookings')
      .select('*')
      .eq('external_id', externalId)
      .single()

    if (!existing) {
      throw new Error(`Booking not found: ${externalId}`)
    }

    const { data: cancelled, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('external_id', externalId)
      .select()
      .single()

    if (error) throw error

    // Validate output with Zod
    const validatedBooking = schemas.bookingSchema.parse(cancelled)

    // Log to booking history
    await logBookingHistory(validatedBooking.id, 'cancelled', existing, validatedBooking)

    return validatedBooking
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw error
  }
}

/**
 * Get booking by external ID with Zod validation
 */
export async function getBookingByExternalId(externalId: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('external_id', externalId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null

    // Validate output with Zod
    return schemas.bookingSchema.parse(data)
  } catch (error) {
    console.error('Error fetching booking:', error)
    throw error
  }
}

/**
 * Log booking history for audit trail with Zod validation
 */
async function logBookingHistory(
  bookingId: string,
  action: string,
  oldValues: Booking | null,
  newValues: Booking
) {
  try {
    // Validate booking data before logging
    if (oldValues) {
      schemas.bookingSchema.parse(oldValues)
    }
    schemas.bookingSchema.parse(newValues)

    await supabase
      .from('booking_history')
      .insert({
        booking_id: bookingId,
        action,
        previous_status: oldValues?.status || null,
        new_status: newValues.status,
        changed_by: newValues.id, // Using booking ID as changed_by for now
      })
  } catch (error) {
    console.error('Error logging booking history:', error)
    // Don't throw - this is non-critical
  }
}

