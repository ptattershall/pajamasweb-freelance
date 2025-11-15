# Phase 4: Client-Specific Tools - Setup Instructions

## Prerequisites

- ✅ Phase 1-3 completed
- ✅ Supabase project set up
- ✅ Database tables created (payments, bookings, deliverables)
- ✅ Environment variables configured

## Step 1: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Payments table (if not already created)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  intent_id TEXT,
  type TEXT CHECK (type IN ('deposit', 'retainer', 'invoice')) NOT NULL,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT,
  related_service UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (if not already created)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  external_id TEXT UNIQUE,
  provider TEXT NOT NULL DEFAULT 'calcom',
  attendee_email TEXT NOT NULL,
  attendee_name TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_provider CHECK (provider IN ('calcom', 'gcal')),
  CONSTRAINT valid_status CHECK (status IN ('confirmed', 'cancelled', 'rescheduled'))
);

-- Deliverables table (if not already created)
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  delivered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## Step 2: Enable Row Level Security

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = client_id);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id);

-- Enable RLS on deliverables
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deliverables"
  ON public.deliverables FOR SELECT
  USING (auth.uid() = client_id);
```

## Step 3: Verify Files Created

Check that these files exist:

```
lib/
├── client-service.ts
└── tools/
    ├── invoice-status.ts
    ├── booking-status.ts
    └── deliverables.ts

app/api/
└── chat/
    └── route.ts (updated)

scripts/
└── test-client-tools-unit.ts
```

## Step 4: Run Tests

```bash
npx tsx scripts/test-client-tools-unit.ts
```

Expected output:
```
✅ Passed: 5/5
📝 Format Functions: Working
🔧 Tool Responses: Simulated Successfully
✔️  Zod Schemas: Validated

✨ All unit tests passed!
```

## Step 5: Test in Development

1. Start the dev server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/chat`

3. Test client tools (requires authentication):
```
User: "What's my invoice status?"
AI: Calls invoiceStatusTool and returns summary

User: "When is my next meeting?"
AI: Calls bookingStatusTool and returns upcoming bookings

User: "What deliverables have I received?"
AI: Calls deliverablesTool and returns project files
```

## Step 6: Add Test Data (Optional)

To test with real data, insert test records:

```sql
-- Insert test payment
INSERT INTO public.payments (
  client_id, intent_id, type, amount_cents, currency, status
) VALUES (
  'YOUR_USER_ID', 'pi_test_123', 'invoice', 50000, 'usd', 'succeeded'
);

-- Insert test booking
INSERT INTO public.bookings (
  client_id, title, starts_at, ends_at, external_id, 
  provider, attendee_email, status
) VALUES (
  'YOUR_USER_ID', 'Project Kickoff', 
  NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 1 hour',
  'cal_test_123', 'calcom', 'client@example.com', 'confirmed'
);

-- Insert test deliverable
INSERT INTO public.deliverables (
  client_id, project_id, title, file_url
) VALUES (
  'YOUR_USER_ID', 'proj_123', 'Website Design Files',
  'https://storage.example.com/files/design.zip'
);
```

## Step 7: Deploy

1. Commit changes:
```bash
git add .
git commit -m "Phase 4: Client-specific tools"
```

2. Push to production:
```bash
git push origin main
```

3. Deploy to Vercel:
```bash
npm run build
npm run start
```

## Troubleshooting

### "User authentication required" error
- Ensure user is logged in
- Check that auth.uid() is available in RLS policies

### "Failed to retrieve invoice information" error
- Verify payments table exists
- Check RLS policies are enabled
- Ensure client_id matches auth.uid()

### Tools not appearing in chat
- Verify chat API imports are correct
- Check that tools are added to streamText configuration
- Restart dev server

## Verification Checklist

- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] Files created and imported
- [ ] Tests passing (5/5)
- [ ] Chat API updated
- [ ] Local testing successful
- [ ] Deployed to production

## Next Steps

Phase 5: Chat UI Polish
- Add chat history persistence
- Implement message threading
- Add feedback mechanisms
- Improve accessibility
- Mobile optimization

---

**Estimated Setup Time:** 15-20 minutes  
**Difficulty:** Medium  
**Support:** Check Phase 4 Implementation Guide

