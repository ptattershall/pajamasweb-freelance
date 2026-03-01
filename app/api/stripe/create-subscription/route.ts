import { NextRequest, NextResponse } from 'next/server'
import {
  createSubscriptionCheckoutSession,
  getOrCreateSubscriptionPrice,
  SubscriptionInterval,
} from '@/lib/stripe'
import { getServiceBySlug } from '@/lib/supabase'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  serviceSlug: z.string().optional(),
  amountCents: z.number().min(50).optional(),
  interval: z.enum(['month', 'year']).default('month'),
  userId: z.string().min(1, 'User ID is required'),
  userEmail: z.string().email('Valid email is required'),
  userName: z.string().optional(),
  trialDays: z.number().min(0).max(90).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = createSubscriptionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const {
      serviceSlug,
      amountCents: overrideAmount,
      interval,
      userId,
      userEmail,
      userName,
      trialDays,
      successUrl,
      cancelUrl,
      metadata,
    } = validationResult.data

    let finalAmountCents: number
    let serviceId: string | undefined
    let serviceName: string | undefined
    let productName: string

    if (serviceSlug) {
      const service = await getServiceBySlug(serviceSlug)
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        )
      }

      if (!service.price_from_cents && !overrideAmount) {
        return NextResponse.json(
          { error: 'Service has no price configured and no amount provided' },
          { status: 400 }
        )
      }

      finalAmountCents = overrideAmount || service.price_from_cents!
      serviceId = service.id
      serviceName = service.title
      productName = `${service.title} Retainer`
    } else {
      if (!overrideAmount) {
        return NextResponse.json(
          { error: 'Either serviceSlug or amountCents is required' },
          { status: 400 }
        )
      }
      finalAmountCents = overrideAmount
      productName = 'Custom Retainer'
    }

    const price = await getOrCreateSubscriptionPrice(
      productName,
      finalAmountCents,
      interval as SubscriptionInterval
    )

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const defaultSuccessUrl = `${origin}/checkout/success?type=subscription&session_id={CHECKOUT_SESSION_ID}`
    const defaultCancelUrl = serviceSlug
      ? `${origin}/services/${serviceSlug}`
      : `${origin}/services`

    const checkoutResponse = await createSubscriptionCheckoutSession({
      priceId: price.id,
      customerEmail: userEmail,
      userId,
      serviceId,
      serviceName,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
      trialDays,
      metadata: {
        ...metadata,
        customerName: userName || '',
        interval,
      },
    })

    return NextResponse.json({
      sessionId: checkoutResponse.sessionId,
      sessionUrl: checkoutResponse.sessionUrl,
      priceId: price.id,
      amount: finalAmountCents,
      interval,
    })
  } catch (error) {
    console.error('Error creating subscription checkout:', error)

    if (error instanceof Error) {
      if (error.message.includes('Amount must be at least')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create subscription checkout' },
      { status: 500 }
    )
  }
}
