# Remaining Features - Detailed Breakdown

## Feature 01: Content Management (MDX-first)

**Status:** ALL PHASES COMPLETE | **Estimated Time:** 1-2 weeks

### What Needs to Be Built

**Phase 1: MDX Setup & Blog Infrastructure**

- [x] Install Contentlayer and MDX dependencies *(Using next-mdx-remote + gray-matter instead of Contentlayer - functionally equivalent)*
- [x] Create blog post schema (title, date, author, tags, content) *(lib/content.ts - BlogPost interface)*
- [x] Create case study schema (client, results, testimonial, images) *(lib/content.ts - CaseStudy interface)*
- [x] Set up MDX processing pipeline *(Using MDXRemote from next-mdx-remote)*
- [x] Create blog listing page (`/blog`) *(app/blog/page.tsx)*
- [x] Create blog post detail page (`/blog/[slug]`) *(app/blog/[slug]/page.tsx)*
- [x] Create case studies listing page (`/case-studies`) *(app/case-studies/page.tsx)*
- [x] Create case study detail page (`/case-studies/[slug]`) *(app/case-studies/[slug]/page.tsx)*

**Phase 2: Supabase Metadata & Search**

- [x] Create `blog_posts` table in Supabase *(blog_posts_meta table in lib/supabase.ts)*
- [x] Create `case_studies` table in Supabase *(case_studies_meta table in lib/supabase.ts)*
- [x] Sync MDX metadata to Supabase on build *(prebuild npm hook runs scripts/sync-metadata.ts)*
- [x] Implement full-text search on blog posts *(searchBlogPosts, searchCaseStudies functions)*
- [x] Add search API endpoint *(app/api/search/route.ts)*

**Phase 3: Vector Embeddings & Recommendations**

- [x] Set up pgvector in Supabase *(match_blog_posts, match_case_studies RPC functions)*
- [x] Generate embeddings for blog posts *(lib/embeddings.ts with OpenAI API)*
- [x] Implement "related posts" recommendation *(findSimilarBlogPosts, findSimilarCaseStudies)*
- [x] Add recommendation widget to blog pages *(RelatedBlogPosts, RelatedCaseStudies components)*

**Phase 4: Admin CMS UI**

- [x] Create admin page for managing hero images *(app/admin/images/page.tsx)*
- [x] Implement image upload to Supabase Storage *(ImageUpload component + lib/supabase.ts)*
- [x] Add image preview and cropping *(ImageCropDialog component with react-easy-crop - zoom, rotation, aspect ratio presets)*
- [x] Create blog post editor interface *(BlogPostEditor component with MDXEditor - WYSIWYG editing, create/edit pages, API routes)*

---

## Feature 02: Services & Checkout

**Status:** PHASES 1-5 COMPLETE | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: Service Catalog**

- [x] Create `services` table in Supabase *(lib/supabase.ts - Service interface + CRUD functions)*
- [x] Design service package pages *(Modern card-based design with tier badges)*
- [x] Create service listing page (`/services`) *(app/services/page.tsx)*
- [x] Create service detail page (`/services/[slug]`) *(app/services/[slug]/page.tsx with checkout buttons)*
- [x] Add pricing display with currency formatting *(Displays price_from_cents as USD formatted)*
- [x] Implement service filtering/search *(ServiceFilterGrid component with text search + tier filter)*

**Phase 2: Stripe Deposits (One-off Payments)**

- [x] Create Stripe payment intent flow *(lib/stripe.ts + /api/stripe/create-payment-intent + webhook handlers for payment_intent events)*
- [x] Build checkout page for deposits *(/checkout/deposit with StripeProvider, DepositCheckoutForm, PaymentElement integration)*
- [x] Implement payment confirmation page *(/checkout/success with full PaymentIntent retrieval, status-based UI, payment details display)*
- [x] Add webhook handling for payment success *(Stripe webhook sends confirmation/failure emails via Resend, stores payment records in Supabase)*
- [x] Create payment history view *(/portal/payments with list, filters, pagination + /portal/payments/[id] detail page)*

**Phase 3: Stripe Retainers (Subscriptions)**

- [x] Create subscription product in Stripe *(lib/stripe.ts - subscription functions, /api/stripe/create-subscription route, Supabase subscriptions table + migration)*
- [x] Build subscription checkout flow *(createRetainerCheckout uses getOrCreateSubscriptionPrice + createSubscriptionCheckoutSession; /checkout/subscription page; success URL type=subscription; ServiceCheckoutButtons link to subscription checkout)*
- [x] Implement subscription management page *(/portal/subscriptions list + /portal/subscriptions/[id] detail; GET /api/portal/subscriptions)*
- [x] Add upgrade/downgrade functionality *(lib/stripe.ts listPricesByProduct, updateSubscription; POST /api/portal/subscriptions/[id]/update; GET /api/portal/subscriptions/[id]/prices; Change plan dialog on detail page)*
- [x] Handle subscription cancellation *(lib/stripe.ts cancelSubscription; POST /api/portal/subscriptions/[id]/cancel with cancelAtPeriodEnd option; Cancel subscription dialog on detail page)*

