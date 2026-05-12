'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { getServiceBySlug } from '@/lib/supabase-server'
import {
  getOrCreateSubscriptionPrice,
  createSubscriptionCheckoutSession,
  type SubscriptionInterval,
} from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

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
  userName,
  interval = 'month',
}: {
  serviceSlug: string
  userEmail: string
  userId: string
  userName?: string
  interval?: SubscriptionInterval
}) {
  if (!serviceSlug || !userEmail || !userId) {
    throw new Error('Missing required fields')
  }

  const service = await getServiceBySlug(serviceSlug)
  if (!service) {
    throw new Error('Service not found')
  }

  if (!service.price_from_cents) {
    throw new Error('Service has no price configured for subscription')
  }

  const productName = `${service.title} Retainer`
  const price = await getOrCreateSubscriptionPrice(
    productName,
    service.price_from_cents,
    interval
  )

  const { sessionUrl } = await createSubscriptionCheckoutSession({
    priceId: price.id,
    customerEmail: userEmail,
    userId,
    serviceId: service.id,
    serviceName: service.title,
    successUrl: `${baseUrl}/checkout/success?type=subscription&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/services/${service.slug}`,
    metadata: { customerName: userName || '' },
  })

  redirect(sessionUrl)
}

export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'subscription'],
  })

  return session
}

