/**
 * Payments API Route
 * 
 * Handles fetching payment history for authenticated users
 */

import { getAuthenticatedUser, getUserProfile } from '@/lib/auth-service'
import { getPaymentsByUserWithFilters } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') as 'deposit' | 'retainer' | 'invoice' | undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const { payments, total } = await getPaymentsByUserWithFilters(user.id, {
      status,
      type,
      limit,
      offset,
    })

    return NextResponse.json({
      payments,
      total,
      limit,
      offset,
      hasMore: offset + payments.length < total,
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
