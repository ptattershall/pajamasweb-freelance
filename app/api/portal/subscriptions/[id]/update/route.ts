/**
 * Update subscription (change plan/price - upgrade or downgrade)
 */

import { getAuthenticatedUser, getUserProfile } from '@/lib/auth-service'
import { getSubscriptionByStripeId } from '@/lib/supabase'
import { updateSubscription } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateBodySchema = z.object({
  newPriceId: z.string().min(1, 'newPriceId is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: stripeSubscriptionId } = await params
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const subscription = await getSubscriptionByStripeId(stripeSubscriptionId)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }
    if (subscription.client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await updateSubscription(stripeSubscriptionId, parsed.data.newPriceId)
    return NextResponse.json({
      success: true,
      message: 'Subscription updated. Prorations may apply.',
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
