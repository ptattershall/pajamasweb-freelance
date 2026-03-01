/**
 * Admin Invoice Reminder API Route
 *
 * POST /api/admin/invoices/remind
 *
 * Send a payment reminder email for an open or overdue invoice.
 * Only OWNER users can send reminders.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { getInvoiceById, getClientEmail } from '@/lib/invoices-service'
import { retrieveInvoice } from '@/lib/stripe'
import { sendInvoicePaymentReminder } from '@/lib/email-service'

const remindBodySchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only admins can send invoice reminders' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = remindBodySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { invoiceId } = validation.data
    const invoice = await getInvoiceById(invoiceId)
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    if (invoice.status !== 'open') {
      return NextResponse.json(
        { error: 'Only open invoices can be reminded' },
        { status: 400 }
      )
    }

    let hostedInvoiceUrl = invoice.hosted_invoice_url
    let invoicePdf = invoice.invoice_pdf
    if (invoice.stripe_invoice_id && (!hostedInvoiceUrl || !invoicePdf)) {
      const stripeInvoice = await retrieveInvoice(invoice.stripe_invoice_id)
      hostedInvoiceUrl = stripeInvoice.hosted_invoice_url ?? null
      invoicePdf = stripeInvoice.invoice_pdf ?? null
    }

    if (!hostedInvoiceUrl) {
      return NextResponse.json(
        { error: 'Invoice has no payment URL' },
        { status: 400 }
      )
    }

    const customerEmail = await getClientEmail(invoice.client_id)
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Client email not found' },
        { status: 400 }
      )
    }

    const dueDate = invoice.due_date ? new Date(invoice.due_date) : undefined
    const isOverdue = dueDate ? dueDate < new Date() : false

    await sendInvoicePaymentReminder({
      customerEmail,
      amountCents: invoice.amount_cents,
      currency: invoice.currency,
      description: invoice.description ?? undefined,
      dueDate,
      hostedInvoiceUrl,
      invoicePdf: invoicePdf ?? undefined,
      isOverdue,
    })

    return NextResponse.json({
      success: true,
      message: isOverdue ? 'Overdue reminder sent' : 'Reminder sent',
    })
  } catch (error) {
    console.error('Error sending invoice reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
