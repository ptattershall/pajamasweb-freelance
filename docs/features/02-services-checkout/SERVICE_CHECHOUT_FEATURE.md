# Feature: Services & Checkout

## Overview

Service package pages with Stripe-powered checkout flows for deposits, retainers, and invoices.

## 🎯 Current Implementation Status

**✅ Fully Complete:**

- Phase 1: Setup & Database
- Phase 2: Service Pages
- Phase 3: Deposit Checkout (one-off payments)

**🔄 Partially Complete (Backend Ready, UI Not Built):**

- Phase 4: Retainer Subscriptions (webhook handlers + server actions complete)
- Phase 5: Invoicing (webhook handlers complete)

**⬜ Not Started:**

- Email notifications (Resend SDK installed but not integrated)
- Subscription management UI
- Invoice creation/management UI
- Payment dashboard
- Analytics and reporting

## 📚 Documentation

**Start Here**: [README.md](./README.md) - Overview, quick start, and status

**Setup & Testing:**

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete step-by-step setup guide
- **[STRIPE_CLI_TESTING.md](./STRIPE_CLI_TESTING.md)** - Testing with Stripe CLI
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Setup checklist

**Development:**

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - How to extend the feature
- **[SERVICE_CHECHOUT_FEATURE.md](./SERVICE_CHECHOUT_FEATURE.md)** (this file) - Complete technical specification

## User Stories

- As a **Prospect**, I want to view service packages with pricing so I can understand what's offered
- As a **Prospect**, I want to pay a deposit to start working together
- As a **Client**, I want to subscribe to a retainer plan for ongoing work
- As a **Founder/Operator**, I want to send invoices to clients and track payment status

## Technical Requirements

### Core Components

- Service pages with "From $X" + scope bullets
- **Checkout flows:**
  - **Deposit** (one-off Stripe PaymentIntent or Stripe Checkout session)
  - **Retainer** (Stripe Subscription; e.g., 10/20/40 hrs/mo)
  - **Invoice** (Stripe Invoicing API or custom invoice object + hosted invoice link)
- Post-payment: write receipt + status to Supabase, email via Resend

### Database Schema

