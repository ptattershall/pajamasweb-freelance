# PJais.ai — Portfolio/Blog/Services PRD

## 1) Summary

A Next.js 15 site for showcasing work, publishing MDX blog posts, selling service packages, booking calls, taking **deposits/retainers**, issuing **invoices**, and running an **AI chat** that:

- gives rough price estimates,
- answers service FAQs,
- surfaces client-specific info (deadlines, invoices due, next meeting).

## 2) Goals & KPIs

- **Primary:** 5+ qualified leads/mo, ≥30% lead→call, ≥40% call→proposal, ≥25% proposal→deposit.
- **Secondary:** Avg. time-to-first-response < 2 min (AI chat), blog SEO traffic +20% MoM.
- **Quality:** LCP < 2.5s, 0 P0 production errors/wk, WCAG AA.

## 3) Users & Personas

- **Founder/Operator (you):** publishes posts, edits services, sends proposals/invoices, manages bookings.
- **Prospect:** reads services/cases, chats with AI, books intro call, pays deposit.
- **Client:** receives invoices/retainers, checks due dates, downloads deliverables, messages via portal.

## 4) Scope (v1)

### 4.1 Content (MDX-first)

- MDX + Contentlayer for blog & case studies (versioned in Git).
- Supabase stores **metadata mirrors** for search/recs (title, tags, dates, embeddings).
- Admin: simple CMS-lite UI to attach hero images (Supabase Storage).

### 4.2 Services & Checkout

- Service pages with “From $X” + scope bullets.
- **Checkout flows:**
  - **Deposit** (one-off Stripe PaymentIntent or Stripe Checkout session).
  - **Retainer** (Stripe Subscription; e.g., 10/20/40 hrs mo).
  - **Invoice** (Stripe Invoicing API or custom invoice object + hosted invoice link).
- Post-payment: write receipt + status to Supabase, email via Resend.

### 4.3 Booking & Google Calendar

**Two approaches (pick one, both supported):**

1) **Cal.com** embed with Google Calendar sync (fastest, robust rescheduling/reminders).
2) **Direct Google Calendar API**  
   - OAuth2 (offline access) to your Google account.  
   - Store refresh token (encrypted) in Supabase; create events on booking; listen to **push notifications** (webhooks) to reflect changes; send Resend confirmations.

### 4.4 AI Chat (Sales + CS)

- **Use case A (Sales Estimator):** quick price ranges based on scope, complexity, timeline.  
- **Use case B (Customer Service):** “What’s due/when is my next call?/invoice status/deliverables?”  
- **Stack:** LangChain **or** Langflow orchestration + your LLM of choice.  
- **Data sources:**
  - Public: service catalog, pricing heuristics, FAQs (prompted or via RAG).  
  - Private (for authenticated clients): project, invoices, bookings (strict RLS + scoped retrieval).  
- **Guardrails:** disclaimers, max confidence thresholds; force human handoff when uncertain.

### 4.5 Client Portal (MVP)

- Authenticated view for invoices (Stripe hosted links), contracts, upcoming bookings, deliverables (Supabase Storage signed URLs), chat history.

## 5) Non-Goals (v1)

- No multi-tenant agencies or multi-user client teams beyond “client + invited email”.
- No complex proposal builder (start with Markdown → PDF).

## 6) Architecture

1) Summary

A Next.js 15 site for showcasing work, publishing MDX blog posts, selling service packages, booking calls, taking deposits/retainers, issuing invoices, and running an AI chat that:

gives rough price estimates,

answers service FAQs,

surfaces client-specific info (deadlines, invoices due, next meeting).

2) Goals & KPIs

Primary: 5+ qualified leads/mo, ≥30% lead→call, ≥40% call→proposal, ≥25% proposal→deposit.

Secondary: Avg. time-to-first-response < 2 min (AI chat), blog SEO traffic +20% MoM.

Quality: LCP < 2.5s, 0 P0 production errors/wk, WCAG AA.

3) Users & Personas

Founder/Operator (you): publishes posts, edits services, sends proposals/invoices, manages bookings.

Prospect: reads services/cases, chats with AI, books intro call, pays deposit.

Client: receives invoices/retainers, checks due dates, downloads deliverables, messages via portal.

4) Scope (v1)
4.1 Content (MDX-first)

MDX + Contentlayer for blog & case studies (versioned in Git).

Supabase stores metadata mirrors for search/recs (title, tags, dates, embeddings).

Admin: simple CMS-lite UI to attach hero images (Supabase Storage).

4.2 Services & Checkout

Service pages with “From $X” + scope bullets.

Checkout flows:

Deposit (one-off Stripe PaymentIntent or Stripe Checkout session).

Retainer (Stripe Subscription; e.g., 10/20/40 hrs mo).

Invoice (Stripe Invoicing API or custom invoice object + hosted invoice link).

