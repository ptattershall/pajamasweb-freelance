/**
 * Invoices Service with Zod Validation
 *
 * Handles invoice management and Stripe integration for the client portal
 * Uses Zod for type-safe validation of all database responses
 */

import { createServerSupabaseClient } from './auth-service'
import Stripe from 'stripe'
import * as schemas from './validation-schemas'
import type { Invoice } from './validation-schemas'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
})

/**
 * Get all invoices for a client with Zod validation
 */
export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  // Validate each invoice with Zod
  return (data || []).map(item => schemas.invoiceSchema.parse(item))
}

/**
 * Get a single invoice with Zod validation
 */
export async function getInvoice(invoiceId: string, clientId: string): Promise<Invoice | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('client_id', clientId)
    .single()

  if (error) {
    console.error('Error fetching invoice:', error)
    return null
  }

  // Validate with Zod
  return schemas.invoiceSchema.parse(data)
}

/**
 * Get invoices by status with Zod validation
 */
export async function getInvoicesByStatus(
  clientId: string,
  status: Invoice['status']
): Promise<Invoice[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  // Validate each invoice with Zod
  return (data || []).map(item => schemas.invoiceSchema.parse(item))
}

/**
 * Get overdue invoices with Zod validation
 */
export async function getOverdueInvoices(clientId: string): Promise<Invoice[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'open')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching overdue invoices:', error)
    return []
  }

  // Validate each invoice with Zod
  return (data || []).map(item => schemas.invoiceSchema.parse(item))
}

/**
 * Get invoice with payment history from Stripe
 */
export async function getInvoiceWithPaymentHistory(invoiceId: string, clientId: string) {
  const supabase = createServerSupabaseClient()

  // Get invoice from database
  const invoice = await getInvoice(invoiceId, clientId)
  if (!invoice || !invoice.stripe_invoice_id) {
    return null
  }

  try {
    // Fetch full invoice details from Stripe
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id, {
      expand: ['charge', 'payment_intent', 'payment_intent.charges']
    })

    // Get payment history (charges associated with this invoice)
    const paymentHistory = []

    const chargeId = (stripeInvoice as any).charge;
    if (chargeId) {
      const charge = typeof chargeId === 'string'
        ? await stripe.charges.retrieve(chargeId)
        : chargeId

      paymentHistory.push({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        created: charge.created,
        payment_method_details: charge.payment_method_details,
        receipt_url: charge.receipt_url,
      })
    }

    const stripeInvoiceAny = stripeInvoice as any;
    return {
      ...invoice,
      payment_history: paymentHistory,
      stripe_details: {
        number: stripeInvoiceAny.number,
        customer_email: stripeInvoiceAny.customer_email,
        subtotal: stripeInvoiceAny.subtotal,
        tax: stripeInvoiceAny.tax,
        total: stripeInvoiceAny.total,
        lines: stripeInvoiceAny.lines?.data?.map((line: any) => ({
          description: line.description,
          amount: line.amount,
          quantity: line.quantity,
          price: line.price,
        })) || [],
      }
    }
  } catch (error) {
    console.error('Error fetching invoice from Stripe:', error)
    return invoice
  }
}

/**
 * Sync invoices from Stripe with Zod validation
 */
export async function syncStripeInvoices(clientId: string, stripeCustomerId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Fetch invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 100,
    })

    // Upsert into database
    for (const stripeInvoice of stripeInvoices.data) {
      const invoiceData = {
        client_id: clientId,
        stripe_invoice_id: stripeInvoice.id,
        amount_cents: stripeInvoice.amount_due,
        currency: stripeInvoice.currency.toUpperCase(),
        status: stripeInvoice.status as Invoice['status'],
        description: stripeInvoice.description,
        due_date: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000).toISOString() : null,
        paid_at: (stripeInvoice as any).paid_at ? new Date((stripeInvoice as any).paid_at * 1000).toISOString() : null,
        hosted_invoice_url: stripeInvoice.hosted_invoice_url || null,
        invoice_pdf: stripeInvoice.invoice_pdf || null,
      }

      // Validate with Zod before upserting
      const validated = schemas.invoiceSchema.partial().parse(invoiceData)

      await supabase
        .from('invoices')
        .upsert(validated)
    }

    return true
  } catch (error) {
    console.error('Error syncing Stripe invoices:', error)
    return false
  }
}

