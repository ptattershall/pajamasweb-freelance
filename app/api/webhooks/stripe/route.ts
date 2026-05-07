import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPaymentConfirmation, sendPaymentFailedNotification, PaymentEmailData } from '@/lib/email-service'
import {
  upsertInvoiceFromStripe,
  getClientIdByStripeInvoiceId,
} from '@/lib/invoices-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/** Type for Supabase table builder when using .update() with dynamic payloads (avoids strict table typing) */
type SupabaseUpdateBuilder = {
  update(data: Record<string, unknown>): { eq(column: string, value: unknown): Promise<{ error: Error | null }> }
}

/** Type for Supabase table builder when using .insert() with dynamic payloads */
type SupabaseInsertBuilder = {
  insert(data: Record<string, unknown>): { select(): Promise<{ data: unknown[]; error: Error | null }> }
}

/** Type for Supabase table builder when using .upsert() with dynamic payloads */
type SupabaseUpsertBuilder = {
  upsert(
    data: Record<string, unknown>,
    options?: { onConflict?: string }
  ): { select(): Promise<{ data: unknown[]; error: Error | null }> }
}

/** Stripe Subscription with period fields (present in API response; some SDK versions omit from type) */
type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number
  current_period_end: number
}

// Initialize Supabase client lazily to avoid build-time errors
let supabase: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

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
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break
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
      case 'invoice.created':
      case 'invoice.finalized':
      case 'invoice.updated':
        await handleInvoiceUpdated(event.data.object as Stripe.Invoice)
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

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment_intent.succeeded:', paymentIntent.id)

  const existingPayment = await getSupabaseClient()
    .from('payments')
    .select('id')
    .eq('intent_id', paymentIntent.id)
    .single()

  if (existingPayment.data) {
    const { error } = await (getSupabaseClient()
      .from('payments') as unknown as SupabaseUpdateBuilder)
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating payment record:', error)
      throw error
    }
    console.log('Payment record updated to completed:', paymentIntent.id)
  } else {
    const { data, error } = await (getSupabaseClient()
      .from('payments') as unknown as SupabaseInsertBuilder)
      .insert({
        client_id: paymentIntent.metadata?.userId,
        intent_id: paymentIntent.id,
        type: paymentIntent.metadata?.type || 'deposit',
        amount_cents: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'completed',
        related_service: paymentIntent.metadata?.serviceId,
        metadata: {
          payment_method: paymentIntent.payment_method,
          customer_email: paymentIntent.receipt_email,
          service_name: paymentIntent.metadata?.serviceName,
          description: paymentIntent.description,
        },
      })
      .select()

    if (error) {
      console.error('Error creating payment record:', error)
      throw error
    }

    console.log('Payment record created from PaymentIntent:', data[0])
  }

  if (paymentIntent.receipt_email) {
    try {
      const emailData: PaymentEmailData = {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerEmail: paymentIntent.receipt_email,
        customerName: paymentIntent.metadata?.customerName,
        serviceName: paymentIntent.metadata?.serviceName,
        description: paymentIntent.description || undefined,
        createdAt: new Date(paymentIntent.created * 1000),
      }

      await sendPaymentConfirmation(emailData)
      console.log('Payment confirmation email sent to:', paymentIntent.receipt_email)
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError)
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment_intent.payment_failed:', paymentIntent.id)

  const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed'
  console.log('Payment failed reason:', errorMessage)

  const existingPayment = await getSupabaseClient()
    .from('payments')
    .select('id')
    .eq('intent_id', paymentIntent.id)
    .single()

  if (existingPayment.data) {
    const { error } = await (getSupabaseClient()
      .from('payments') as unknown as SupabaseUpdateBuilder)
      .update({
        status: 'failed',
        metadata: {
          error_message: errorMessage,
          error_code: paymentIntent.last_payment_error?.code,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating payment record:', error)
      throw error
    }
  } else {
    const { error } = await (getSupabaseClient()
      .from('payments') as unknown as SupabaseInsertBuilder)
      .insert({
        client_id: paymentIntent.metadata?.userId,
        intent_id: paymentIntent.id,
        type: paymentIntent.metadata?.type || 'deposit',
        amount_cents: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'failed',
        related_service: paymentIntent.metadata?.serviceId,
        metadata: {
          error_message: errorMessage,
          error_code: paymentIntent.last_payment_error?.code,
          service_name: paymentIntent.metadata?.serviceName,
        },
      })
      .select()

    if (error) {
      console.error('Error creating failed payment record:', error)
      throw error
    }
  }

  if (paymentIntent.receipt_email) {
    try {
      const emailData: PaymentEmailData = {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerEmail: paymentIntent.receipt_email,
        customerName: paymentIntent.metadata?.customerName,
        serviceName: paymentIntent.metadata?.serviceName,
        description: paymentIntent.description || undefined,
        createdAt: new Date(paymentIntent.created * 1000),
      }

      await sendPaymentFailedNotification(emailData, errorMessage)
      console.log('Payment failed email sent to:', paymentIntent.receipt_email)
    } catch (emailError) {
      console.error('Failed to send payment failed email:', emailError)
    }
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment_intent.canceled:', paymentIntent.id)

  const { error } = await (getSupabaseClient()
    .from('payments') as unknown as SupabaseUpdateBuilder)
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating cancelled payment record:', error)
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  const { data, error } = await (getSupabaseClient()
    .from('payments') as unknown as SupabaseInsertBuilder)
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

function isValidUUID(str: string | undefined): boolean {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.created:', subscription.id)

  const sub = subscription as SubscriptionWithPeriod
  const priceItem = subscription.items.data[0]?.price
  const recurringInterval = priceItem?.recurring?.interval || 'month'
  const recurringIntervalCount = priceItem?.recurring?.interval_count || 1
  const userId = subscription.metadata?.userId
  const clientId = userId && isValidUUID(userId) ? userId : null

  const subscriptionData = {
    client_id: clientId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer?.id,
    stripe_price_id: priceItem?.id || '',
    status: subscription.status as 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'paused',
    amount_cents: priceItem?.unit_amount || 0,
    currency: subscription.currency,
    interval: recurringInterval as 'month' | 'year',
    interval_count: recurringIntervalCount,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : undefined,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined,
    related_service: subscription.metadata?.serviceId,
    metadata: {
      service_name: subscription.metadata?.serviceName,
      customer_name: subscription.metadata?.customerName,
    },
  }

  const { error } = await (getSupabaseClient()
    .from('subscriptions') as unknown as SupabaseUpsertBuilder)
    .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })
    .select()

  if (error) {
    console.error('Error creating subscription record:', error)
    throw error
  }

  const { error: paymentError } = await (getSupabaseClient()
    .from('payments') as unknown as SupabaseInsertBuilder)
    .insert({
      client_id: subscription.metadata?.userId,
      intent_id: subscription.id,
      type: 'retainer',
      amount_cents: priceItem?.unit_amount || 0,
      currency: subscription.currency,
      status: 'active',
      related_service: subscription.metadata?.serviceId,
      metadata: {
        subscription_id: subscription.id,
        interval: recurringInterval,
      },
    })
    .select()

  if (paymentError) {
    console.error('Error creating payment record for subscription:', paymentError)
  }

  console.log('Subscription record created:', subscription.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id)

  const sub = subscription as SubscriptionWithPeriod
  const priceItem = subscription.items.data[0]?.price
  const recurringInterval = priceItem?.recurring?.interval || 'month'
  const recurringIntervalCount = priceItem?.recurring?.interval_count || 1

  const subscriptionUpdate = {
    status: subscription.status,
    stripe_price_id: priceItem?.id,
    amount_cents: priceItem?.unit_amount || 0,
    interval: recurringInterval as 'month' | 'year',
    interval_count: recurringIntervalCount,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (getSupabaseClient()
    .from('subscriptions') as unknown as SupabaseUpdateBuilder)
    .update(subscriptionUpdate)
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription record:', error)
    throw error
  }

  const { error: paymentError } = await (getSupabaseClient()
    .from('payments') as unknown as SupabaseUpdateBuilder)
    .update({
      status: subscription.status,
      metadata: {
        subscription_id: subscription.id,
        interval: recurringInterval,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('intent_id', subscription.id)

  if (paymentError) {
    console.error('Error updating payment record for subscription:', paymentError)
  }

  console.log('Subscription record updated:', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id)

  const { error } = await (getSupabaseClient()
    .from('subscriptions') as unknown as SupabaseUpdateBuilder)
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription record:', error)
    throw error
  }

  const { error: paymentError } = await (getSupabaseClient()
    .from('payments') as unknown as SupabaseUpdateBuilder)
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('intent_id', subscription.id)

  if (paymentError) {
    console.error('Error updating payment record for subscription:', paymentError)
  }

  console.log('Subscription record deleted:', subscription.id)
}

async function getInvoiceClientId(invoice: Stripe.Invoice): Promise<string | null> {
  const fromMeta = invoice.metadata?.clientId as string | undefined
  if (fromMeta) return fromMeta
  return await getClientIdByStripeInvoiceId(invoice.id)
}

async function handleInvoiceUpdated(invoice: Stripe.Invoice) {
  console.log('Processing invoice event (created/finalized/updated):', invoice.id)
  const clientId = await getInvoiceClientId(invoice)
  if (!clientId) {
    console.warn('No clientId for Stripe invoice, skipping sync:', invoice.id)
    return
  }
  await upsertInvoiceFromStripe(invoice, clientId)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id)
  const clientId = await getInvoiceClientId(invoice)
  if (!clientId) {
    console.warn('No clientId for Stripe invoice, skipping sync:', invoice.id)
    return
  }
  await upsertInvoiceFromStripe(invoice, clientId)
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id)
  const clientId = await getInvoiceClientId(invoice)
  if (!clientId) {
    console.warn('No clientId for Stripe invoice, skipping sync:', invoice.id)
    return
  }
  await upsertInvoiceFromStripe(invoice, clientId)
}