Post-payment: write receipt + status to Supabase, email via Resend.

4.3 Booking & Google Calendar

Two approaches (pick one, both supported):

Cal.com embed with Google Calendar sync (fastest, robust rescheduling/reminders).

Direct Google Calendar API

OAuth2 (offline access) to your Google account.

Store refresh token (encrypted) in Supabase; create events on booking; listen to push notifications (webhooks) to reflect changes; send Resend confirmations.

4.4 AI Chat (Sales + CS)

Use case A (Sales Estimator): quick price ranges based on scope, complexity, timeline.

Use case B (Customer Service): “What’s due/when is my next call?/invoice status/deliverables?”

Stack: LangChain or Langflow orchestration + your LLM of choice.

Data sources:

Public: service catalog, pricing heuristics, FAQs (prompted or via RAG).

Private (for authenticated clients): project, invoices, bookings (strict RLS + scoped retrieval).

Guardrails: disclaimers, max confidence thresholds; force human handoff when uncertain.

4.5 Client Portal (MVP)

Authenticated view for invoices (Stripe hosted links), contracts, upcoming bookings, deliverables (Supabase Storage signed URLs), chat history.

5) Non-Goals (v1)

No multi-tenant agencies or multi-user client teams beyond “client + invited email”.

No complex proposal builder (start with Markdown → PDF).

6) Architecture
6.1 Frontend

Next.js 15 (App Router, RSC, Server Actions), TypeScript, pnpm.

Tailwind + shadcn/ui, Lucide.

Theme: brand-new (not PajamasWeb). Light/dark, custom OKLCH palette, rounded-2xl, soft shadows.

6.2 Backend & Data

Supabase Postgres (+ RLS), Supabase Auth, Supabase Storage.

Extensions: pgvector, pg_trgm.

Stripe (Checkout, PaymentIntents, Subscriptions, Invoicing).

Calendar: Cal.com+Google or Google Calendar API (OAuth2).

Email: Resend.

Analytics: Axiom (or PostHog) + Sentry.

(Optional) KV cache: Upstash Redis for hot lists (popular posts, featured services).

6.3 AI Layer

Orchestration: Langflow (visual) or LangChain (code-first).

RAG Store:

Public: embed services/FAQs/MDX (vector in Postgres via pgvector).

Private: embed only metadata + pointers; fetch row-level details live via RLS-safe server actions.

Tools/Functions:

get_pricing_suggestion(scope, complexity, timeline)

get_client_invoice_status(client_id)

get_next_booking(client_id)

Tools call server actions → DB/Stripe/Calendar.

7) Data Model (additions/updates)
-- users via supabase.auth.users

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('OWNER','CLIENT')) default 'CLIENT',
  display_name text,
  company text,
  avatar_url text,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  details_md text, -- short marketing details
  price_from_cents int,
  tier text, -- e.g., 'starter','pro','enterprise'
  is_active boolean default true,
  created_at timestamptz default now()
);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text,
  service_id uuid references services(id),
  status text default 'new',
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id),
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  external_id text, -- cal.com or gcal event id
  provider text, -- 'calcom' | 'gcal'
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id),
  intent_id text, -- Stripe PaymentIntent or Subscription/Invoice id
  type text check (type in ('deposit','retainer','invoice')) not null,
  amount_cents int not null,
  currency text default 'usd',
  status text, -- 'requires_payment_method','succeeded', etc.
  related_service uuid references services(id),
  created_at timestamptz default now()
);

create table blog_posts_meta (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  tags text[],
  published_at timestamptz,
  embedding vector(1536) -- or your chosen dim
);

create table case_studies_meta (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client_name text,
  problem text,
  results text,
  tags text[],
  published_at timestamptz,
  embedding vector(1536)
);

RLS Notes

profiles: user can select/update own row; OWNER can select all.

bookings, payments: user can read only their own; OWNER can read all.

blog_posts_meta, case_studies_meta, services: public read where published/active.

8) Key User Flows
8.1 Prospect → Lead → Deposit

Reads service page → clicks Book Intro or Get Estimate.

AI Estimator collects scope signals (features, platform, timeline, budget band).

Shows range + CTA: “Book Call” or “Start with Deposit”.

Stripe Checkout → success → Supabase payments row + Resend email.

8.2 Booking (Google Calendar)

Cal.com path: user picks slot → Cal.com writes to Google Calendar → webhook → store bookings row → email both parties.

Direct API path: user selects slot from availability derived from your GCal; on confirm, server action creates event via Calendar API; store bookings row.

8.3 Client Portal

Auth → view invoices (Stripe hosted links), upcoming meetings (bookings), due dates (milestones), deliverables (signed URLs), AI chat context-aware.

9) AI Estimator: Initial Heuristics
Inputs