```sql
create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  details_md text,
  price_from_cents int,
  tier text check (tier in ('starter','pro','enterprise')),
  is_active boolean default true,
  stripe_price_id text, -- Stripe Price ID for checkout
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade,
  intent_id text, -- Stripe PaymentIntent/Subscription/Invoice id
  type text check (type in ('deposit','retainer','invoice')) not null,
  amount_cents int not null,
  currency text default 'usd',
  status text, -- 'completed','active','cancelled','paid','failed', etc.
  related_service uuid references services(id) on delete set null,
  metadata jsonb, -- Additional data (session_id, customer_email, etc.)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### RLS Policies

- `services`: public read where `is_active = true`
- `payments`: user can read only their own; OWNER can read all

## Development Phases

### Phase 1: Setup & Database ✅ COMPLETE

**Estimated Time:** 1 day

**Tasks:**

- [x] Install Stripe SDK
- [x] Create `services` table in Supabase
- [x] Create `payments` table in Supabase
- [x] Set up RLS policies for services and payments
- [x] Add Supabase helper functions for services/payments
- [x] Create Stripe webhook handler
- [x] Create checkout server actions

**Acceptance Criteria:**

- Stripe SDK installed and configured
- Database tables created with proper RLS policies
- Webhook endpoint ready for Stripe events
- Server actions for checkout flows implemented

### Phase 2: Service Pages ✅ COMPLETE

**Estimated Time:** 1 day

**Tasks:**

- [x] Build service listing page (`/services`)
- [x] Build individual service detail pages (`/services/[slug]`)
- [x] Create ServiceCheckoutButtons component
- [x] Add pricing display component
- [x] Create checkout success page
- [x] Create checkout cancel page
- [x] Create seed script for test services

**Acceptance Criteria:**

- Services display with pricing and descriptions
- Service pages are SEO-optimized with metadata
- Only active services are visible to public
- Checkout buttons integrated on service pages

### Phase 3: Stripe Deposits (One-off Payments) ✅ COMPLETE

**Estimated Time:** 2-3 days

**Tasks:**

- [x] Set up Stripe account and get API keys
- [x] Install Stripe SDK
- [x] Create server action for deposit checkout
- [x] Build deposit payment flow UI
- [x] Implement Stripe Checkout session creation
- [x] Create success/cancel pages
- [x] Set up Stripe webhook endpoint
- [x] Handle `checkout.session.completed` event
- [x] Write payment record to Supabase on success (webhook handles this)
- [ ] Send receipt email via Resend (NOT IMPLEMENTED)
- [ ] Test with Stripe CLI (manual testing required)

**Acceptance Criteria:**

- ✅ Users can complete deposit payments
- ✅ Payment records are created in database
- ❌ Receipt emails are sent automatically (NOT IMPLEMENTED)
- ✅ Webhook handles payment events correctly

### Phase 4: Stripe Retainers (Subscriptions) 🔄 PARTIALLY COMPLETE

**Estimated Time:** 3-4 days

**Backend Complete, UI Not Started**

**Tasks:**

- [ ] Create Stripe subscription products and prices (manual setup required)
- [ ] Build retainer selection UI (10/20/40 hrs/mo tiers) (NOT STARTED)
- [x] Create server action for subscription checkout
- [x] Implement subscription creation flow
- [x] Handle subscription webhook events (`customer.subscription.created`, `updated`, `deleted`)
- [ ] Build subscription management page for clients (NOT STARTED)
- [ ] Add cancel/pause subscription functionality (NOT STARTED)
- [x] Track subscription status in Supabase
- [ ] Send subscription confirmation emails (NOT IMPLEMENTED)

**Acceptance Criteria:**

- ✅ Users can subscribe to retainer plans (backend ready)
- ✅ Subscriptions renew automatically (Stripe handles this)
- ❌ Clients can manage their subscriptions (UI not built)
- ✅ Subscription status syncs with Stripe (webhook handlers complete)

### Phase 5: Stripe Invoicing 🔄 PARTIALLY COMPLETE

**Estimated Time:** 2-3 days

**Webhook Handlers Complete, Admin UI Not Started**

**Tasks:**

- [ ] Set up Stripe Invoicing API (manual setup required)
- [ ] Create server action to generate invoices (NOT STARTED)
- [ ] Build invoice creation UI for admin (NOT STARTED)
- [ ] Implement invoice sending functionality (NOT STARTED)
- [x] Handle invoice webhook events (`invoice.payment_succeeded`, `invoice.payment_failed`)
- [ ] Create invoice viewing page for clients (NOT STARTED)
- [x] Add invoice status tracking (database updates via webhook)
- [ ] Send invoice notification emails (NOT IMPLEMENTED)
- [ ] Build invoice history view (NOT STARTED)

**Acceptance Criteria:**

- ❌ Admin can create and send invoices (UI not built)
- ❌ Clients receive invoice notifications (emails not implemented)
- ✅ Invoice status updates automatically (webhook handlers complete)
- ❌ Clients can view and pay invoices (UI not built)

### Phase 6: Payment Dashboard ⬜ NOT STARTED

**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Build admin payment dashboard
- [ ] Display all payments with filters
- [ ] Add payment status indicators
- [ ] Create payment analytics view
- [ ] Build client payment history view
- [ ] Add export functionality (CSV)
- [ ] Implement refund functionality

**Acceptance Criteria:**

- Admin can view all payments and their status
- Payments can be filtered by type, status, client
- Analytics show revenue trends
- Refunds can be processed through UI

## Integration Requirements

### Stripe

#### Deposits (One-off Payments)

- **API**: Stripe Checkout Sessions API with `mode: "payment"`
- **Flow**:
  1. Create Checkout Session with `line_items` containing price ID
  2. Redirect customer to `session.url`
  3. Stripe handles payment collection and redirects to success/cancel URLs
  4. Webhook receives `checkout.session.completed` event
  5. Write payment record to Supabase `payments` table
- **Key Parameters**:
  - `success_url`: Redirect after successful payment
  - `cancel_url`: Redirect if customer cancels
  - `customer_email`: Pre-fill customer email
  - `payment_intent_data`: Attach metadata for tracking
- **Webhook Event**: `checkout.session.completed` → verify session, create payment record

#### Retainers (Subscriptions)

- **API**: Stripe Checkout Sessions API with `mode: "subscription"`
- **Flow**:
  1. Create Checkout Session with subscription `line_items`
  2. Redirect customer to `session.url`
  3. Stripe collects payment method and creates subscription
  4. Webhook receives `customer.subscription.created` and `invoice.payment_succeeded`
  5. Write subscription record to Supabase, track hours separately
- **Key Parameters**:
  - `subscription_data.metadata`: Store service tier (10/20/40 hrs)
  - `subscription_data.trial_period_days`: Optional trial period
  - `allow_promotion_codes`: Enable coupon redemption
- **Webhook Events**:
  - `customer.subscription.created` → create subscription record
  - `invoice.payment_succeeded` → update payment status
  - `customer.subscription.deleted` → mark subscription as cancelled

#### Invoicing

- **API**: Stripe Invoicing API
- **Flow**:
  1. Admin creates invoice via server action
  2. Call `stripe.invoices.create()` with customer ID and line items
  3. Call `stripe.invoices.sendInvoice()` to send to customer
  4. Webhook receives `invoice.created`, `invoice.payment_succeeded`, `invoice.payment_failed`
  5. Update payment status in Supabase
- **Key Parameters**:
  - `customer`: Stripe Customer ID
  - `line_items`: Array of invoice items with price/amount
  - `due_date`: Unix timestamp for payment due date
  - `metadata`: Track related service/project
- **Webhook Events**:
  - `invoice.created` → create payment record with status "draft"
  - `invoice.payment_succeeded` → update status to "paid"
  - `invoice.payment_failed` → update status to "failed", send notification

### Resend Email Templates (NOT YET IMPLEMENTED)

**Note:** Email notifications are planned but not yet implemented. Resend SDK is installed but not integrated with payment webhooks.

**Planned Templates:**

- **Payment receipt**: To be sent after `checkout.session.completed`
  - Include: amount, service, transaction ID, date
- **Subscription confirmation**: To be sent after `customer.subscription.created`
  - Include: plan details, billing cycle, next billing date
- **Invoice issued**: To be sent after `invoice.created`
  - Include: invoice link, due date, amount
- **Invoice paid**: To be sent after `invoice.payment_succeeded`
  - Include: confirmation, transaction details
- **Payment failed**: To be sent after `invoice.payment_failed` or payment error
  - Include: retry link, support contact

## Security Considerations

### Stripe Webhook Verification

```javascript
// Verify webhook signature before processing
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### API Key Management