**Phase 4: Stripe Invoicing**

- [x] Create invoice generation system *(lib/stripe.ts createDraftInvoice, addInvoiceLineItem, finalizeInvoice, sendInvoice; lib/invoices-service.ts createAndSendInvoice, upsertInvoiceFromStripe; POST /api/admin/invoices; admin /admin/invoices page)*
- [x] Implement invoice sending via email *(Stripe sendInvoice + lib/email-service.ts sendInvoiceEmail; optional custom email when creating invoice)*
- [x] Build invoice tracking dashboard *(Portal /portal/invoices list with overdue filter and Overdue badge; /portal/invoices/[id] detail; webhook syncs invoice events to invoices table)*
- [x] Add payment reminders *(sendInvoicePaymentReminder in email-service; POST /api/admin/invoices/remind; GET /api/cron/send-invoice-reminders with CRON_SECRET for daily overdue reminders)*

**Phase 5: Payment Dashboard**

- [x] Create admin payment dashboard *(app/admin/payments/page.tsx – revenue cards, subscription status, payment history table; GET /api/admin/payments, /api/admin/payments/metrics, /api/admin/subscriptions; admin layout link)*
- [x] Show revenue metrics *(Total revenue and completed payment count; period selector: all time / last 30 days; GET /api/admin/payments/metrics)*
- [x] Display subscription status *(Subscription status section with active/trialing, canceled/ending, past_due/unpaid counts; table of subscriptions with amount, interval, period end, cancel_at_period_end; GET /api/admin/subscriptions)*
- [x] Add payment history export *(Export CSV button; GET /api/admin/payments/export with optional status/type filters; filename payments-export-YYYY-MM-DD.csv)*

---

## Feature 03: Booking & Calendar Integration

**Status:** CAL.COM INTEGRATION COMPLETE | **Estimated Time:** 1-2 weeks (Cal.com) or 2-3 weeks (Direct API)

### What Needs to Be Built

**Option A: Cal.com Integration (Recommended - Easier)**

- [ ] Create Cal.com account and event types *(External configuration - code is ready)*
- [x] Embed Cal.com booking widget on `/book` page *(app/book/page.tsx with Cal.com embed)*
- [x] Create `bookings` table to mirror Cal.com data *(lib/booking-service.ts)*
- [x] Set up webhook to sync bookings to database *(app/api/webhooks/calcom/route.ts)*
- [x] Implement booking confirmation emails *(lib/email-service.ts - sendBookingConfirmation)*
- [x] Add booking reminders (24h, 1h before) *(lib/email-service.ts - sendBookingReminder24h, sendBookingReminder1h)*

**Option B: Google Calendar API (More Control)**

- [ ] Set up Google Calendar API credentials
- [ ] Create booking form page
- [ ] Implement calendar availability checking
- [ ] Create booking creation logic
- [ ] Send calendar invites to clients
- [ ] Implement booking confirmation emails

**Common to Both:**

- [x] Create booking management page *(/portal/bookings with list + calendar views)*
- [x] Implement reschedule functionality *(Redirects to Cal.com reschedule page)*
- [x] Implement cancellation functionality *(/api/portal/bookings/[id]/cancel route)*
- [ ] Add timezone handling *(Uses browser locale but no explicit timezone selector)*
- [x] Create booking history view *(/portal/bookings shows upcoming/past tabs + DB logging)*

---

## Feature 04: AI Chat (Sales + Customer Service)

**Status:** PHASES 1-5 MOSTLY COMPLETE | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: Chat Infrastructure**

- [x] Set up LangChain.js *(@langchain/openai + langchain in package.json)*
- [x] Create chat message schema in Supabase *(chat_sessions table via app/api/chat/route.ts)*
- [x] Build chat API endpoint with streaming *(app/api/chat/route.ts using ai SDK streamText)*
- [x] Implement message history retrieval *(lib/chat-history.ts)*
- [x] Add user context to chat *(Auth header validation + user ID in chat route)*

**Phase 2: RAG (Retrieval-Augmented Generation)**

- [x] Set up pgvector in Supabase *(embeddings table with vector column)*
- [x] Create document ingestion pipeline *(lib/rag-service.ts - storeEmbedding, batchStoreEmbeddings)*
- [x] Generate embeddings for knowledge base *(lib/embeddings.ts - generateEmbedding)*
- [x] Implement semantic search *(retrieveSimilarEmbeddings function)*
- [x] Build RAG retrieval chain *(retrieveRAGContext used in chat route)*

**Phase 3: Sales Estimator Tool**

