# Services & Checkout Implementation Checklist

## ✅ Phase 1: Setup & Database (COMPLETE)

- [x] Install Stripe SDK (`npm install stripe`)
- [x] Create database schema file (`docs/database/05-services-payments-schema.sql`)
- [x] Add Supabase helper functions (`lib/supabase.ts`)
- [x] Create Stripe webhook handler (`app/api/webhooks/stripe/route.ts`)
- [x] Create checkout server actions (`app/actions/checkout.ts`)

## ✅ Phase 2: Service Pages (COMPLETE)

- [x] Create service listing page (`app/services/page.tsx`)
- [x] Create service detail page (`app/services/[slug]/page.tsx`)
- [x] Create checkout buttons component (`components/ServiceCheckoutButtons.tsx`)
- [x] Create checkout success page (`app/checkout/success/page.tsx`)
- [x] Create checkout cancel page (`app/checkout/cancel/page.tsx`)
- [x] Create seed script (`scripts/seed-services.ts`)

## 🔄 Phase 3: Testing & Stripe CLI (IN PROGRESS)

### Database Setup
- [ ] Run SQL schema in Supabase SQL Editor
- [ ] Verify tables created in Supabase
- [ ] Verify RLS policies enabled

### Environment Variables
- [ ] Add `STRIPE_SECRET_KEY` to `.env.local`
- [ ] Add `STRIPE_PUBLISHABLE_KEY` to `.env.local`
- [ ] Add `STRIPE_WEBHOOK_SECRET` to `.env.local`
- [ ] Add `NEXT_PUBLIC_URL` to `.env.local`
- [ ] Add `SUPABASE_SERVICE_ROLE_SECRET_KEY` to `.env.local`

### Stripe Setup
- [ ] Create Stripe account (https://stripe.com)
- [ ] Get API keys from Stripe Dashboard
- [ ] Create test products in Stripe
- [ ] Create test prices in Stripe
- [ ] Copy price IDs to services table

### Stripe CLI Setup
- [ ] Install Stripe CLI
- [ ] Run `stripe login`
- [ ] Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Copy webhook secret to `.env.local`

### Seed Test Data
- [ ] Run `npx ts-node scripts/seed-services.ts`
- [ ] Verify services appear in Supabase
- [ ] Verify services visible on `/services` page

### Manual Testing
- [ ] Visit `/services` page
- [ ] Click on a service
- [ ] Click "Pay Deposit"
- [ ] Enter test email
- [ ] Complete Stripe Checkout with test card
- [ ] Verify success page displays
- [ ] Verify payment record created in Supabase
- [ ] Verify webhook event received in Stripe CLI

### Subscription Testing
- [ ] Click "Subscribe to Retainer"
- [ ] Complete Stripe Checkout
- [ ] Verify subscription created in Stripe
- [ ] Verify payment record created in Supabase

### Error Testing
- [ ] Test with declined card (`4000 0000 0000 0002`)
- [ ] Test with expired card (`4000 0025 0000 3155`)
- [ ] Verify error messages display
- [ ] Verify payment not created on failure

## 📋 Phase 4: Email Notifications (TODO)

- [ ] Install Resend SDK
- [ ] Create email templates
- [ ] Implement receipt email on payment
- [ ] Implement subscription confirmation email
- [ ] Implement invoice notification email
- [ ] Test email delivery

## 📋 Phase 5: Subscription Management (TODO)

- [ ] Create subscription management page
- [ ] Implement pause subscription
- [ ] Implement cancel subscription
- [ ] Implement update payment method
- [ ] Create subscription history view

## 📋 Phase 6: Invoice Management (TODO)

- [ ] Create invoice creation form
- [ ] Implement invoice sending
- [ ] Create invoice viewing page
- [ ] Implement invoice payment
- [ ] Create invoice history

## 📋 Phase 7: Payment Dashboard (TODO)

- [ ] Create admin payment dashboard
- [ ] Add payment filters
- [ ] Add payment analytics
- [ ] Implement refund functionality
- [ ] Add export to CSV

## 🚀 Deployment Checklist

- [ ] Update Stripe webhook endpoint to production URL
- [ ] Set production Stripe API keys
- [ ] Update `NEXT_PUBLIC_URL` to production domain
- [ ] Test payment flow in production
- [ ] Monitor webhook events
- [ ] Set up error alerting
- [ ] Document runbook for issues

## 📚 Documentation

- [x] Create setup guide (`SETUP_GUIDE.md`)
- [x] Create Stripe CLI testing guide (`STRIPE_CLI_TESTING.md`)
- [x] Create implementation checklist (this file)
- [ ] Create troubleshooting guide
- [ ] Create API documentation
- [ ] Create user guide for admin

## 🐛 Known Issues & TODOs

- [ ] Email notifications not yet implemented
- [ ] Subscription management UI not yet built
- [ ] Invoice creation not yet implemented
- [ ] Payment dashboard not yet built
- [ ] Rate limiting not yet implemented
- [ ] Refund functionality not yet implemented

