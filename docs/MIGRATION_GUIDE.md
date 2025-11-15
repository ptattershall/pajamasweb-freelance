# Database Migration Guide

This guide explains how to ensure all database migrations are applied to your Supabase instance.

## Overview

Your project has 6 migration files that set up the complete database schema:

1. **001_create_bookings_table.sql** - Cal.com booking system tables
2. **002_client_portal_phase1.sql** - User profiles and authentication
3. **003_client_portal_phase3_invoices.sql** - Invoice management
4. **004_client_portal_phase4_bookings.sql** - Extended bookings with client portal
5. **005_client_portal_phase5_deliverables.sql** - Contracts and deliverables
6. **006_client_portal_phase6_milestones.sql** - Project milestones tracking

## Quick Start - Manual Migration (Recommended)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Each Migration
For each migration file in `scripts/migrations/`:

1. Open the file in your text editor
2. Copy all the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run**
5. Verify no errors appear

**Order matters!** Run them in this order:
- 001_create_bookings_table.sql
- 002_client_portal_phase1.sql
- 003_client_portal_phase3_invoices.sql
- 004_client_portal_phase4_bookings.sql
- 005_client_portal_phase5_deliverables.sql
- 006_client_portal_phase6_milestones.sql

### Step 3: Verify Tables
After running all migrations:

1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ bookings
   - ✅ booking_history
   - ✅ profiles
   - ✅ invoices
   - ✅ contracts
   - ✅ deliverables
   - ✅ project_milestones
   - ✅ milestone_updates

## Automated Migration (Optional)

If you want to run migrations programmatically:

```bash
# Using Node.js (requires pg package)
node scripts/run-all-migrations.js

# Using TypeScript
npx ts-node scripts/run-all-migrations.ts
```

**Note:** Direct PostgreSQL connections may fail due to network restrictions. Manual migration via SQL Editor is more reliable.

## Troubleshooting

### "Table already exists" errors
This is normal! The migrations use `CREATE TABLE IF NOT EXISTS`, so they're safe to run multiple times.

### "Policy already exists" errors
Same as above - RLS policies use `CREATE POLICY IF NOT EXISTS`.

### Connection timeout errors
This means the direct PostgreSQL connection is blocked. Use the manual SQL Editor method instead.

### Missing tables after running migrations
1. Check the SQL Editor for error messages
2. Verify you ran all 6 migrations in order
3. Check that no errors were silently ignored

## Verifying Your Database

### Via Supabase Dashboard
1. Go to **Table Editor**
2. Expand each table to see columns and data
3. Check **Authentication** → **Policies** to verify RLS is enabled

### Via SQL Query
Run this query in the SQL Editor to list all tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
```
bookings
booking_history
contracts
deliverables
invoices
milestone_updates
project_milestones
profiles
```

## What Each Migration Creates

### Migration 1: Bookings
- `bookings` table - Cal.com booking records
- `booking_history` table - Audit trail
- RLS policies for secure access

### Migration 2: Profiles
- `profiles` table - User profile data
- Role-based access control (OWNER/CLIENT)
- Automatic timestamp updates

### Migration 3: Invoices
- `invoices` table - Invoice records
- Stripe integration support
- Status tracking

### Migration 4: Extended Bookings
- Extends bookings with location, meeting_link, notes
- Client portal access policies

### Migration 5: Deliverables
- `contracts` table - Contract files
- `deliverables` table - Project deliverables
- File tracking and versioning

### Migration 6: Milestones
- `project_milestones` table - Project tracking
- `milestone_updates` table - Progress updates
- Status and progress tracking

## Next Steps

After migrations are complete:

1. ✅ Verify all tables exist
2. ✅ Test your application locally: `npm run dev`
3. ✅ Check that features work (bookings, portal, etc.)
4. ✅ Deploy to production

## Support

If you encounter issues:
1. Check the error message in the SQL Editor
2. Verify you're using the correct Supabase project
3. Ensure your service role key has admin permissions
4. Check that migrations are run in order

