# Remaining Features - Detailed Breakdown

## Feature 01: Content Management (MDX-first)

**Status:** NOT STARTED | **Estimated Time:** 1-2 weeks

### What Needs to Be Built

**Phase 1: MDX Setup & Blog Infrastructure**

- [ ] Install Contentlayer and MDX dependencies
- [ ] Create blog post schema (title, date, author, tags, content)
- [ ] Create case study schema (client, results, testimonial, images)
- [ ] Set up MDX processing pipeline
- [ ] Create blog listing page (`/blog`)
- [ ] Create blog post detail page (`/blog/[slug]`)
- [ ] Create case studies listing page (`/case-studies`)
- [ ] Create case study detail page (`/case-studies/[slug]`)

**Phase 2: Supabase Metadata & Search**

- [ ] Create `blog_posts` table in Supabase
- [ ] Create `case_studies` table in Supabase
- [ ] Sync MDX metadata to Supabase on build
- [ ] Implement full-text search on blog posts
- [ ] Add search API endpoint

**Phase 3: Vector Embeddings & Recommendations**

- [ ] Set up pgvector in Supabase
- [ ] Generate embeddings for blog posts
- [ ] Implement "related posts" recommendation
- [ ] Add recommendation widget to blog pages

**Phase 4: Admin CMS UI**

- [ ] Create admin page for managing hero images
- [ ] Implement image upload to Supabase Storage
- [ ] Add image preview and cropping
- [ ] Create blog post editor interface

---

## Feature 02: Services & Checkout

**Status:** NOT STARTED | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: Service Catalog**

- [ ] Create `services` table in Supabase
- [ ] Design service package pages
- [ ] Create service listing page (`/services`)
- [ ] Create service detail page (`/services/[slug]`)
- [ ] Add pricing display with currency formatting
- [ ] Implement service filtering/search

**Phase 2: Stripe Deposits (One-off Payments)**

- [ ] Create Stripe payment intent flow
- [ ] Build checkout page for deposits
- [ ] Implement payment confirmation page
- [ ] Add webhook handling for payment success
- [ ] Create payment history view

**Phase 3: Stripe Retainers (Subscriptions)**

- [ ] Create subscription product in Stripe
- [ ] Build subscription checkout flow
- [ ] Implement subscription management page
- [ ] Add upgrade/downgrade functionality
- [ ] Handle subscription cancellation

**Phase 4: Stripe Invoicing**

- [ ] Create invoice generation system
- [ ] Implement invoice sending via email
- [ ] Build invoice tracking dashboard
- [ ] Add payment reminders

**Phase 5: Payment Dashboard**

- [ ] Create admin payment dashboard
- [ ] Show revenue metrics
- [ ] Display subscription status
- [ ] Add payment history export

---

## Feature 03: Booking & Calendar Integration

**Status:** NOT STARTED | **Estimated Time:** 1-2 weeks (Cal.com) or 2-3 weeks (Direct API)

### What Needs to Be Built

**Option A: Cal.com Integration (Recommended - Easier)**

- [ ] Create Cal.com account and event types
- [ ] Embed Cal.com booking widget on `/book` page
- [ ] Create `bookings` table to mirror Cal.com data
- [ ] Set up webhook to sync bookings to database
- [ ] Implement booking confirmation emails
- [ ] Add booking reminders (24h, 1h before)

**Option B: Google Calendar API (More Control)**

- [ ] Set up Google Calendar API credentials
- [ ] Create booking form page
- [ ] Implement calendar availability checking
- [ ] Create booking creation logic
- [ ] Send calendar invites to clients
- [ ] Implement booking confirmation emails

**Common to Both:**

- [ ] Create booking management page
- [ ] Implement reschedule functionality
- [ ] Implement cancellation functionality
- [ ] Add timezone handling
- [ ] Create booking history view

---

## Feature 04: AI Chat (Sales + Customer Service)

**Status:** NOT STARTED | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: Chat Infrastructure**

- [ ] Set up LangChain.js
- [ ] Create chat message schema in Supabase
- [ ] Build chat API endpoint with streaming
- [ ] Implement message history retrieval
- [ ] Add user context to chat

**Phase 2: RAG (Retrieval-Augmented Generation)**

- [ ] Set up pgvector in Supabase
- [ ] Create document ingestion pipeline
- [ ] Generate embeddings for knowledge base
- [ ] Implement semantic search
- [ ] Build RAG retrieval chain

**Phase 3: Sales Estimator Tool**

- [ ] Create pricing calculator logic
- [ ] Build tool for LLM to call
- [ ] Implement quote generation
- [ ] Add quote email sending

**Phase 4: Client-Specific Tools**

- [ ] Create invoice lookup tool
- [ ] Create booking management tool
- [ ] Create deliverable status tool
- [ ] Add milestone status tool

**Phase 5: Chat UI**

- [ ] Build chat interface component
- [ ] Implement message streaming display
- [ ] Add typing indicators
- [ ] Create conversation history sidebar
- [ ] Add message search

**Phase 6: Safety & Guardrails**

- [ ] Implement prompt injection protection
- [ ] Add rate limiting
- [ ] Create content moderation
- [ ] Add audit logging

---

## Feature 06: Foundation & Infrastructure

**Status:** NOT STARTED | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: Core Setup**

- [ ] Verify Next.js 15 + TypeScript setup
- [ ] Configure Tailwind CSS
- [ ] Set up shadcn/ui components
- [ ] Create design tokens/theme

**Phase 2: Supabase Configuration**

- [ ] Set up Supabase project
- [ ] Configure Postgres database
- [ ] Set up Auth (email/password, OAuth)
- [ ] Configure Storage buckets
- [ ] Set up RLS policies

**Phase 3: Email Integration**

- [ ] Set up Resend account
- [ ] Create email templates
- [ ] Implement transactional emails
- [ ] Add email verification flow

**Phase 4: Analytics & Monitoring**

- [ ] Set up Sentry for error tracking
- [ ] Implement analytics (Vercel Analytics or Plausible)
- [ ] Add performance monitoring
- [ ] Create logging infrastructure

**Phase 5: Security**

- [ ] Implement CSRF protection
- [ ] Add rate limiting
- [ ] Configure security headers
- [ ] Set up API authentication

---

## Feature 07: SEO & Polish

**Status:** NOT STARTED | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: SEO Fundamentals**

- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Add meta tags to all pages
- [ ] Implement OpenGraph images
- [ ] Add JSON-LD structured data

**Phase 2: Performance**

- [ ] Optimize images (next/image)
- [ ] Implement code splitting
- [ ] Add caching headers
- [ ] Optimize bundle size
- [ ] Implement lazy loading

**Phase 3: Accessibility**

- [ ] Audit WCAG AA compliance
- [ ] Add keyboard navigation
- [ ] Implement screen reader support
- [ ] Add focus indicators
- [ ] Test with accessibility tools

**Phase 4: Mobile Optimization**

- [ ] Test responsive design
- [ ] Optimize touch targets
- [ ] Implement mobile menu
- [ ] Test on various devices

**Phase 5: A/B Testing**

- [ ] Set up A/B testing framework
- [ ] Create test variants
- [ ] Implement analytics tracking
- [ ] Create results dashboard

**Phase 6: Pre-Launch QA**

- [ ] Cross-browser testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Load testing
- [ ] User acceptance testing
