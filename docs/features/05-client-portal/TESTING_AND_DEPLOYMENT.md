# Client Portal - Testing & Deployment Guide

This guide walks you through testing the authentication flows and deploying the Client Portal to production.

## Prerequisites

Before you begin, ensure you have:

- ✅ Supabase project created
- ✅ Environment variables configured (see below)
- ✅ All code changes from the security update deployed

## Step 1: Environment Variables

Create or update your `.env.local` file with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production URL when deploying

# Stripe (if using invoice features)
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

**Where to find these values:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Step 2: Run Database Migrations

You have **6 migration files** that need to be run in order:

### Option A: Manual Migration (Recommended)

1. Open [Supabase SQL Editor](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Run each migration file in this order:

```
scripts/migrations/001_create_bookings_table.sql
scripts/migrations/002_client_portal_phase1.sql
scripts/migrations/003_client_portal_phase3_invoices.sql
scripts/migrations/004_client_portal_phase4_bookings.sql
scripts/migrations/005_client_portal_phase5_deliverables.sql
scripts/migrations/006_client_portal_phase6_milestones.sql
scripts/migrations/007_client_portal_avatar_storage.sql (optional - for avatar uploads)
```

For each file:
- Open the file in your editor
- Copy all SQL code
- Paste into Supabase SQL Editor
- Click **Run**
- Verify no errors

### Option B: Automated Migration Script

Run the migration script from your terminal:

```bash
# Make sure you have environment variables set
npm run migrate
```

### Verify Migrations

After running migrations, verify tables exist:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles',
  'invoices',
  'bookings',
  'contracts',
  'deliverables',
  'project_milestones'
);
```

You should see all 6 tables listed.

## Step 3: Create Test User Accounts

### Create Owner Account (Admin)

1. Go to your app: `http://localhost:3000/portal/signup`
2. Sign up with:
   - Email: `owner@yourcompany.com`
   - Password: (choose a secure password)
3. Verify email (check your inbox)
4. Update role to OWNER in Supabase:

```sql
-- Run in Supabase SQL Editor
UPDATE profiles
SET role = 'OWNER'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'owner@yourcompany.com'
);
```

### Create Client Account (Test Client)

1. Go to: `http://localhost:3000/portal/signup`
2. Sign up with:
   - Email: `client@test.com`
   - Password: (choose a password)
3. Verify email
4. Role will be 'CLIENT' by default

## Step 4: Test Authentication Flows

### Test 1: Sign Up Flow ✅

1. Navigate to `/portal/signup`
2. Fill in the form with a new email
3. Submit the form
4. **Expected:** Redirect to email verification page
5. Check email inbox for verification link
6. Click verification link
7. **Expected:** Redirect to portal dashboard

### Test 2: Sign In Flow ✅

1. Navigate to `/portal/signin`
2. Enter credentials for existing user
3. Submit the form
4. **Expected:** Redirect to `/portal` (dashboard)
5. **Expected:** See dashboard with user's name in header

### Test 3: Session Protection ✅

1. While signed out, try to access: `http://localhost:3000/portal`

## Step 5: Test API Routes with Real Data

### Test Dashboard Statistics

1. Sign in as a client user
2. Open browser DevTools → Network tab
3. Navigate to `/portal`
4. Find the request to `/api/portal/dashboard`
5. **Expected Response:**

```json
{
  "invoices_due": 0,
  "upcoming_meetings": 0,
  "pending_deliverables": 0,
  "active_milestones": 0
}
```

### Add Test Data

To see real statistics, add some test data:

```sql
-- Run in Supabase SQL Editor
-- Replace 'YOUR_CLIENT_USER_ID' with actual user ID from auth.users

-- Add test invoice
INSERT INTO invoices (client_id, stripe_invoice_id, amount_cents, currency, status, description, due_date)
VALUES (
  'YOUR_CLIENT_USER_ID',
  'test_inv_123',
  5000,
  'USD',
  'open',
  'Test Invoice',
  NOW() + INTERVAL '7 days'
);

-- Add test booking
INSERT INTO bookings (client_id, title, description, starts_at, ends_at, attendee_email, status)
VALUES (
  'YOUR_CLIENT_USER_ID',
  'Test Meeting',
  'Initial consultation',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
  'client@test.com',
  'confirmed'
);

-- Add test milestone
INSERT INTO project_milestones (client_id, title, description, status, progress_percent, due_date)
VALUES (
  'YOUR_CLIENT_USER_ID',
  'Project Kickoff',
  'Initial project setup and planning',
  'in_progress',
  50,
  NOW() + INTERVAL '14 days'
);
```

