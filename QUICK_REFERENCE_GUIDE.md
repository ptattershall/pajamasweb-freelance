# Quick Reference Guide - What Needs Development

## TL;DR - Current State

✅ **Client Portal** - 70% complete (core UI done, missing auth fixes, file storage, Stripe links)
⬜ **Everything Else** - 0% complete (6 major features not started)

---

## Priority Order (Recommended)

### 1. Fix Client Portal (1-2 weeks)
**Why First:** It's 70% done, just needs critical fixes to be functional

**Critical Fixes:**
- Fix authentication (proper session management)
- Implement dashboard stats queries
- Add Supabase Storage integration
- Add Stripe invoice links
- Run database migrations

**Files to Fix:**
- `app/api/portal/dashboard/route.ts` - Add real queries
- `app/api/portal/*/route.ts` - Fix auth headers
- `lib/auth-service.ts` - Add session helpers
- Create `lib/storage-service.ts` - File storage

---

### 2. Foundation & Infrastructure (2-3 weeks)
**Why Second:** Needed for all other features

**Key Tasks:**
- Verify Next.js 15 + TypeScript setup
- Configure Supabase fully
- Set up email (Resend)
- Add analytics & monitoring
- Implement security headers

---

### 3. Content Management (1-2 weeks)
**Why Third:** Needed for marketing/blog

**Key Tasks:**
- Set up Contentlayer + MDX
- Create blog/case study pages
- Add Supabase metadata sync
- Implement search
- Add vector embeddings

---

### 4. Services & Checkout (2-3 weeks)
**Why Fourth:** Revenue generation

**Key Tasks:**
- Create service catalog
- Implement Stripe deposits
- Implement Stripe subscriptions
- Build payment dashboard
- Add invoice system

---

### 5. Booking & Calendar (1-2 weeks)
**Why Fifth:** Needed for scheduling

**Key Tasks:**
- Integrate Cal.com OR Google Calendar
- Create booking management
- Add email notifications
- Implement reschedule/cancel

---

### 6. AI Chat (2-3 weeks)
**Why Sixth:** Advanced feature

**Key Tasks:**
- Set up LangChain.js
- Implement RAG with pgvector
- Create sales estimator tool
- Build chat UI
- Add safety guardrails

---

### 7. SEO & Polish (2-3 weeks)
**Why Last:** Final touches

**Key Tasks:**
- Add SEO metadata
- Optimize performance
- Ensure accessibility
- Mobile optimization
- Pre-launch QA

---

## File Structure Overview

```
app/
├── portal/                    # Client Portal (70% done)
│   ├── page.tsx              # Dashboard
│   ├── invoices/page.tsx      # Invoices
│   ├── bookings/page.tsx      # Bookings
│   ├── deliverables/page.tsx  # Deliverables
│   ├── contracts/page.tsx     # Contracts
│   ├── milestones/page.tsx    # Milestones
│   ├── chat-history/page.tsx  # Chat History
│   ├── profile/page.tsx       # Profile
│   ├── signin/page.tsx        # Sign In
│   └── signup/page.tsx        # Sign Up
├── api/portal/                # Portal APIs (70% done)
│   ├── dashboard/route.ts     # ⚠️ TODO: Add queries
│   ├── invoices/route.ts      # ⚠️ TODO: Fix auth
│   ├── bookings/route.ts      # ⚠️ TODO: Fix auth
│   └── ...
├── admin/                     # Admin CMS (not started)
├── blog/                      # Blog (not started)
├── services/                  # Services (not started)
├── book/                      # Booking (not started)
└── chat/                      # Chat (not started)

lib/
├── auth-service.ts            # Auth helpers (needs session fix)
├── invoices-service.ts        # Invoice helpers
├── storage-service.ts         # ⚠️ TODO: Create
└── ...

scripts/migrations/
├── 002_client_portal_phase1.sql
├── 003_client_portal_phase3_invoices.sql
├── 004_client_portal_phase4_bookings.sql
├── 005_client_portal_phase5_deliverables.sql
└── 006_client_portal_phase6_milestones.sql
```

---

## Key Technologies Needed

| Feature | Tech Stack |
|---------|-----------|
| Client Portal | Next.js, Supabase Auth, Tailwind |
| Content | Contentlayer, MDX, pgvector |
| Payments | Stripe API, Webhooks |
| Booking | Cal.com OR Google Calendar API |
| Chat | LangChain.js, OpenAI, pgvector |
| Email | Resend |
| Analytics | Sentry, Vercel Analytics |
| Storage | Supabase Storage |

---

## Environment Variables Needed

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# AI/Chat
OPENAI_API_KEY=

# Calendar (if using Google)
GOOGLE_CALENDAR_API_KEY=

# Analytics
SENTRY_DSN=
```

---

## Database Tables Status

| Table | Status | Notes |
|-------|--------|-------|
| profiles | ✅ Created | Migration 002 |
| invoices | ✅ Created | Migration 003 |
| bookings | ✅ Created | Migration 004 |
| deliverables | ✅ Created | Migration 005 |
| contracts | ✅ Created | Migration 005 |
| project_milestones | ✅ Created | Migration 006 |
| chat_messages | ⬜ TODO | For AI Chat feature |
| blog_posts | ⬜ TODO | For Content feature |
| case_studies | ⬜ TODO | For Content feature |
| services | ⬜ TODO | For Services feature |

---

## Testing Checklist

- [ ] Run all database migrations
- [ ] Test authentication flow
- [ ] Test portal pages load
- [ ] Test API endpoints
- [ ] Test file downloads
- [ ] Test Stripe integration
- [ ] Test email sending
- [ ] Test on mobile
- [ ] Test accessibility
- [ ] Load testing

---

## Deployment Checklist

- [ ] All env vars configured
- [ ] Database migrations applied
- [ ] Supabase Storage buckets created
- [ ] Stripe webhooks configured
- [ ] Email templates created
- [ ] Security headers set
- [ ] Rate limiting configured
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] CDN configured