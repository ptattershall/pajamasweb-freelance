# Services & Checkout Setup Guide

Complete step-by-step guide to set up the Services & Checkout feature.

**Estimated Time:** 1 hour
**Prerequisites:** Stripe account, Supabase project, Node.js installed

## 📋 Setup Checklist

Use this checklist to track your progress:

- [ ] Phase 1: Stripe Account Setup (15 min)
- [ ] Phase 2: Environment Variables (5 min)
- [ ] Phase 3: Database Setup (5 min)
- [ ] Phase 4: Seed Test Data (2 min)
- [ ] Phase 5: Stripe CLI Setup (10 min)
- [ ] Phase 6: Local Testing (30 min)
- [ ] Phase 7: Production Deployment (optional)

---

## Phase 1: Stripe Account Setup (15 min)

### Step 1: Create or Sign In to Stripe

1. Go to https://stripe.com
2. Create account or sign in
3. Switch to **Test Mode** (toggle in top right)

### Step 2: Get API Keys

1. Go to **Dashboard → Developers → API Keys**
2. Copy **Secret Key** (starts with `sk_test_`)
3. Copy **Publishable Key** (starts with `pk_test_`)
4. Save these for the next phase

### Step 3: Create Webhook Endpoint (for later)

We'll set this up in Phase 5 with Stripe CLI.

---

## Phase 2: Environment Variables (5 min)

### Step 1: Create `.env.local` File

In your project root, create or update `.env.local`:

```bash
# Stripe API Keys (from Phase 1)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (will add in Phase 5)
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URL
NEXT_PUBLIC_URL=http://localhost:3000

# Supabase Service Role Key (from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_SECRET_KEY=...
```

### Step 2: Get Supabase Service Role Key

1. Go to Supabase Dashboard
2. Navigate to **Settings → API**
3. Copy **service_role** key (under "Project API keys")
4. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_SECRET_KEY`

⚠️ **Important:** Never commit `.env.local` to version control!

---

## Phase 3: Database Setup (5 min)

### Step 1: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `docs/database/05-services-payments-schema.sql` in your code editor
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** to execute

This creates:
- ✅ `services` table with service metadata
- ✅ `payments` table for tracking payments
- ✅ RLS policies for security
- ✅ Indexes for performance

### Step 2: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. Verify `services` table exists
3. Verify `payments` table exists
4. Click each table → **RLS** tab → Verify policies are enabled

---

## Phase 4: Seed Test Data (2 min)

### Step 1: Run Seed Script

```bash
npx ts-node scripts/seed-services.ts
```

This creates 5 test services:
- Web Design ($2,999)
- Web Development ($4,999)
- Retainer 10hrs ($999/mo)
- Retainer 20hrs ($1,999/mo)
- Retainer 40hrs ($3,999/mo)

### Step 2: Verify Services Created

1. Go to Supabase **Table Editor**
2. Open `services` table
3. Verify 5 services are present

---

## Phase 5: Stripe CLI Setup (10 min)

### Step 1: Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
# See https://stripe.com/docs/stripe-cli#install
```

### Step 2: Authenticate Stripe CLI

```bash
stripe login
```

This opens your browser to authorize the CLI.

### Step 3: Start Webhook Forwarding

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Important:** Keep this terminal window open!

### Step 4: Copy Webhook Secret

The CLI will output something like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

1. Copy the `whsec_...` value
2. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`
3. Restart your dev server if it's running

---

## Phase 6: Local Testing (30 min)

### Step 1: Start Development Server

Open a **new terminal** (keep Stripe CLI running in the other):

```bash
npm run dev
```

### Step 2: Visit Services Page

Navigate to `http://localhost:3000/services`

You should see your 5 test services displayed in a grid.

### Step 3: Test Deposit Checkout Flow

1. Click on "Web Design" service
2. Enter email: `test@example.com`
3. Click **"Pay Deposit"** button
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Enter any future expiry date (e.g., 12/25)
7. Enter any 3-digit CVC (e.g., 123)
8. Click **"Pay"**

### Step 4: Verify Success

1. You should be redirected to `/checkout/success`
2. Check your **Stripe CLI terminal** - you should see:
   ```
   checkout.session.completed [evt_xxx]
   ```
3. Go to **Supabase Table Editor** → `payments` table
4. Verify a new payment record exists with:
   - `type`: "deposit"
   - `status`: "completed"
   - `amount_cents`: 299900

### Step 5: Test Subscription Checkout (Optional)

