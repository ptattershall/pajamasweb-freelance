# Stripe CLI Testing Guide

## Installation

### macOS (Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

### Windows (Chocolatey)
```bash
choco install stripe-cli
```

### Linux
```bash
curl https://files.stripe.com/stripe-cli/releases/latest/linux/x86_64/stripe_linux_x86_64.tar.gz -o stripe_linux_x86_64.tar.gz
tar -zxvf stripe_linux_x86_64.tar.gz
```

## Setup

### 1. Authenticate with Stripe

```bash
stripe login
```

This opens a browser to authenticate. Approve the request.

### 2. Start Webhook Forwarding

In a separate terminal, run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is: whsec_test_...
```

Copy this secret to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

## Testing Webhook Events

### Test Checkout Session Completed

```bash
stripe trigger checkout.session.completed
```

This simulates a successful payment. Check:
- Stripe CLI output shows the event
- Supabase: new payment record created
- Payment status should be "completed"

### Test Subscription Created

```bash
stripe trigger customer.subscription.created
```

Check:
- Supabase: new payment record with type "retainer"
- Payment status should be "active"

### Test Subscription Updated

```bash
stripe trigger customer.subscription.updated
```

### Test Subscription Deleted

```bash
stripe trigger customer.subscription.deleted
```

Check:
- Supabase: payment status updated to "cancelled"

### Test Invoice Payment Succeeded

```bash
stripe trigger invoice.payment_succeeded
```

Check:
- Supabase: payment status updated to "paid"

### Test Invoice Payment Failed

```bash
stripe trigger invoice.payment_failed
```

Check:
- Supabase: payment status updated to "failed"

## Testing with Real Checkout

### 1. Start Webhook Listener

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Go to Services Page

Visit `http://localhost:3000/services`

### 4. Complete a Payment

1. Click on a service
2. Click "Pay Deposit"
3. Enter email
4. Click "Pay Deposit"
5. Use test card: `4242 4242 4242 4242`
6. Any future expiry and CVC
7. Complete payment

### 5. Verify in Stripe CLI

You should see:
```
2024-11-13 10:30:45   checkout.session.completed   [evt_test_...]
```

### 6. Verify in Supabase

Check the `payments` table:
- New record created
- Status: "completed"
- Amount matches
- Metadata contains session info

## Test Card Numbers

### Successful Payments
- `4242 4242 4242 4242` - Visa (always succeeds)
- `5555 5555 5555 4444` - Mastercard
- `3782 822463 10005` - American Express

### Failed Payments
- `4000 0000 0000 0002` - Card declined
- `4000 0025 0000 3155` - Expired card
- `4000 0000 0000 9995` - Insufficient funds

### Special Cases
- `4000 0000 0000 0077` - Requires authentication
- `4000 0000 0000 0341` - Requires authentication

## Debugging

### View Webhook Events

```bash
stripe logs tail
```

Shows real-time logs of all events.

### View Specific Event

```bash
stripe events retrieve evt_test_...
```

### Resend Event

```bash
stripe events resend evt_test_...
```

### View Webhook Endpoint Status

```bash
stripe webhooks endpoints list
```

## Common Issues

### Webhook Not Triggering

1. Verify `stripe listen` is running
2. Check webhook secret in `.env.local`
3. Verify endpoint URL is correct
4. Check firewall isn't blocking localhost

### Event Not Processing

1. Check webhook handler logs
2. Verify Supabase credentials
3. Check RLS policies allow inserts
4. Verify database tables exist

### Payment Not Creating Record

1. Check webhook handler is being called
2. Verify metadata is being passed correctly
3. Check Supabase insert permissions
4. Look for errors in application logs

## Next Steps

- Test all payment scenarios
- Verify email notifications work
- Test subscription management
- Test invoice creation
- Load test with multiple events

