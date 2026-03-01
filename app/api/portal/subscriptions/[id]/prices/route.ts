/**
 * List alternative prices for the same product (for upgrade/downgrade)
 */

import { getAuthenticatedUser, getUserProfile } from '@/lib/auth-service'
import { getSubscriptionByStripeId } from '@/lib/supabase'
import { getSubscription, listPricesByProduct } from '@/lib/stripe'
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
    const currentPrice = stripeSubscription.items.data[0]?.price
    const productId =
      typeof currentPrice?.product === 'string'
        ? currentPrice.product
        : (currentPrice?.product as { id?: string })?.id

    if (!productId) {
      return NextResponse.json({ prices: [] })
    }

    const prices = await listPricesByProduct(productId, true)
    const currentPriceId = currentPrice?.id
    const alternatives = prices
      .filter((p) => p.id !== currentPriceId)
      .map((p) => ({
        id: p.id,
        unit_amount: p.unit_amount,
        currency: p.currency,
        recurring: p.recurring
          ? {
              interval: p.recurring.interval,
              interval_count: p.recurring.interval_count,
            }
          : null,
      }))

    return NextResponse.json({ prices: alternatives, currentPriceId })
  } catch (error) {
    console.error('Error listing prices:', error)
    return NextResponse.json(
      { error: 'Failed to list prices' },
      { status: 500 }
    )
  }
}
