/**
 * Invoices API Route
 */

import { getAuthenticatedUser, getUserProfile } from '@/lib/auth-service'
import { getClientInvoices, getInvoicesByStatus, getOverdueInvoices } from '@/lib/invoices-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const status = request.nextUrl.searchParams.get('status')

    // Get user profile to check role
    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    let invoices

    if (status === 'overdue') {
      invoices = await getOverdueInvoices(user.id)
    } else if (status && status !== 'all') {
      invoices = await getInvoicesByStatus(user.id, status as any)
    } else {
      invoices = await getClientInvoices(user.id)
    }

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