- Store `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in environment variables
- Never expose secret key in client-side code
- Use publishable key only for client-side Stripe.js initialization
- Rotate webhook signing secret if compromised

### RLS Policies

- `services`: Public read access for active services only

```sql
CREATE POLICY "public_read_active_services" ON services
  FOR SELECT USING (is_active = true);
```

- `payments`: Users can read only their own payments; admins can read all

```sql
CREATE POLICY "users_read_own_payments" ON payments
  FOR SELECT USING (auth.uid() = client_id OR auth.jwt() ->> 'role' = 'admin');
```

### Rate Limiting

- Implement rate limiting on checkout endpoints (e.g., 5 requests per minute per IP)
- Use middleware like `express-rate-limit` or Vercel's built-in rate limiting
- Prevent abuse of payment creation endpoints

### Data Validation

- Validate all user inputs before creating Stripe objects
- Verify amount matches expected service price
- Validate email format before passing to Stripe
- Sanitize metadata to prevent injection attacks

## Testing Requirements

### Unit Tests

- **Server Actions**: Test checkout session creation with various inputs
  - Valid service ID and amount
  - Missing or invalid parameters
  - Database write operations
- **Webhook Handlers**: Test event processing
  - Valid webhook signature verification
  - Payment record creation
  - Email sending triggers
  - Error handling for malformed events

### E2E Tests

- **Deposit Flow**:
  1. Navigate to service page
  2. Click "Pay Deposit"
  3. Complete Stripe Checkout
  4. Verify success page and payment record in database
- **Subscription Flow**:
  1. Navigate to retainer page
  2. Select plan tier
  3. Complete Stripe Checkout
  4. Verify subscription created in Stripe and Supabase
- **Invoice Flow**:
  1. Admin creates invoice
  2. Customer receives email
  3. Customer clicks link and pays
  4. Verify payment status updated

### Webhook Event Tests

- Use Stripe CLI to trigger test events: `stripe trigger checkout.session.completed`
- Verify payment records created correctly
- Verify emails sent with correct content
- Test error scenarios (network failures, duplicate events)

### Payment Failure Scenarios

- Test with declined card (use `4000000000000002`)
- Test with expired card (use `4000002500003155`)
- Test with insufficient funds
- Verify error messages displayed to user
- Verify retry mechanisms work

### Test Data

- Use Stripe test mode with test card numbers
- Create test customers and subscriptions
- Seed test services in database
- Use test email addresses for email verification

## Implementation Patterns

### Server Action for Checkout Session Creation

```typescript
// app/actions/checkout.ts
'use server';

