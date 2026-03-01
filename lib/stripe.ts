import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
})

export interface CreatePaymentIntentParams {
  amountCents: number
  currency?: string
  customerId?: string
  customerEmail?: string
  userId: string
  serviceId?: string
  serviceName?: string
  description?: string
  metadata?: Record<string, string>
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  status: string
}

export async function getOrCreateStripeCustomer(
  email: string,
  userId: string,
  name?: string
): Promise<Stripe.Customer> {
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    const customer = existingCustomers.data[0]
    if (!customer.metadata.userId) {
      await stripe.customers.update(customer.id, {
        metadata: { userId },
      })
    }
    return customer
  }

  const newCustomer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  })

  return newCustomer
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> {
  const {
    amountCents,
    currency = 'usd',
    customerId,
    customerEmail,
    userId,
    serviceId,
    serviceName,
    description,
    metadata = {},
  } = params

  if (amountCents < 50) {
    throw new Error('Amount must be at least 50 cents')
  }

  let stripeCustomerId = customerId

  if (!stripeCustomerId && customerEmail) {
    const customer = await getOrCreateStripeCustomer(customerEmail, userId)
    stripeCustomerId = customer.id
  }

  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: amountCents,
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      userId,
      type: 'deposit',
      ...metadata,
      ...(serviceId && { serviceId }),
      ...(serviceName && { serviceName }),
    },
    ...(stripeCustomerId && { customer: stripeCustomerId }),
    ...(description && { description }),
    ...(customerEmail && { receipt_email: customerEmail }),
  }

  const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

  if (!paymentIntent.client_secret) {
    throw new Error('Failed to create payment intent: no client secret')
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  }
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.cancel(paymentIntentId)
}

export async function updatePaymentIntentAmount(
  paymentIntentId: string,
  amountCents: number
): Promise<Stripe.PaymentIntent> {
  if (amountCents < 50) {
    throw new Error('Amount must be at least 50 cents')
  }
  return await stripe.paymentIntents.update(paymentIntentId, {
    amount: amountCents,
  })
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

export type SubscriptionInterval = 'month' | 'year'

export interface CreateSubscriptionProductParams {
  name: string
  description?: string
  metadata?: Record<string, string>
}

export interface CreateSubscriptionPriceParams {
  productId: string
  amountCents: number
  currency?: string
  interval: SubscriptionInterval
  intervalCount?: number
  metadata?: Record<string, string>
}

export interface CreateSubscriptionCheckoutParams {
  priceId: string
  customerId?: string
  customerEmail?: string
  userId: string
  serviceId?: string
  serviceName?: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
  metadata?: Record<string, string>
}

export interface SubscriptionCheckoutResponse {
  sessionId: string
  sessionUrl: string
}

export async function createSubscriptionProduct(
  params: CreateSubscriptionProductParams
): Promise<Stripe.Product> {
  const { name, description, metadata = {} } = params

  const product = await stripe.products.create({
    name,
    description,
    metadata,
  })

  return product
}

export async function createSubscriptionPrice(
  params: CreateSubscriptionPriceParams
): Promise<Stripe.Price> {
  const {
    productId,
    amountCents,
    currency = 'usd',
    interval,
    intervalCount = 1,
    metadata = {},
  } = params

  if (amountCents < 50) {
    throw new Error('Amount must be at least 50 cents')
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amountCents,
    currency,
    recurring: {
      interval,
      interval_count: intervalCount,
    },
    metadata,
  })

  return price
}

export async function getOrCreateSubscriptionPrice(
  productName: string,
  amountCents: number,
  interval: SubscriptionInterval,
  currency: string = 'usd'
): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    limit: 100,
  })

  const existingPrice = prices.data.find(
    (price) =>
      price.unit_amount === amountCents &&
      price.currency === currency &&
      price.recurring?.interval === interval &&
      price.product &&
      typeof price.product === 'object' &&
      (price.product as Stripe.Product).name === productName
  )

  if (existingPrice) {
    return existingPrice
  }

  const existingProducts = await stripe.products.list({
    active: true,
    limit: 100,
  })

  let product = existingProducts.data.find((p) => p.name === productName)

  if (!product) {
    product = await createSubscriptionProduct({
      name: productName,
      description: `Retainer subscription for ${productName}`,
    })
  }

  const newPrice = await createSubscriptionPrice({
    productId: product.id,
    amountCents,
    currency,
    interval,
  })

  return newPrice
}

