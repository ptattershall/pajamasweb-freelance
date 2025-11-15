import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Initialize Supabase client lazily to avoid build-time errors
let supabase: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabase
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  const { data, error } = await getSupabaseClient()
    .from('payments')
    .insert({
      client_id: session.metadata?.userId,
      intent_id: session.payment_intent,
      type: session.metadata?.type || 'deposit',
      amount_cents: session.amount_total,
      currency: session.currency,
      status: 'completed',
      related_service: session.metadata?.serviceId,
      metadata: {
        session_id: session.id,
        customer_email: session.customer_email,
      },
    })
    .select()

  if (error) {
    console.error('Error creating payment record:', error)
    throw error
  }

  console.log('Payment record created:', data[0])
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.created:', subscription.id)

  const { data, error } = await getSupabaseClient()
    .from('payments')
    .insert({
      client_id: subscription.metadata?.userId,
      intent_id: subscription.id,
      type: 'retainer',
      amount_cents: subscription.items.data[0]?.price?.unit_amount || 0,
      currency: subscription.currency,
      status: 'active',
      related_service: subscription.metadata?.serviceId,
      metadata: {
        subscription_id: subscription.id,
        interval: subscription.items.data[0]?.price?.recurring?.interval,
      },
    })
    .select()

  if (error) {
    console.error('Error creating subscription record:', error)
    throw error
  }

  console.log('Subscription record created:', data[0])
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id)

  const { error } = await getSupabaseClient()
    .from('payments')
    .update({
      status: subscription.status,
      metadata: {
        subscription_id: subscription.id,
        interval: subscription.items.data[0]?.price?.recurring?.interval,
      },
    })
    .eq('intent_id', subscription.id)

  if (error) {
    console.error('Error updating subscription record:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id)

  const { error } = await getSupabaseClient()
    .from('payments')
    .update({ status: 'cancelled' })
    .eq('intent_id', subscription.id)

  if (error) {
    console.error('Error updating subscription record:', error)
    throw error
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id)

  const { error } = await getSupabaseClient()
    .from('payments')
    .update({ status: 'paid' })
    .eq('intent_id', invoice.id)

  if (error) {
    console.error('Error updating invoice record:', error)
    throw error
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id)

  const { error } = await getSupabaseClient()
    .from('payments')
    .update({ status: 'failed' })
    .eq('intent_id', invoice.id)

  if (error) {
    console.error('Error updating invoice record:', error)
    throw error
  }
}