import Stripe from 'stripe';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(
  serviceId: string,
  type: 'deposit' | 'retainer',
  userEmail: string
) {
  // Validate inputs
  if (!serviceId || !userEmail) {
    throw new Error('Missing required fields');
  }

  // Fetch service from database
  const service = await getService(serviceId);
  if (!service) {
    throw new Error('Service not found');
  }

  // Create Stripe customer if needed
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { userId: getCurrentUserId() }
  });

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: type === 'deposit' ? 'payment' : 'subscription',
    line_items: [{
      price: service.stripePriceId,
      quantity: 1
    }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
    metadata: {
      serviceId,
      type,
      userId: getCurrentUserId()
    }
  });

  redirect(session.url!);
}
```

### Webhook Handler Pattern

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Create payment record in Supabase
  const { data, error } = await supabase
    .from('payments')
    .insert({
      client_id: session.metadata?.userId,
      intent_id: session.payment_intent,
      type: session.metadata?.type,
      amount_cents: session.amount_total,
      currency: session.currency,
      status: 'completed',
      related_service: session.metadata?.serviceId,
      metadata: {
        session_id: session.id,
        customer_email: session.customer_email,
      }
    });

  if (error) throw error;

  // TODO: Send receipt email (not yet implemented)
  // await sendReceiptEmail(session.customer_email, session);
}
```

### Database Queries for Payment Tracking

```sql
-- Get all payments for a user
SELECT * FROM payments
WHERE client_id = $1
ORDER BY created_at DESC;

-- Get subscription status
SELECT s.*, p.status
FROM payments p
JOIN services s ON p.related_service = s.id
WHERE p.type = 'retainer' AND p.client_id = $1;

-- Get unpaid invoices
SELECT * FROM payments
WHERE type = 'invoice' AND status = 'draft'
ORDER BY created_at DESC;

-- Track revenue by service
SELECT related_service, SUM(amount_cents) as total_revenue, COUNT(*) as transaction_count
FROM payments
WHERE status = 'completed' AND created_at > NOW() - INTERVAL '30 days'
GROUP BY related_service;
```

### Environment Variables Required

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URLs
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email Service
RESEND_API_KEY=re_...
```

## Implementation Status

### ✅ Completed (Phases 1-3)

**Files Created:**

- `docs/database/05-services-payments-schema.sql` - Database schema
- `lib/supabase.ts` - Supabase helper functions (added)
- `app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `app/actions/checkout.ts` - Checkout server actions
- `app/services/page.tsx` - Service listing page
- `app/services/[slug]/page.tsx` - Service detail page
- `components/ServiceCheckoutButtons.tsx` - Checkout UI component
- `app/checkout/success/page.tsx` - Success page
- `app/checkout/cancel/page.tsx` - Cancel page
- `scripts/seed-services.ts` - Test data seeding script

**Documentation Created:**

- `docs/features/02-services-checkout/SETUP_GUIDE.md` - Setup instructions
- `docs/features/02-services-checkout/STRIPE_CLI_TESTING.md` - Testing guide
- `docs/features/02-services-checkout/IMPLEMENTATION_CHECKLIST.md` - Checklist

**Features Implemented:**

- ✅ Stripe SDK integration
- ✅ Database schema with RLS policies
- ✅ Service pages with pricing
- ✅ Deposit checkout flow (complete)
- ✅ Subscription checkout flow (backend complete)
- ✅ Webhook event handling (6 event types)
- ✅ Payment record creation
- ✅ Checkout success/cancel pages

### 🔄 Partially Complete (Backend Ready, UI Not Built)

- **Phase 4 (Retainers)**: Webhook handlers and server actions complete, subscription management UI not started
- **Phase 5 (Invoicing)**: Webhook handlers complete, admin invoice creation UI not started

### ⬜ Not Started

- **Email notifications** (Resend SDK installed but not integrated with payment webhooks)
- Subscription management UI (cancel/pause/update payment method)
- Admin invoice creation UI
- Client invoice viewing pages
- Payment dashboard
- Refund functionality
- Payment analytics
- Rate limiting

## Next Steps

1. **Set up Stripe Account**
   - Create account at <https://stripe.com>
   - Get API keys from dashboard
   - Create test products and prices

2. **Configure Environment**
   - Add Stripe keys to `.env.local`
   - Add Supabase service role key
   - Set `NEXT_PUBLIC_URL`

3. **Create Database Tables**
   - Run SQL schema in Supabase SQL Editor
   - Verify tables and RLS policies

4. **Seed Test Data**
   - Run `npx ts-node scripts/seed-services.ts`
   - Verify services in Supabase

5. **Test with Stripe CLI**
   - Install Stripe CLI
   - Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Test checkout flow with test cards

6. **Implement Email Notifications**
   - Install Resend SDK
   - Create email templates
   - Send receipts on payment

## Milestone

### M2 – Payments & Booking (1–2 wks)

- ✅ Deposits (Stripe checkout + webhooks complete)
- 🔄 Retainers (backend complete, UI not started)
- 🔄 Invoicing (webhook handlers complete, admin UI not started)
- ✅ Booking integration (complete - see Cal.com feature docs)
