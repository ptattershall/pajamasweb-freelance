/**
 * Admin Invoices API Route
 *
 * POST /api/admin/invoices
 *
 * Create and send a Stripe invoice to a client.
 * Only OWNER users can create invoices.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { createAndSendInvoice } from '@/lib/invoices-service'

const createInvoiceBodySchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  amountCents: z.number().int().positive('Amount must be positive'),
  description: z.string().max(2000).optional(),
  daysUntilDue: z.number().int().min(1).max(365).default(30),
  currency: z.string().length(3).default('usd'),
  sendEmail: z.boolean().default(true),
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
        { error: 'Only admins can create invoices' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createInvoiceBodySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createAndSendInvoice({
      clientId: validation.data.clientId,
      amountCents: validation.data.amountCents,
      description: validation.data.description,
      daysUntilDue: validation.data.daysUntilDue,
      currency: validation.data.currency,
      sendEmail: validation.data.sendEmail,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create invoice (client may have no email)' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      invoice: result.invoice,
      stripeInvoiceId: result.stripeInvoiceId,
      hostedInvoiceUrl: result.hostedInvoiceUrl,
      invoicePdf: result.invoicePdf,
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
