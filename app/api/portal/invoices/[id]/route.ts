/**
 * Invoice Detail API Route
 */

import { getAuthenticatedUser } from '@/lib/auth-service'
import { getInvoiceWithPaymentHistory } from '@/lib/invoices-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const invoiceId = id

    // Get invoice with payment history
    const invoice = await getInvoiceWithPaymentHistory(invoiceId, user.id)

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

