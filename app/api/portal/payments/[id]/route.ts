/**
 * Single Payment API Route
 * 
 * Handles fetching a specific payment by ID for authenticated users
 */

import { getAuthenticatedUser, getUserProfile } from '@/lib/auth-service'
import { getPaymentById } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const { id } = await params
    const payment = await getPaymentById(id)

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.client_id !== user.id && profile.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Unauthorized to view this payment' },
        { status: 403 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}
