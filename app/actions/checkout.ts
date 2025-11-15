'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { getServiceBySlug } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function createDepositCheckout({
  serviceSlug,
  userEmail,
  userId,
}: {
  serviceSlug: string
  userEmail: string
  userId: string
}) {
  // Validate inputs
  if (!serviceSlug || !userEmail || !userId) {
    throw new Error('Missing required fields')
  }

  // Fetch service from database
  const service = await getServiceBySlug(serviceSlug)
  if (!service) {
    throw new Error('Service not found')
  }

  const stripePriceId = service.stripe_price_id
  if (!stripePriceId) {
    throw new Error('Service does not have a Stripe price configured')
  }

  // Create or get Stripe customer
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { userId },
  })

  if (!customer.id) {
    throw new Error('Failed to create Stripe customer')
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id as string,
    mode: 'payment',
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/services/${service.slug}`,
    metadata: {
      serviceId: service.id || '',
      type: 'deposit',
      userId,
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  redirect(session.url)
}

export async function createRetainerCheckout({
  serviceSlug,
  userEmail,
  userId,
}: {
  serviceSlug: string
  userEmail: string
  userId: string
}) {
  // Validate inputs
  if (!serviceSlug || !userEmail || !userId) {
    throw new Error('Missing required fields')
  }

  // Fetch service from database
  const service = await getServiceBySlug(serviceSlug)
  if (!service) {
    throw new Error('Service not found')
  }

  const stripePriceId = service.stripe_price_id
  if (!stripePriceId) {
    throw new Error('Service does not have a Stripe price configured')
  }

  // Create or get Stripe customer
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { userId },
  })

  if (!customer.id) {
    throw new Error('Failed to create Stripe customer')
  }

  // Create subscription checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id as string,
    mode: 'subscription',
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/services/${service.slug}`,
    subscription_data: {
      metadata: {
        serviceId: service.id || '',
        userId,
      },
    },
    metadata: {
      serviceId: service.id || '',
      type: 'retainer',
      userId,
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  redirect(session.url)
}

export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'subscription'],
  })

  return session
}

