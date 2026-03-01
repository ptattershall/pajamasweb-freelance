/**
 * Portal single subscription: GET (fetch subscription, verify ownership)
 */

import { getAuthenticatedUser, getUserProfile } from '@/lib/auth-service'
import { getSubscriptionByStripeId } from '@/lib/supabase'
import { getSubscription } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
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

    const stripeSubscription = await getSubscription(stripeSubscriptionId)
    const price = stripeSubscription.items.data[0]?.price
    const product =
      typeof price?.product === 'object' ? price.product : null
    const productId = typeof price?.product === 'string' ? price.product : product?.id

    type StripeSubscriptionSlice = {
      id: string
      status: string
      cancel_at_period_end: boolean
      current_period_end: number
      current_period_start: number
    }
    const sub = stripeSubscription as unknown as StripeSubscriptionSlice

    return NextResponse.json({
      subscription,
      stripeSubscription: {
        id: sub.id,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
      },
      productId: productId || null,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
