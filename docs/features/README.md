# PJais.ai Features

This directory contains detailed feature specifications for the PJais.ai project. Each feature is organized in its own folder with a comprehensive `feature.md` file.

## Feature Index

### 01. Content Management (MDX-first)

**Location:** `01-content-management/feature.md`  
**Milestone:** M1 – Foundation  
**Estimated Time:** 1-2 weeks  
**Status:** ⬜ NOT STARTED

MDX-based content system for blog posts and case studies with metadata storage, search capabilities, and vector embeddings for recommendations.

**Key Components:**

- MDX + Contentlayer for blog & case studies
- Supabase metadata mirrors
- Admin CMS UI for hero images
- Vector embeddings for related content

---

### 02. Services & Checkout

**Location:** `02-services-checkout/feature.md`  
**Milestone:** M2 – Payments & Booking  
**Estimated Time:** 2-3 weeks  
**Status:** ⬜ NOT STARTED

Service package pages with Stripe-powered checkout flows for deposits, retainers, and invoices.

**Key Components:**

- Service catalog with pricing
- Stripe deposits (one-off payments)
- Stripe retainers (subscriptions)
- Stripe invoicing
- Payment dashboard

---

### 03. Booking & Calendar Integration

**Location:** `03-booking-calendar/feature.md`  
**Milestone:** M2 – Payments & Booking  
**Estimated Time:** 1-2 weeks (Cal.com) or 2-3 weeks (Direct API)  
**Status:** ⬜ NOT STARTED

Calendar booking system with two implementation options: Cal.com embed or direct Google Calendar API integration.

**Key Components:**

- Cal.com integration OR Google Calendar API
- Booking management
- Email notifications and reminders
- Calendar sync

---

### 04. AI Chat (Sales + Customer Service)

**Location:** `04-ai-chat/feature.md`  
**Milestone:** M3 – AI Chat  
**Estimated Time:** 2-3 weeks  
**Status:** ⬜ NOT STARTED

AI-powered chat assistant that provides price estimates for prospects and answers customer service questions for authenticated clients.

**Key Components:**

- LangChain/Langflow orchestration
- RAG with pgvector
- Sales estimator tool
- Client-specific CS tools
- Chat UI with streaming
- Guardrails and safety

---

### 05. Client Portal (MVP)

**Location:** `05-client-portal/feature.md`  
**Milestone:** M4 – Client Portal  
**Estimated Time:** 1-2 weeks  
**Status:** ⬜ NOT STARTED

Authenticated client dashboard for viewing invoices, contracts, bookings, deliverables, and chat history.

**Key Components:**

- Authentication & profiles
- Dashboard overview
- Invoices view
- Bookings view
- Deliverables & contracts
- Project milestones
- Chat history

---

### 06. Foundation & Infrastructure

**Location:** `06-foundation-infrastructure/feature.md`  
**Milestone:** M1 – Foundation  
**Estimated Time:** 2-3 weeks  
**Status:** ⬜ NOT STARTED

Core Next.js application setup, theming, database schema, authentication, and essential integrations.

**Key Components:**

- Next.js 15 + TypeScript + Tailwind
- Supabase (Postgres, Auth, Storage)
- Design system & theme
- Email (Resend)
- Analytics & monitoring
- Security & performance
- SEO foundation

---

### 07. SEO & Polish

**Location:** `07-seo-polish/feature.md`  
**Milestone:** M5 – Polish & SEO  
**Estimated Time:** 2-3 weeks  
**Status:** ⬜ NOT STARTED

Search engine optimization, performance tuning, accessibility improvements, and final polish for production launch.

**Key Components:**

- OpenGraph images
- JSON-LD structured data
- Sitemap & robots.txt
- Performance optimization
- Accessibility (WCAG AA)
- A/B testing
- Mobile optimization
- Pre-launch QA

---

## How to Use This Documentation

### For Planning

1. Review the [Development Roadmap](../DEVELOPMENT_ROADMAP.md) for overall timeline
2. Read individual feature files for detailed requirements
3. Check dependencies between features
4. Estimate effort based on your team size

### For Development

1. Start with Feature 06 (Foundation) to set up infrastructure
2. Follow the recommended development order in the roadmap
3. Use the phase breakdowns in each feature file as sprint tasks
4. Mark phases as complete as you finish them

### For Tracking Progress

Each feature file includes:

- **User Stories** - What users need
- **Technical Requirements** - What to build
- **Development Phases** - How to build it (with time estimates)
- **Acceptance Criteria** - When it's done
- **Testing Requirements** - How to verify it works

### Status Indicators

- ⬜ NOT STARTED - Not yet begun
- 🔄 IN PROGRESS - Currently being worked on
- ✅ COMPLETE - Finished and tested
- ⏸️ BLOCKED - Waiting on dependencies

---

## Quick Reference

### Milestones

- **M1** (Weeks 1-3): Foundation + Content Management
- **M2** (Weeks 4-6): Payments + Booking
- **M3** (Weeks 7-9): AI Chat
- **M4** (Weeks 10-11): Client Portal
- **M5** (Weeks 12-14): SEO & Polish

### Total Estimated Time

**10-14 weeks** for a single developer working full-time

### Critical Path

Foundation → Content → Services/Booking → AI Chat → Client Portal → SEO/Polish

### Parallel Opportunities

- Content Management can run parallel with Foundation (after initial setup)
- Services and Booking can be developed simultaneously
- SEO work can start as features complete

---

## Related Documentation

- [Main PRD](../Pajamasweb_PRD.md) - Original product requirements
- [Development Roadmap](../DEVELOPMENT_ROADMAP.md) - Timeline and dependencies
- [Architecture Decisions](../architecture/) - Technical decisions (if exists)

---

## Contributing

When updating feature documentation:

1. Keep user stories focused on user value
2. Include acceptance criteria for each phase
3. Update time estimates based on actual progress
4. Mark phases as complete when done
5. Document any deviations from the plan
