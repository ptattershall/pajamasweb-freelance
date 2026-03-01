/**
 * Cancel a subscription (at period end or immediately)
 */

import { getAuthenticatedUser, getUserProfile } from '@/lib/auth-service'
import { getSubscriptionByStripeId } from '@/lib/supabase'
import { cancelSubscription } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const cancelBodySchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
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

    const body = await request.json().catch(() => ({}))
    const parsed = cancelBodySchema.safeParse(body)
    const cancelAtPeriodEnd = parsed.success ? parsed.data.cancelAtPeriodEnd : true

    await cancelSubscription(stripeSubscriptionId, cancelAtPeriodEnd)
    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd,
      message: cancelAtPeriodEnd
        ? 'Subscription will cancel at the end of the current period.'
        : 'Subscription has been canceled.',
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