- [x] Create pricing calculator logic *(lib/pricing.ts - calculatePricing)*
- [x] Build tool for LLM to call *(lib/tools/pricing-suggestion.ts - pricingSuggestionTool)*
- [x] Implement quote generation *(formatPricingResult with breakdown)*
- [ ] Add quote email sending *(Not implemented)*

**Phase 4: Client-Specific Tools**

- [x] Create invoice lookup tool *(lib/tools/invoice-status.ts - invoiceStatusTool)*
- [x] Create booking management tool *(lib/tools/booking-status.ts - bookingStatusTool)*
- [x] Create deliverable status tool *(lib/tools/deliverables.ts - deliverablesTool)*
- [ ] Add milestone status tool *(Not implemented as separate tool)*

**Phase 5: Chat UI**

- [x] Build chat interface component *(components/ChatWidget.tsx + FloatingChatButton.tsx)*
- [x] Implement message streaming display *(Streaming response in ChatWidget)*
- [x] Add typing indicators *(Loading dots animation in ChatWidget)*
- [x] Create conversation history sidebar *(ChatHistory.tsx + showHistory toggle)*
- [ ] Add message search *(Not implemented)*

**Phase 6: Safety & Guardrails**

- [x] Implement prompt injection protection *(detectPromptInjection in chat route)*
- [x] Add rate limiting *(@upstash/ratelimit in chat + lib/rate-limit.ts)*
- [ ] Create content moderation *(lib/content-filter.ts exists but not fully integrated)*
- [x] Add audit logging *(logChatInteraction + chat_audit_log table)*

---

## Feature 06: Foundation & Infrastructure

**Status:** PHASES 1-5 MOSTLY COMPLETE | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: Core Setup**

- [x] Verify Next.js 15 + TypeScript setup *(Next.js 16.0.10 + TypeScript 5)*
- [x] Configure Tailwind CSS *(tailwind.config.js with typography + animate plugins)*
- [x] Set up shadcn/ui components *(components/ui/ - button, card, form, dialog, etc.)*
- [x] Create design tokens/theme *(globals.css with CSS variables for light/dark themes)*

**Phase 2: Supabase Configuration**

- [x] Set up Supabase project *(lib/supabase.ts + lib/supabase-server.ts)*
- [x] Configure Postgres database *(Multiple tables: services, bookings, invoices, etc.)*
- [x] Set up Auth (email/password, OAuth) *(signInWithEmail, signUpWithEmail + auth routes)*
- [x] Configure Storage buckets *(hero-images bucket for blog/case-study images)*
- [ ] Set up RLS policies *(Requires external Supabase dashboard verification)*

**Phase 3: Email Integration**

- [x] Set up Resend account *(lib/email-service.ts with Resend SDK)*
- [x] Create email templates *(HTML templates for confirmation, reminder, cancellation, invitation)*
- [x] Implement transactional emails *(Booking confirmations, reminders, invitations)*
- [ ] Add email verification flow *(Auth resend-verification exists but full flow incomplete)*

**Phase 4: Analytics & Monitoring**

- [x] Set up Sentry for error tracking *(sentry.server.config.ts + @sentry/nextjs integrated)*
- [ ] Implement analytics (Vercel Analytics or Plausible) *(Not implemented)*
- [x] Add performance monitoring *(Sentry tracesSampleRate enabled)*
- [ ] Create logging infrastructure *(Console logging only, no centralized logging)*

**Phase 5: Security**

- [x] Implement CSRF protection *(lib/csrf-protection.ts with Edge Runtime support)*
- [x] Add rate limiting *(lib/rate-limit.ts with @upstash/ratelimit)*
- [ ] Configure security headers *(Not implemented in next.config.ts)*
- [x] Set up API authentication *(lib/auth-service.ts + JWT validation)*

---

## Feature 07: SEO & Polish

**Status:** PHASE 1 COMPLETE, PHASE 2 PARTIAL | **Estimated Time:** 2-3 weeks

### What Needs to Be Built

**Phase 1: SEO Fundamentals**

- [x] Create sitemap.xml *(app/api/sitemap/route.ts - dynamic sitemap generation)*
- [x] Create robots.txt *(app/api/robots/route.ts - with crawl rules + sitemap link)*
- [x] Add meta tags to all pages *(Each page exports metadata with OG/Twitter tags)*
- [x] Implement OpenGraph images *(app/api/og/ - dynamic OG image generation with @vercel/og)*
- [x] Add JSON-LD structured data *(lib/json-ld-schemas.ts + JsonLdScript component on all pages)*

**Phase 2: Performance**

- [x] Optimize images (next/image) *(OptimizedImage component + next.config.ts image config)*
- [ ] Implement code splitting *(Next.js automatic, no explicit optimization)*
- [x] Add caching headers *(OG images, sitemap, robots.txt have cache headers)*
- [ ] Optimize bundle size *(No explicit optimization)*
- [x] Implement lazy loading *(OptimizedImage uses lazy loading by default)*

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