Project type (site, web app, ecom, AI agent/automation)

Surfaces: pages/screens count or feature set

Integrations (Stripe, OAuth, CMS, CRM, GCal)

AI features (agent, RAG, fine-tune, evals)

Timeline (rush/standard)

Codebase state (greenfield vs refactor)

Team composition (solo vs add’l contractors)

Rough Scoring → Range

Base ranges per project type (e.g., Site: $X–Y; Web app: $A–B; AI/Automation: $C–D)

Modifiers:

Integrations (+10–30% each, weighted)

AI features (+20–60%)

Rush timeline (+25–50%)

Security/compliance (+10–25%)

Output: Low–High + “Why” bullets + “What’s included”.

Guardrails

Always include disclaimer and “Book a call for a precise quote.”

Escalate to human if low confidence (e.g., too many unknowns).

10) Integrations
Stripe

Deposits: PaymentIntent/Checkout (one-off).

Retainers: Subscriptions (monthly), track hours in Supabase (manual log v1).

Invoicing: Stripe Invoices; webhooks → payments status updates.

Google Calendar

Cal.com: set up one integration, embed widgets, webhook to Supabase.

Direct API: Google OAuth2 (Scopes: calendar.events, calendar.readonly). Store encrypted refresh token; implement push notifications (watch channels) for changes.

Resend

Templates: inquiry receipt, booking confirmation, payment receipt, invoice issued.

11) Security & Compliance

Strict CSP, HSTS, referrer-policy, frame-ancestors none.

RLS on all PII-bearing tables.

Encrypt OAuth refresh tokens & Stripe secret metadata (KMS or at least Supabase vault/env-kms).

Rate-limit POSTs (Arcjet or middleware + Redis).

Log access to client artifacts.

12) Analytics & Events

Axiom/PostHog: page_view, service_cta_click, chat_open, estimate_shown, booking_started/completed, checkout_started/completed, invoice_viewed/paid.

Weekly KPI email to you.

13) SEO

MDX → OpenGraph images (Satori/Vercel OG).

JSON-LD: Service, Article, Organization, FAQ for service pages.

Canonicals, sitemap, robots.

14) Testing

Unit: Vitest

E2E: Playwright (core paths above)

A11y: Axe CI

Contract: Zod schemas for chat tools & API payloads

15) Milestones

M1 – Foundation (1–2 wks)

Next.js app, theme, MDX/Contentlayer, services pages, inquiry form.

Supabase schema + RLS; Stripe test mode; Resend emails.

At least 2 MDX posts + 1 case study.

M2 – Payments & Booking (1–2 wks)

Deposits + Retainers + Invoicing (Stripe webhooks to DB).

Booking via Cal.com initially (fast), or start Direct API POC.

M3 – AI Chat (1–2 wks)

Langflow/LangChain service with RAG (public content).

Tooling to fetch booking/invoice status for logged-in clients.

M4 – Client Portal (1 wk)

Invoices, bookings, deliverables, chat history.

M5 – Polish & SEO (ongoing)

OG images, JSON-LD, performance passes, A/B test CTAs.

16) Open Questions

Calendar path: Cal.com (speed) vs direct Google API (control).

Estimator tolerance: Publicly show numeric ranges or “tiered bands” only?

Retainer tracking: Hour logging v1 inside portal or simple monthly deliverables?

Which LLM(s): cost/latency tradeoffs; need evals for estimator accuracy.

Brand kit: final color/typography/logo lockups.

17) Implementation Notes & Snippets

AI Tool Contracts (Zod)

const GetPricingSuggestion = z.object({
  projectType: z.enum(['site','web_app','ecom','automation']),
  features: z.array(z.string()).max(20),
  integrations: z.array(z.enum(['stripe','oauth','cms','crm','gcal'])).optional(),
  timeline: z.enum(['rush','standard']),
  notes: z.string().max(500).optional()
});

const PricingSuggestionResult = z.object({
  lowUSD: z.number(),
  highUSD: z.number(),
  confidence: z.number().min(0).max(1),
  factors: z.array(z.string())
});


Server Action (Stripe deposit)

'use server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

export async function createDepositCheckout({serviceId, amountCents}:{serviceId:string; amountCents:number}) {
  const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2024-10-28' })
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price_data: { currency:'usd', product_data:{ name:`Deposit for ${serviceId}` }, unit_amount: amountCents }, quantity:1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/thank-you?sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/services/${serviceId}`,
    customer_email: cookies().get('email')?.value
  })
  return { url: session.url }
}


Google Calendar OAuth (direct path) – high level

Use OAuth screen + scopes: https://www.googleapis.com/auth/calendar.events.

Store encrypted refresh_token tied to OWNER profile.

A “Create Event” server action calls events.insert.

Set up push notifications with events.watch → webhook route updates bookings.
