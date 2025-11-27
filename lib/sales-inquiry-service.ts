/**
 * Sales Inquiry Service
 *
 * Handles CRUD operations for sales inquiries from the sales funnel
 */

import { createClient } from '@supabase/supabase-js'
import { createSalesInquirySchema, updateSalesInquirySchema, type CreateSalesInquiryInput, type UpdateSalesInquiryInput, type SalesInquiry } from '@/lib/validation-schemas'

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

/**
 * Create a new sales inquiry
 */
export async function createSalesInquiry(data: CreateSalesInquiryInput): Promise<{ data: SalesInquiry | null; error: Error | null }> {
  try {
    // Validate input
    const validatedData = createSalesInquirySchema.parse(data)

    const supabase = getSupabaseClient()

    const { data: inquiry, error } = await supabase
      .from('sales_inquiries')
      .insert([
        {
          ...validatedData,
          status: 'NEW',
          source: 'website',
          meeting_booked: false,
        }
      ] as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating sales inquiry:', error)
      return { data: null, error: new Error('Failed to submit inquiry') }
    }

    return { data: inquiry, error: null }
  } catch (error) {
    console.error('Sales inquiry service error:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }
}

/**
 * Get all sales inquiries (OWNER only)
 */
export async function getAllSalesInquiries(): Promise<{ data: SalesInquiry[] | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const { data: inquiries, error } = await supabase
      .from('sales_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sales inquiries:', error)
      return { data: null, error: new Error('Failed to fetch inquiries') }
    }

    return { data: inquiries, error: null }
  } catch (error) {
    console.error('Sales inquiry service error:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }
}

/**
 * Get a single sales inquiry by ID (OWNER only)
 */
export async function getSalesInquiryById(id: string): Promise<{ data: SalesInquiry | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const { data: inquiry, error } = await supabase
      .from('sales_inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching sales inquiry:', error)
      return { data: null, error: new Error('Failed to fetch inquiry') }
    }

    return { data: inquiry, error: null }
  } catch (error) {
    console.error('Sales inquiry service error:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }
}

/**
 * Update a sales inquiry (OWNER only)
 */
export async function updateSalesInquiry(id: string, data: UpdateSalesInquiryInput): Promise<{ data: SalesInquiry | null; error: Error | null }> {
  try {
    // Validate input
    const validatedData = updateSalesInquirySchema.parse(data)

    const supabase = getSupabaseClient()

    const { data: inquiry, error } = await (supabase
      .from('sales_inquiries')
      // @ts-ignore - sales_inquiries table type not yet generated
      .update(validatedData)
      .eq('id', id)
      .select()
      .single())

    if (error) {
      console.error('Error updating sales inquiry:', error)
      return { data: null, error: new Error('Failed to update inquiry') }
    }

    return { data: inquiry, error: null }
  } catch (error) {
    console.error('Sales inquiry service error:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }
}

/**
 * Link a booking to a sales inquiry
 */
export async function linkBookingToInquiry(inquiryId: string, bookingId: string): Promise<{ data: SalesInquiry | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const { data: inquiry, error } = await (supabase
      .from('sales_inquiries')
      // @ts-ignore - sales_inquiries table type not yet generated
      .update({
        meeting_booked: true,
        booking_id: bookingId,
      })
      .eq('id', inquiryId)
      .select()
      .single())

    if (error) {
      console.error('Error linking booking to inquiry:', error)
      return { data: null, error: new Error('Failed to link booking') }
    }

    return { data: inquiry, error: null }
  } catch (error) {
    console.error('Sales inquiry service error:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }
}
