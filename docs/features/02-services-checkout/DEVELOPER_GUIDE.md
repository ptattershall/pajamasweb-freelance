# Developer Guide - Services & Checkout

## Architecture Overview

```
User → Service Page → Checkout UI → Stripe Checkout → Webhook → Supabase
```

## Key Components

### 1. Service Pages
- **Location**: `app/services/` and `app/services/[slug]/`
- **Purpose**: Display services and initiate checkout
- **Data**: Fetched from Supabase `services` table

### 2. Checkout Actions
- **Location**: `app/actions/checkout.ts`
- **Purpose**: Server-side Stripe session creation
- **Functions**:
  - `createDepositCheckout()` - One-off payment
  - `createRetainerCheckout()` - Subscription
  - `retrieveCheckoutSession()` - Get session details

### 3. Webhook Handler
- **Location**: `app/api/webhooks/stripe/route.ts`
- **Purpose**: Process Stripe events
- **Events**: 6 event types handled
- **Action**: Create/update payment records

### 4. Database Functions
- **Location**: `lib/supabase.ts`
- **Purpose**: Database operations
- **Functions**: 10+ helper functions

## Adding New Features

### Add Email Notifications

1. Install Resend:
```bash
npm install resend
```

2. Add to webhook handler:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function handleCheckoutSessionCompleted(session) {
  // ... existing code ...
  
  // Send email
  await resend.emails.send({
    from: 'noreply@pajamasweb.com',
    to: session.customer_email,
    subject: 'Payment Received',
    html: `<p>Thank you for your payment of $${(session.amount_total / 100).toFixed(2)}</p>`
  })
}
```

### Add Subscription Management

1. Create new page: `app/subscriptions/page.tsx`
2. Add function to `lib/supabase.ts`:
```typescript
export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', userId)
    .eq('type', 'retainer')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

3. Create cancel action:
```typescript
export async function cancelSubscription(subscriptionId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  await stripe.subscriptions.del(subscriptionId)
}
```

### Add Invoice Creation

1. Create server action:
```typescript
export async function createInvoice({
  customerId,
  items,
  dueDate
}: {
  customerId: string
  items: Array<{ price: string; quantity: number }>
  dueDate: number
}) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: 30,
    line_items: items
  })
  
  await stripe.invoices.sendInvoice(invoice.id)
  return invoice
}
```

2. Add webhook handler:
```typescript
case 'invoice.created':
  await handleInvoiceCreated(event.data.object)
  break
```

## Database Queries

### Get User's Payments
```typescript
const payments = await getPaymentsByUser(userId)
```

### Get Payment by Stripe ID
```typescript
const payment = await getPaymentByIntentId(stripeId)
```

### Update Payment Status
```typescript
await updatePayment(paymentId, { status: 'paid' })
```

### Get All Services
```typescript
const services = await getServices(true) // active only
```

## Webhook Event Flow

```
Stripe Event
    ↓
Webhook Handler (verify signature)
    ↓
Event Type Switch
    ↓
Handler Function
    ↓
Supabase Insert/Update
    ↓
Optional: Send Email
```

## Error Handling

### Webhook Errors
```typescript
try {
  event = stripe.webhooks.constructEvent(body, sig, secret)
} catch (err) {
  return NextResponse.json(
    { error: 'Webhook signature verification failed' },
    { status: 400 }
  )
}
```

### Database Errors
```typescript
if (error) {
  console.error('Error:', error)
  throw error
}
```

## Testing New Features

### Test Webhook Events
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### Test with Real Checkout
1. Start webhook listener
2. Start dev server
3. Complete payment
4. Verify in Supabase

## Performance Considerations

- Use indexes on frequently queried columns
- Batch webhook processing if needed
- Cache service list on client
- Use pagination for payment history

## Security Checklist

- [ ] Verify webhook signatures
- [ ] Use service role key for server operations
- [ ] Enable RLS on all tables
- [ ] Validate user input
- [ ] Don't expose secret keys
- [ ] Use HTTPS in production
- [ ] Rate limit checkout endpoints

## Debugging

### Check Webhook Events
```bash
stripe logs tail
```

### View Specific Event
```bash
stripe events retrieve evt_test_...
```

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click "Logs"
3. Filter by table or function

### Check Application Logs
```bash
# Terminal where dev server is running
npm run dev
```

## Common Tasks

### Add New Service
```typescript
await createService({
  slug: 'new-service',
  title: 'New Service',
  price_from_cents: 99900,
  tier: 'starter',
  is_active: true
})
```

### Update Service Price
```typescript
await updateService(serviceId, {
  price_from_cents: 199900
})
```

### Get Payment Details
```typescript
const payment = await getPaymentByIntentId(intentId)
```

## Resources

- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Webhook Best Practices](https://stripe.com/docs/webhooks)

---

**Last Updated**: 2024-11-13

