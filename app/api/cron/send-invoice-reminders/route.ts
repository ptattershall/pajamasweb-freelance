/**
 * Cron: Send payment reminders for overdue invoices
 *
 * GET /api/cron/send-invoice-reminders
 *
 * Call with Authorization: Bearer <CRON_SECRET> (set CRON_SECRET in env).
 * Safe to run daily; sends one reminder email per overdue open invoice.
 */

import { NextRequest, NextResponse } from 'next/server'
import { listAllOverdueInvoices, getClientEmail } from '@/lib/invoices-service'
import { retrieveInvoice } from '@/lib/stripe'
import { sendInvoicePaymentReminder } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const overdue = await listAllOverdueInvoices()
    let sent = 0
    const errors: string[] = []

    for (const invoice of overdue) {
      try {
        const customerEmail = await getClientEmail(invoice.client_id)
        if (!customerEmail) {
          errors.push(`Invoice ${invoice.id}: no client email`)
          continue
        }

        let hostedInvoiceUrl = invoice.hosted_invoice_url
        let invoicePdf = invoice.invoice_pdf
        if (invoice.stripe_invoice_id && !hostedInvoiceUrl) {
          const stripeInvoice = await retrieveInvoice(invoice.stripe_invoice_id)
          hostedInvoiceUrl = stripeInvoice.hosted_invoice_url ?? null
          invoicePdf = stripeInvoice.invoice_pdf ?? null
        }

        if (!hostedInvoiceUrl) {
          errors.push(`Invoice ${invoice.id}: no payment URL`)
          continue
        }

        await sendInvoicePaymentReminder({
          customerEmail,
          amountCents: invoice.amount_cents,
          currency: invoice.currency,
          description: invoice.description ?? undefined,
          dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
          hostedInvoiceUrl,
          invoicePdf: invoicePdf ?? undefined,
          isOverdue: true,
        })
        sent++
      } catch (err) {
        errors.push(`Invoice ${invoice.id}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      overdueCount: overdue.length,
      remindersSent: sent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron send-invoice-reminders error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}
