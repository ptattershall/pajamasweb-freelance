# PJais.ai Development Roadmap

## Overview

This roadmap breaks down the PJais.ai project into 7 major features, each with detailed development phases. Features are organized by milestone and can be developed in parallel where dependencies allow.

## Project Goals

- **Primary:** 5+ qualified leads/mo, ≥30% lead→call, ≥40% call→proposal, ≥25% proposal→deposit
- **Secondary:** Avg. time-to-first-response < 2 min (AI chat), blog SEO traffic +20% MoM
- **Quality:** LCP < 2.5s, 0 P0 production errors/wk, WCAG AA

## Feature Overview

| # | Feature | Milestone | Est. Time | Status |
|---|---------|-----------|-----------|--------|
| 06 | [Foundation & Infrastructure](#06-foundation--infrastructure) | M1 | 2-3 weeks | ⬜ NOT STARTED |
| 01 | [Content Management (MDX)](#01-content-management) | M1 | 1-2 weeks | ⬜ NOT STARTED |
| 02 | [Services & Checkout](#02-services--checkout) | M2 | 2-3 weeks | ⬜ NOT STARTED |
| 03 | [Booking & Calendar](#03-booking--calendar) | M2 | 1-2 weeks | ⬜ NOT STARTED |
| 04 | [AI Chat](#04-ai-chat) | M3 | 2-3 weeks | ⬜ NOT STARTED |
| 05 | [Client Portal](#05-client-portal) | M4 | 1-2 weeks | ⬜ NOT STARTED |
| 07 | [SEO & Polish](#07-seo--polish) | M5 | 2-3 weeks | ⬜ NOT STARTED |

## Milestone Timeline

### M1 – Foundation (Weeks 1-3)

**Goal:** Establish core infrastructure and content system

**Features:**

- ✅ Foundation & Infrastructure (Feature 06)
- ✅ Content Management (Feature 01)

**Deliverables:**

- Next.js app with theme and design system
- MDX/Contentlayer for blog and case studies
- Supabase schema + RLS
- Services pages
- Inquiry form
- At least 2 MDX posts + 1 case study
- Stripe test mode setup
- Resend email integration

**Critical Path:**

1. Foundation Phase 1-5 (setup, theme, Supabase, auth, schema)
2. Content Management Phase 1-2 (MDX setup, metadata)
3. Foundation Phase 6-10 (email, analytics, performance, security, SEO)
4. Content Management Phase 3 (admin CMS)

---

### M2 – Payments & Booking (Weeks 4-6)

**Goal:** Enable revenue generation and appointment scheduling

**Features:**

- ✅ Services & Checkout (Feature 02)
- ✅ Booking & Calendar (Feature 03)

**Deliverables:**

- Deposits + Retainers + Invoicing (Stripe webhooks to DB)
- Booking via Cal.com or Direct Google Calendar API
- Payment processing flows
- Booking confirmations and reminders

**Critical Path:**

1. Services & Checkout Phase 1-4 (service pages, deposits, retainers, invoicing)
2. Booking & Calendar Phase 1 or 2 (Cal.com OR Google Calendar)
3. Services & Checkout Phase 5 (payment dashboard)
4. Booking & Calendar Phase 3-4 (booking management, notifications)

**Parallel Work:**

- Booking can start while checkout is in progress
- Payment dashboard can be built alongside booking management

---

### M3 – AI Chat (Weeks 7-9)

**Goal:** Automate sales estimates and customer service

**Features:**

- ✅ AI Chat (Feature 04)

**Deliverables:**

- Langflow/LangChain service with RAG (public content)
- Sales estimator tool
- Customer service tools for logged-in clients
- Chat UI with streaming responses

**Critical Path:**

1. AI Chat Phase 1 (infrastructure setup)
2. AI Chat Phase 2 (public RAG)
3. AI Chat Phase 3 (sales estimator)
4. AI Chat Phase 4 (client-specific tools)
5. AI Chat Phase 5-6 (chat UI, guardrails)

**Dependencies:**

- Requires M1 (content for RAG)
- Requires M2 (booking/invoice data for CS tools)

---

### M4 – Client Portal (Weeks 10-11)

**Goal:** Self-service client dashboard

**Features:**

- ✅ Client Portal (Feature 05)

**Deliverables:**

- Authenticated client dashboard
- Invoices view (Stripe hosted links)
- Bookings view
- Deliverables and contracts
- Chat history
- Project milestones

**Critical Path:**

1. Client Portal Phase 1 (auth & profile) - may already be done in M1
2. Client Portal Phase 2 (dashboard)
3. Client Portal Phase 3-7 (invoices, bookings, deliverables, milestones, chat history)

**Dependencies:**

- Requires M2 (invoices and bookings data)
- Requires M3 (chat history)

---

### M5 – Polish & SEO (Weeks 12-14, Ongoing)

**Goal:** Optimize for search engines and conversions

**Features:**

- ✅ SEO & Polish (Feature 07)

**Deliverables:**

- OpenGraph images
- JSON-LD structured data
- Performance optimization (LCP < 2.5s)
- A/B test CTAs
- Accessibility audit and fixes
- Mobile optimization
- Pre-launch QA

**Critical Path:**

1. SEO & Polish Phase 1-3 (OG images, structured data, sitemap)
2. SEO & Polish Phase 4-5 (performance, accessibility)
3. SEO & Polish Phase 6-9 (A/B testing, content, analytics, mobile)
4. SEO & Polish Phase 10 (pre-launch checklist)

**Note:** This milestone is ongoing and can start earlier for completed features

---

## Feature Details

### 06. Foundation & Infrastructure

**Location:** `docs/features/06-foundation-infrastructure/feature.md`

**Phases:**

1. Next.js Project Setup (1-2 days)
2. Tailwind & Design System (3-4 days)
3. Supabase Setup (2-3 days)
4. Authentication Setup (2-3 days)
5. Core Database Schema (2-3 days)
6. Email Setup (2 days)
7. Analytics & Monitoring (2 days)
8. Performance Optimization (2-3 days)
9. Security Hardening (2 days)
10. SEO Foundation (2 days)

**Total Estimate:** 2-3 weeks

---

### 01. Content Management

**Location:** `docs/features/01-content-management/feature.md`

**Phases:**

1. Basic MDX Setup (2-3 days)
2. Supabase Metadata Integration (2-3 days)
3. Admin CMS UI (3-4 days)
4. Vector Embeddings & Recommendations (3-4 days)

**Total Estimate:** 1-2 weeks

---

### 02. Services & Checkout

**Location:** `docs/features/02-services-checkout/feature.md`

**Phases:**

1. Service Pages (2-3 days)
2. Stripe Deposits (3-4 days)
3. Stripe Retainers (4-5 days)
4. Stripe Invoicing (3-4 days)
5. Payment Dashboard (2-3 days)

**Total Estimate:** 2-3 weeks

---

### 03. Booking & Calendar

**Location:** `docs/features/03-booking-calendar/feature.md`

**Phases:**

1. Cal.com Integration (2-3 days) OR Google Calendar Direct API (5-7 days)
2. Booking Management (2-3 days)
3. Notifications & Reminders (2-3 days)

**Total Estimate:** 1-2 weeks (Cal.com) or 2-3 weeks (Direct API)

---

### 04. AI Chat

**Location:** `docs/features/04-ai-chat/feature.md`

**Phases:**

1. AI Infrastructure Setup (3-4 days)
2. Public RAG (4-5 days)
3. Sales Estimator Tool (5-6 days)
4. Client-Specific Tools (4-5 days)
5. Chat UI & Experience (3-4 days)
6. Guardrails & Safety (2-3 days)

**Total Estimate:** 2-3 weeks

---

### 05. Client Portal

**Location:** `docs/features/05-client-portal/feature.md`

**Phases:**

1. Authentication & Profile Setup (2-3 days) - may be done in M1
2. Portal Dashboard (3-4 days)
3. Invoices View (2-3 days)
4. Bookings View (2-3 days)
5. Deliverables & Contracts (3-4 days)
6. Project Milestones & Status (2-3 days)
7. Chat History Integration (2 days)

**Total Estimate:** 1-2 weeks (if auth already done)

---

### 07. SEO & Polish

**Location:** `docs/features/07-seo-polish/feature.md`

**Phases:**

1. OpenGraph & Social Media (2-3 days)
2. Structured Data (2-3 days)
3. Sitemap & Robots (1 day)
4. Performance Optimization (3-4 days)
5. Accessibility Audit & Fixes (3-4 days)
6. A/B Testing Setup (2-3 days)
7. Content Optimization (2-3 days)
8. Analytics & Conversion Tracking (2 days)
9. Mobile Optimization (2-3 days)
10. Pre-Launch Checklist (2-3 days)

**Total Estimate:** 2-3 weeks

---

## Recommended Development Order

### Sprint 1-2: Foundation (Weeks 1-3)

- Start with Feature 06 (Foundation) - all phases
- Parallel: Feature 01 (Content Management) - Phase 1-2
- Then: Feature 01 Phase 3-4

### Sprint 3-4: Revenue Generation (Weeks 4-6)

- Start with Feature 02 (Services & Checkout) - Phase 1-4
- Parallel: Feature 03 (Booking) - Phase 1
- Then: Feature 02 Phase 5 + Feature 03 Phase 2-3

### Sprint 5-6: AI & Automation (Weeks 7-9)

- Feature 04 (AI Chat) - All phases
- Can start Feature 07 (SEO) Phase 1-3 in parallel

### Sprint 7: Client Experience (Weeks 10-11)

- Feature 05 (Client Portal) - All phases
- Continue Feature 07 (SEO) Phase 4-7

### Sprint 8-9: Launch Prep (Weeks 12-14)

- Feature 07 (SEO) Phase 8-10
- Final QA and testing
- Launch! 🚀

---

## Dependencies Map

```
Foundation (06)
├── Content Management (01)
├── Services & Checkout (02)
├── Booking & Calendar (03)
└── Client Portal (05) - Auth only

Content Management (01)
└── AI Chat (04) - RAG data

Services & Checkout (02)
├── AI Chat (04) - Invoice tools
└── Client Portal (05) - Invoice view

Booking & Calendar (03)
├── AI Chat (04) - Booking tools
└── Client Portal (05) - Booking view

AI Chat (04)
└── Client Portal (05) - Chat history

All Features
└── SEO & Polish (07)
```

---

## Open Questions & Decisions Needed

1. **Calendar Integration:** Cal.com (faster) vs Direct Google API (more control)?
2. **AI Orchestration:** LangChain (code-first) vs Langflow (visual)?
3. **LLM Provider:** Which LLM for cost/latency balance?
4. **Estimator Display:** Show numeric ranges or tiered bands?
5. **Retainer Tracking:** Hour logging in portal or simple monthly deliverables?
6. **Brand Kit:** Final color/typography/logo decisions?

---

## Success Metrics

### Launch Criteria

- [ ] All M1-M4 features complete
- [ ] Performance targets met (LCP < 2.5s)
- [ ] Accessibility WCAG AA compliant
- [ ] Security audit passed
- [ ] All critical user flows tested
- [ ] Analytics and monitoring active
- [ ] At least 5 blog posts published
- [ ] At least 3 case studies published
- [ ] All email templates tested

### Post-Launch KPIs (Track Weekly)

- Qualified leads per month
- Lead → Call conversion rate
- Call → Proposal conversion rate
- Proposal → Deposit conversion rate
- AI chat response time
- Blog SEO traffic growth
- Page load performance
- Error rate

---

## Notes

- Each feature folder contains a detailed `feature.md` with user stories, technical requirements, and phase breakdowns
- Phases within features can often be parallelized
- Time estimates are for a single developer; adjust for team size
- SEO & Polish (Feature 07) is ongoing and should start as features complete
- Regular testing and QA should happen throughout, not just at the end
