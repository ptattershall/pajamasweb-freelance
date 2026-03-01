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
import {
  stripe,
  getOrCreateStripeCustomer,
  createDraftInvoice,
  addInvoiceLineItem,
  finalizeInvoice,
  sendInvoice,
  retrieveInvoice,
} from './stripe'

export interface CreateInvoiceParams {
  clientId: string
  amountCents: number
  description?: string
  daysUntilDue?: number
  currency?: string
  sendEmail?: boolean
}

export interface CreateInvoiceResult {
  invoice: Invoice
  stripeInvoiceId: string
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

/**
 * Get client email by user id (server-side only, uses service role).
 */
export async function getClientEmail(clientId: string): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.admin.getUserById(clientId)
  if (error || !user?.email) return null
  return user.email
}

/**
 * Upsert a single invoice row from a Stripe invoice (for webhook or after create).
 */
export function stripeInvoiceToDbRow(
  stripeInvoice: Stripe.Invoice,
  clientId: string
): Record<string, unknown> {
  const status = stripeInvoice.status as Invoice['status']
  return {
    client_id: clientId,
    stripe_invoice_id: stripeInvoice.id,
    amount_cents: stripeInvoice.amount_due ?? 0,
    currency: (stripeInvoice.currency ?? 'usd').toUpperCase(),
    status,
    description: stripeInvoice.description ?? null,
    due_date: stripeInvoice.due_date
      ? new Date(stripeInvoice.due_date * 1000).toISOString()
      : null,
    paid_at:
      stripeInvoice.status === 'paid' && stripeInvoice.status_transitions?.paid_at != null
        ? new Date((stripeInvoice.status_transitions as { paid_at?: number }).paid_at! * 1000).toISOString()
        : null,
    hosted_invoice_url: stripeInvoice.hosted_invoice_url ?? null,
    invoice_pdf: stripeInvoice.invoice_pdf ?? null,
  }
}

/**
 * Get client_id for an invoice by stripe_invoice_id (for webhooks when metadata may be missing).
 */
export async function getClientIdByStripeInvoiceId(
  stripeInvoiceId: string
): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('client_id')
    .eq('stripe_invoice_id', stripeInvoiceId)
    .single()
  if (error || !data?.client_id) return null
  return data.client_id
}

/**
 * Persist Stripe invoice to our invoices table (upsert by stripe_invoice_id).
 */
export async function upsertInvoiceFromStripe(
  stripeInvoice: Stripe.Invoice,
  clientId: string
): Promise<Invoice | null> {
  const supabase = createServerSupabaseClient()
  const row = stripeInvoiceToDbRow(stripeInvoice, clientId)
  const validated = schemas.invoiceSchema.partial().omit({ id: true, created_at: true, updated_at: true }).parse(row)

  const { data, error } = await supabase
    .from('invoices')
    .upsert(validated, { onConflict: 'stripe_invoice_id' })
    .select()
    .single()

  if (error) {
    console.error('Error upserting invoice from Stripe:', error)
    return null
  }
  return schemas.invoiceSchema.parse(data)
}

/**
 * Create a Stripe invoice, finalize it, send it, and persist to our DB.
 * Optionally send a custom invoice email via Resend.
 */
export async function createAndSendInvoice(
  params: CreateInvoiceParams
): Promise<CreateInvoiceResult | null> {
  const {
    clientId,
    amountCents,
    description = 'Invoice',
    daysUntilDue = 30,
    currency = 'usd',
    sendEmail = true,
  } = params

  const email = await getClientEmail(clientId)
  if (!email) {
    console.error('Cannot create invoice: no email for client', clientId)
    return null
  }

  const customer = await getOrCreateStripeCustomer(email, clientId)
  const draft = await createDraftInvoice({
    customerId: customer.id,
    clientId,
    description,
    daysUntilDue,
    currency,
    metadata: { source: 'portal_admin' },
  })

  await addInvoiceLineItem(draft.id, {
    description,
    amountCents,
    quantity: 1,
    currency,
  })

  const finalized = await finalizeInvoice(draft.id)
  const sent = await sendInvoice(finalized.id)

  const clientIdFromMeta = (sent.metadata?.clientId as string) || clientId
  const persisted = await upsertInvoiceFromStripe(sent, clientIdFromMeta)
  if (!persisted) {
    throw new Error('Failed to persist invoice to database')
  }

  if (sendEmail && sent.hosted_invoice_url) {
    const { sendInvoiceEmail } = await import('./email-service')
    await sendInvoiceEmail({
      customerEmail: email,
      customerName: customer.name ?? undefined,
      amountCents: sent.amount_due ?? 0,
      currency: sent.currency ?? 'usd',
      description: sent.description ?? description,
      dueDate: sent.due_date ? new Date(sent.due_date * 1000) : undefined,
      hostedInvoiceUrl: sent.hosted_invoice_url,
      invoicePdf: sent.invoice_pdf ?? undefined,
    }).catch((err) => console.error('Failed to send invoice email:', err))
  }

  return {
    invoice: persisted,
    stripeInvoiceId: sent.id,
    hostedInvoiceUrl: sent.hosted_invoice_url ?? null,
    invoicePdf: sent.invoice_pdf ?? null,
  }
}

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
 * Get a single invoice with Zod validation (scoped to client)
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
 * Get a single invoice by id (admin/server only, no client scope)
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (error) {
    console.error('Error fetching invoice by id:', error)
    return null
  }

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
 * Get overdue invoices with Zod validation (scoped to client)
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
 * List all overdue invoices (admin/cron only, no client scope)
 */
export async function listAllOverdueInvoices(): Promise<Invoice[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('status', 'open')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error listing overdue invoices:', error)
    return []
  }

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
    const stripeInvoice = await retrieveInvoice(invoice.stripe_invoice_id!, [
      'charge',
      'payment_intent',
      'payment_intent.charges',
    ])

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
    const { listCustomerInvoices } = await import('./stripe')
    const stripeInvoices = await listCustomerInvoices(stripeCustomerId, 100)

    // Upsert into database
    for (const stripeInvoice of stripeInvoices) {
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