After adding test data, refresh the dashboard and verify the statistics update.

### Test All Portal Pages

Visit each page and verify it loads without errors:

- ✅ `/portal` - Dashboard
- ✅ `/portal/invoices` - Invoice list
- ✅ `/portal/bookings` - Bookings list
- ✅ `/portal/contracts` - Contracts list
- ✅ `/portal/deliverables` - Deliverables list
- ✅ `/portal/milestones` - Milestones list
- ✅ `/portal/chat-history` - Chat history
- ✅ `/portal/profile` - User profile

## Step 6: Security Testing

### Test API Authentication

Use curl or Postman to test API security:

```bash
# Test without authentication - should return 401
curl http://localhost:3000/api/portal/dashboard

# Expected response:
# {"error":"Unauthorized"}
```

### Test with Valid Session

1. Sign in to portal in browser
2. Open DevTools → Application → Cookies
3. Copy the `auth-token` cookie value
4. Test API with cookie:

```bash
curl http://localhost:3000/api/portal/dashboard \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE"

# Expected: Valid response with statistics
```

### Test Middleware Protection

Try accessing protected routes without authentication:

```bash
# Should redirect to signin
curl -I http://localhost:3000/portal

# Expected: 307 redirect to /portal/signin
```

## Step 7: Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations run successfully in production Supabase
- [ ] Environment variables configured in production
- [ ] Test user accounts created and verified
- [ ] All authentication flows tested locally
- [ ] API routes tested with real data
- [ ] Security testing completed

### Deploy to Vercel (Recommended)

1. **Push code to GitHub:**

```bash
git add .
git commit -m "Client portal security updates - production ready"
git push origin main
```

2. **Configure Vercel:**

   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_APP_URL` (your production URL)
     - `STRIPE_SECRET_KEY` (if using Stripe)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using Stripe)

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Test production URL

### Post-Deployment Verification

1. **Test Authentication:**
   - Sign up with a new account
   - Verify email works
   - Sign in and access dashboard
   - Test logout

2. **Test API Routes:**
   - Verify dashboard loads with real data
   - Check all portal pages load correctly
   - Test that unauthenticated access is blocked

3. **Monitor Logs:**
   - Check Vercel logs for errors
   - Monitor Supabase logs for database issues
   - Set up error tracking (Sentry recommended)

## Troubleshooting

### Issue: "Unauthorized" on all API routes

**Solution:**
- Verify `auth-token` cookie is being set on signin
- Check middleware is properly configured
- Verify Supabase environment variables are correct

### Issue: Redirect loop on signin

**Solution:**
- Check middleware matcher in `middleware.ts`
- Verify `/portal/signin` is in public routes list
- Clear browser cookies and try again

### Issue: Dashboard shows 0 for all statistics

**Solution:**
- Verify user is signed in
- Check that test data exists for the signed-in user
- Verify RLS policies allow user to read their own data
- Check browser console for API errors

### Issue: Email verification not working

**Solution:**
- Check Supabase email settings
- Verify SMTP configuration in Supabase
- Check spam folder
- Use Supabase dashboard to manually verify user

## Next Steps

After successful deployment:

1. **Create real client accounts** for your actual clients
2. **Import existing data** (invoices, bookings, etc.)
3. **Set up Stripe integration** for invoice payments
4. **Configure Supabase Storage** for file uploads (contracts, deliverables)
5. **Add monitoring** and error tracking
6. **Gather user feedback** and iterate

## Support

For issues or questions:
- Check [CLIENT_PORTAL_FEATURE.md](./CLIENT_PORTAL_FEATURE.md) for feature documentation
- Review [MIGRATION_GUIDE.md](../../MIGRATION_GUIDE.md) for database setup
- Check Supabase logs for database errors
- Review Vercel logs for deployment issues


