# Client Portal - Completion Checklist

## Critical Issues (Must Fix First)

### 1. Authentication & Session Management
- [ ] Replace x-user-id header with proper Supabase session management
- [ ] Implement middleware to check auth on all portal routes
- [ ] Add redirect to signin for unauthenticated users
- [ ] Implement proper logout functionality
- [ ] Add session refresh logic

**Files to Update:**
- `app/api/portal/*/route.ts` (all API routes)
- `app/portal/layout.tsx` (add auth check)
- `lib/auth-service.ts` (add session helpers)

### 2. Dashboard Statistics
- [ ] Implement actual database queries in `/api/portal/dashboard/route.ts`
- [ ] Query invoices table for invoices_due count
- [ ] Query bookings table for upcoming_meetings count
- [ ] Query deliverables table for pending_deliverables count
- [ ] Query project_milestones table for active_milestones count

**File to Update:**
- `app/api/portal/dashboard/route.ts` (replace TODO with actual queries)

### 3. Database Migrations
- [ ] Run all 5 migrations in Supabase:
  - `002_client_portal_phase1.sql` (profiles)
  - `003_client_portal_phase3_invoices.sql` (invoices)
  - `004_client_portal_phase4_bookings.sql` (bookings)
  - `005_client_portal_phase5_deliverables.sql` (deliverables/contracts)
  - `006_client_portal_phase6_milestones.sql` (milestones)

---

## Phase 1: Authentication & Profile (Incomplete Items)

- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Implement avatar upload to Supabase Storage
- [ ] Add profile picture display in sidebar

**Files to Create/Update:**
- `app/portal/forgot-password/page.tsx`
- `app/api/auth/reset-password/route.ts`
- `app/api/auth/verify-email/route.ts`
- Update `app/portal/profile/page.tsx` for avatar upload

---

## Phase 3: Invoices (Incomplete Items)

- [ ] Add Stripe hosted invoice links
- [ ] Implement PDF download functionality
- [ ] Add invoice detail view page
- [ ] Implement payment reminders
- [ ] Add "Pay Now" button linking to Stripe

**Files to Create/Update:**
- `app/portal/invoices/[id]/page.tsx` (detail view)
- `app/api/portal/invoices/[id]/route.ts` (detail endpoint)
- Update `app/portal/invoices/page.tsx` (add links)

---

## Phase 4: Bookings (Incomplete Items)

- [ ] Implement reschedule functionality
- [ ] Implement cancel functionality
- [ ] Add calendar export (ICS format)
- [ ] Add meeting notes/agenda display
- [ ] Add meeting link handling

**Files to Create/Update:**
- `app/api/portal/bookings/[id]/reschedule/route.ts`
- `app/api/portal/bookings/[id]/cancel/route.ts`
- `app/api/portal/bookings/[id]/export/route.ts`

---

## Phase 5: Deliverables & Contracts (Incomplete Items)

- [ ] Integrate Supabase Storage for file uploads
- [ ] Generate signed URLs for downloads
- [ ] Implement file preview functionality
- [ ] Add admin file upload interface
- [ ] Add version history for contracts

**Files to Create/Update:**
- `lib/storage-service.ts` (new - Supabase Storage helpers)
- `app/api/portal/deliverables/[id]/download/route.ts`
- `app/api/portal/contracts/[id]/download/route.ts`
- `app/admin/files/upload/page.tsx` (new - admin upload)

---

## Phase 6: Milestones (Incomplete Items)

- [ ] Create milestone detail view page
- [ ] Build admin milestone management interface
- [ ] Add milestone update notifications
- [ ] Create project overview page

**Files to Create/Update:**
- `app/portal/milestones/[id]/page.tsx` (detail view)
- `app/admin/milestones/page.tsx` (admin management)
- `app/api/portal/milestones/[id]/route.ts`

---

## Phase 7: Chat History (Incomplete Items)

- [ ] Implement conversation threading
- [ ] Add export chat history functionality
- [ ] Create chat analytics for clients
- [ ] Link related items (invoices, bookings mentioned in chat)

**Files to Create/Update:**
- `app/portal/chat-history/[id]/page.tsx` (conversation detail)
- `app/api/portal/chat-history/[id]/export/route.ts`

---

## Testing Requirements

- [ ] E2E tests for authentication flow
- [ ] E2E tests for invoice viewing and payment
- [ ] E2E tests for booking management
- [ ] E2E tests for file downloads
- [ ] RLS policy tests
- [ ] Mobile responsiveness tests

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Supabase Storage buckets created
- [ ] Stripe API keys configured
- [ ] Email service (Resend) configured
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] Monitoring/logging configured

