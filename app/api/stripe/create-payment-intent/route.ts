import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent, getOrCreateStripeCustomer } from '@/lib/stripe'
import { getServiceBySlug } from '@/lib/supabase'
import { z } from 'zod'

const createPaymentIntentSchema = z.object({
  serviceSlug: z.string().optional(),
  amountCents: z.number().min(50).optional(),
  userId: z.string().min(1, 'User ID is required'),
  userEmail: z.string().email('Valid email is required'),
  userName: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = createPaymentIntentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const {
      serviceSlug,
      amountCents: overrideAmount,
      userId,
      userEmail,
      userName,
      description,
      metadata,
    } = validationResult.data

    let finalAmountCents: number
    let serviceId: string | undefined
    let serviceName: string | undefined
    let paymentDescription: string | undefined

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
      paymentDescription = description || `Deposit for ${service.title}`
    } else {
      if (!overrideAmount) {
        return NextResponse.json(
          { error: 'Either serviceSlug or amountCents is required' },
          { status: 400 }
        )
      }
      finalAmountCents = overrideAmount
      paymentDescription = description || 'Custom deposit payment'
    }

    const customer = await getOrCreateStripeCustomer(userEmail, userId, userName)

    const paymentIntentResponse = await createPaymentIntent({
      amountCents: finalAmountCents,
      customerId: customer.id,
      customerEmail: userEmail,
      userId,
      serviceId,
      serviceName,
      description: paymentDescription,
      metadata: {
        ...metadata,
        customerName: userName || '',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntentResponse.clientSecret,
      paymentIntentId: paymentIntentResponse.paymentIntentId,
      amount: paymentIntentResponse.amount,
      currency: paymentIntentResponse.currency,
      customerId: customer.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)

    if (error instanceof Error) {
      if (error.message.includes('Amount must be at least')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