1. Go back to `/services`
2. Click on "Retainer 10hrs" service
3. Click **"Subscribe to Retainer"**
4. Complete checkout with test card
5. Verify subscription record in `payments` table with `type`: "retainer"

---

## Phase 7: Production Deployment (Optional)

### Step 1: Update Environment Variables

In your production environment (Vercel, Netlify, etc.):

```bash
# Use LIVE keys (not test keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Production webhook secret (from Step 2 below)
STRIPE_WEBHOOK_SECRET=whsec_...

# Production URL
NEXT_PUBLIC_URL=https://yourdomain.com

# Same Supabase key
SUPABASE_SERVICE_ROLE_SECRET_KEY=...
```

### Step 2: Create Production Webhook

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Click **"Select events"** and choose:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to production environment as `STRIPE_WEBHOOK_SECRET`

### Step 3: Create Production Stripe Products

1. Switch Stripe to **Live Mode** (toggle in top right)
2. Go to **Products** → **Add product**
3. Create products matching your services:
   - Web Design - $2,999 (one-time)
   - Web Development - $4,999 (one-time)
   - Retainer 10hrs - $999/month (recurring)
   - Retainer 20hrs - $1,999/month (recurring)
   - Retainer 40hrs - $3,999/month (recurring)
4. Copy each **Price ID** (starts with `price_`)
5. Update services in Supabase with live price IDs

### Step 4: Deploy & Test

1. Deploy your application
2. Test with real payment methods
3. Monitor Stripe Dashboard for events

---

## 🐛 Troubleshooting

### Webhook Not Triggering

**Symptoms:** Payment completes but no record in database

**Solutions:**
- ✅ Verify `stripe listen` is running (local dev)
- ✅ Check webhook secret matches in `.env.local`
- ✅ Look at Stripe CLI output for errors
- ✅ Verify webhook endpoint exists in Stripe Dashboard (production)
- ✅ Check webhook handler is at `/api/webhooks/stripe`

### Payment Record Not Creating

**Symptoms:** Webhook fires but payment not in database

**Solutions:**
- ✅ Check Supabase RLS policies are enabled
- ✅ Verify `SUPABASE_SERVICE_ROLE_SECRET_KEY` is set correctly
- ✅ Check webhook handler logs in terminal
- ✅ Verify service role key has correct permissions
- ✅ Check for errors in Supabase logs

### Checkout Redirect Failing

**Symptoms:** Clicking checkout button doesn't redirect to Stripe

**Solutions:**
- ✅ Verify `NEXT_PUBLIC_URL` is correct in `.env.local`
- ✅ Check service has `stripe_price_id` in database
- ✅ Verify Stripe price exists in Stripe Dashboard
- ✅ Check browser console for JavaScript errors
- ✅ Verify Stripe publishable key is correct

### Services Not Displaying

**Symptoms:** `/services` page is empty or shows no services

**Solutions:**
- ✅ Verify seed script ran successfully
- ✅ Check services exist in Supabase Table Editor
- ✅ Verify `is_active` is `true` for services
- ✅ Check RLS policies allow public read access
- ✅ Check browser console for errors

### "Service not found" Error

**Symptoms:** Clicking a service shows error

**Solutions:**
- ✅ Verify service slug matches URL
- ✅ Check service exists in database
- ✅ Verify `is_active` is `true`
- ✅ Check RLS policies

---

## ✅ Setup Complete!

You now have a working Stripe payment system! 🎉

### What's Working:
- ✅ Service pages with pricing
- ✅ Deposit checkout flow
- ✅ Subscription checkout flow
- ✅ Webhook event handling
- ✅ Payment tracking in database

### Next Steps:

1. **Test Thoroughly**
   - See [STRIPE_CLI_TESTING.md](./STRIPE_CLI_TESTING.md) for comprehensive testing

2. **Extend Features**
   - See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for adding:
     - Email notifications
     - Subscription management UI
     - Invoice creation
     - Payment dashboard

3. **Deploy to Production**
   - Follow Phase 7 above
   - Test with real payment methods
   - Monitor Stripe Dashboard

### Need Help?

- **Testing Issues:** [STRIPE_CLI_TESTING.md](./STRIPE_CLI_TESTING.md)
- **Development Questions:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Technical Details:** [SERVICE_CHECHOUT_FEATURE.md](./SERVICE_CHECHOUT_FEATURE.md)
- **Quick Reference:** [README.md](./README.md)

---

**Last Updated:** 2025-01-13