export async function createSubscriptionCheckoutSession(
  params: CreateSubscriptionCheckoutParams
): Promise<SubscriptionCheckoutResponse> {
  const {
    priceId,
    customerId,
    customerEmail,
    userId,
    serviceId,
    serviceName,
    successUrl,
    cancelUrl,
    trialDays,
    metadata = {},
  } = params

  let stripeCustomerId = customerId

  if (!stripeCustomerId && customerEmail) {
    const customer = await getOrCreateStripeCustomer(customerEmail, userId)
    stripeCustomerId = customer.id
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      type: 'retainer',
      ...metadata,
      ...(serviceId && { serviceId }),
      ...(serviceName && { serviceName }),
    },
    subscription_data: {
      metadata: {
        userId,
        type: 'retainer',
        ...(serviceId && { serviceId }),
        ...(serviceName && { serviceName }),
      },
      ...(trialDays && trialDays > 0 && { trial_period_days: trialDays }),
    },
    ...(stripeCustomerId && { customer: stripeCustomerId }),
    ...(customerEmail && !stripeCustomerId && { customer_email: customerEmail }),
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.url) {
    throw new Error('Failed to create checkout session: no URL returned')
  }

  return {
    sessionId: session.id,
    sessionUrl: session.url,
  }
}

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  })
}

export async function listPricesByProduct(
  productId: string,
  activeOnly: boolean = true
): Promise<Stripe.Price[]> {
  const prices = await stripe.prices.list({
    product: productId,
    active: activeOnly,
    type: 'recurring',
    limit: 100,
  })
  return prices.data
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

export async function listCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100,
  })
  return subscriptions.data
}

export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  })
}

// ============================================================================
// STRIPE INVOICING
// ============================================================================

export interface CreateDraftInvoiceParams {
  customerId: string
  clientId: string
  description?: string
  daysUntilDue: number
  currency?: string
  metadata?: Record<string, string>
}

export interface AddInvoiceLineItemParams {
  description: string
  amountCents: number
  quantity?: number
  currency?: string
}

/**
 * Create a draft invoice with send_invoice collection method (manual payment).
 * Call addInvoiceLineItem then finalizeInvoice and sendInvoice to complete.
 */
export async function createDraftInvoice(
  params: CreateDraftInvoiceParams
): Promise<Stripe.Invoice> {
  const {
    customerId,
    clientId,
    description,
    daysUntilDue,
    currency = 'usd',
    metadata = {},
  } = params

  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: daysUntilDue,
    currency,
    description: description ?? undefined,
    metadata: {
      clientId,
      ...metadata,
    },
    auto_advance: false,
  })

  return invoice
}

/**
 * Add a line item to a draft invoice.
 */
export async function addInvoiceLineItem(
  invoiceId: string,
  params: AddInvoiceLineItemParams
): Promise<Stripe.InvoiceLineItem> {
  const { description, amountCents, quantity = 1, currency = 'usd' } = params

  const invoice = await stripe.invoices.retrieve(invoiceId)
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
  if (!customerId) {
    throw new Error('Invoice has no customer')
  }

  const lineItem = await stripe.invoiceItems.create({
    customer: customerId,
    invoice: invoiceId,
    description,
    amount: amountCents,
    quantity,
    currency,
  })

  return lineItem as unknown as Stripe.InvoiceLineItem
}

/**
 * Finalize a draft invoice so it becomes open and can be sent.
 */
export async function finalizeInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return await stripe.invoices.finalizeInvoice(invoiceId)
}

/**
 * Send the invoice to the customer (Stripe emails the hosted invoice link).
 */
export async function sendInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return await stripe.invoices.sendInvoice(invoiceId)
}

/**
 * Retrieve an invoice with optional expand.
 */
export async function retrieveInvoice(
  invoiceId: string,
  expand?: string[]
): Promise<Stripe.Invoice> {
  return await stripe.invoices.retrieve(invoiceId, {
    expand: expand ?? ['charge', 'payment_intent'],
  })
}

/**
 * List invoices for a Stripe customer.
 */
export async function listCustomerInvoices(
  customerId: string,
  limit: number = 100
): Promise<Stripe.Invoice[]> {
  const { data } = await stripe.invoices.list({
    customer: customerId,
    limit,
  })
  return data
}

export type { Stripe }
