# Client Portal - Quick Start Guide

Get the Client Portal up and running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account ([sign up free](https://supabase.com))
- Code editor (VS Code recommended)

## Step 1: Environment Setup (2 minutes)

1. **Copy environment template:**

```bash
cp .env.example .env.local
```

2. **Get Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project (or select existing)
   - Go to **Settings** → **API**
   - Copy these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Install Dependencies (1 minute)

```bash
npm install
```

## Step 3: Run Database Migrations (5 minutes)

### Option A: Manual (Recommended)

1. Open [Supabase SQL Editor](https://app.supabase.com)
2. Click **SQL Editor** → **New Query**
3. Copy and run each file in order:

```
scripts/migrations/001_create_bookings_table.sql
scripts/migrations/002_client_portal_phase1.sql
scripts/migrations/003_client_portal_phase3_invoices.sql
scripts/migrations/004_client_portal_phase4_bookings.sql
scripts/migrations/005_client_portal_phase5_deliverables.sql
scripts/migrations/006_client_portal_phase6_milestones.sql
```

### Option B: Automated

```bash
npm run migrate
```

### Verify Migrations

Run this in Supabase SQL Editor:

```bash
# Or use the verification script
# Copy scripts/verify-migrations.sql into Supabase SQL Editor
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Create Test Accounts (3 minutes)

### Create Owner Account

1. Go to [http://localhost:3000/portal/signup](http://localhost:3000/portal/signup)
2. Sign up with your email
3. Check email for verification link
4. Click verification link
5. Update role in Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'OWNER' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### Create Client Account

1. Go to [http://localhost:3000/portal/signup](http://localhost:3000/portal/signup)
2. Sign up with different email
3. Verify email
4. Role will be 'CLIENT' by default

## Step 6: Test Authentication (3 minutes)

### Test the flows:

1. **Sign In:** [http://localhost:3000/portal/signin](http://localhost:3000/portal/signin)
2. **Dashboard:** Should redirect to `/portal` after signin
3. **Logout:** Click "Sign Out" button
4. **Protected Routes:** Try accessing `/portal` while logged out (should redirect to signin)

### Run automated tests:

```bash
npm run test:auth
```

Expected output:
```
✅ Successfully connected to Supabase
✅ All tables exist and are accessible
✅ RLS is properly configured
✅ Signup successful
```

## Step 7: Add Test Data (Optional)

To see real statistics on the dashboard, add test data:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Add test invoice (replace USER_ID)
INSERT INTO invoices (client_id, stripe_invoice_id, amount_cents, currency, status, description, due_date)
VALUES (
  'USER_ID',
  'test_inv_123',
  5000,
  'USD',
  'open',
  'Test Invoice',
  NOW() + INTERVAL '7 days'
);

-- Add test booking
INSERT INTO bookings (client_id, title, starts_at, ends_at, attendee_email, status)
VALUES (
  'USER_ID',
  'Test Meeting',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
  'your-email@example.com',
  'confirmed'
);

-- Add test milestone
INSERT INTO project_milestones (client_id, title, status, progress_percent, due_date)
VALUES (
  'USER_ID',
  'Project Kickoff',
  'in_progress',
  50,
  NOW() + INTERVAL '14 days'
);
```

Refresh the dashboard to see updated statistics!

## ✅ You're Done!

The Client Portal is now running with:
- ✅ Secure authentication
- ✅ Session management
- ✅ Protected routes
- ✅ Real-time dashboard
- ✅ All portal pages functional

## Next Steps

- 📖 Read [TESTING_AND_DEPLOYMENT.md](./TESTING_AND_DEPLOYMENT.md) for production deployment
- 📖 Read [CLIENT_PORTAL_FEATURE.md](./CLIENT_PORTAL_FEATURE.md) for full feature documentation
- 🔧 Set up Stripe integration for invoices
- 📁 Configure Supabase Storage for file uploads
- 🚀 Deploy to production

## Troubleshooting

**Issue: Can't connect to Supabase**
- Verify environment variables are correct
- Check Supabase project is active
- Ensure `.env.local` file exists

**Issue: Tables not found**
- Run migrations in Supabase SQL Editor
- Verify migrations completed without errors
- Run `scripts/verify-migrations.sql`

**Issue: Authentication not working**
- Clear browser cookies
- Check Supabase email settings
- Verify email confirmation

For more help, see [TESTING_AND_DEPLOYMENT.md](./TESTING_AND_DEPLOYMENT.md)

