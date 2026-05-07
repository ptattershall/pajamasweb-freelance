# PJais.ai — Portfolio / blog / services PRD

## 1) Summary

A **Next.js 16** site for showcasing work, publishing MDX blog posts, selling service packages, booking calls, taking **deposits and retainers**, issuing **invoices**, and running an **AI chat** that:

- gives rough price estimates,
- answers service FAQs,
- surfaces client-specific info (deadlines, invoices due, next meeting).

## 2) Goals and KPIs

- **Primary:** 5+ qualified leads/mo, ≥30% lead→call, ≥40% call→proposal, ≥25% proposal→deposit.
- **Secondary:** Avg. time-to-first-response &lt; 2 min (AI chat), blog SEO traffic +20% MoM.
- **Quality:** LCP &lt; 2.5s, 0 P0 production errors/wk, WCAG AA.

## 3) Users and personas

- **Founder/operator:** publishes posts, edits services, sends proposals/invoices, manages bookings.
- **Prospect:** reads services/cases, chats with AI, books intro call, pays deposit.
- **Client:** receives invoices/retainers, checks due dates, downloads deliverables, uses portal (invitation-based access).

## 4) Scope (v1)

### 4.1 Content (MDX-first)

- **MDX** in repo via **next-mdx-remote** and **gray-matter** (not Contentlayer).
- Supabase stores **metadata mirrors** for search and recommendations (title, tags, dates, embeddings).
- Admin: CMS-lite UI for hero images (Supabase Storage), blog editor, case studies.

### 4.2 Services and checkout

- Service pages with “From $X” and scope bullets.
- **Deposit** — Stripe PaymentIntent / Checkout.
- **Retainer** — Stripe Subscription.
- **Invoice** — Stripe Invoicing + hosted links.
- Post-payment: records in Supabase, email via Resend.

### 4.3 Booking and calendar

**Two approaches (product choice):**

1. **Cal.com** embed + Google Calendar sync (implemented path in app).
2. **Google Calendar API** — OAuth2, stored refresh token, webhooks (not required for v1 if Cal.com is used).

### 4.4 AI chat (sales + CS)

- **Sales:** price ranges from scope, complexity, timeline (tools + RAG).
- **CS (authenticated):** invoices, bookings, deliverables, milestones (RLS-safe server-side tools).
- **Stack:** Vercel AI SDK streaming + LangChain tooling; guardrails (moderation, prompt-injection checks, rate limits).

### 4.5 Client portal (MVP)

- Authenticated portal: invoices, payments, subscriptions, contracts, bookings, deliverables, milestones, chat history.
- **Admin-controlled invitations**; route protection via **[proxy.ts](../proxy.ts)** (Next.js 16 proxy, not `middleware.ts`).
- Roles: OWNER, CLIENT, SALES, DEV (assignment / rotation for staff).

## 5) Non-goals (v1)

- No multi-tenant agencies or large client teams beyond invited email accounts.
- No complex proposal builder (start with Markdown → PDF if needed later).

## 6) Architecture

### 6.1 Frontend

- Next.js 16 (App Router, RSC, Server Actions), TypeScript.
- Tailwind + shadcn/ui + Lucide; light/dark theme (OKLCH-style tokens in CSS).

### 6.2 Backend and data

- Supabase Postgres (+ RLS), Auth, Storage; extensions e.g. pgvector, pg_trgm.
- Stripe (Checkout, PaymentIntents, Subscriptions, Invoicing, webhooks).
- Calendar: Cal.com (+ Google) or future direct Google API.
- Email: Resend.
- **Analytics:** Vercel Analytics + **Sentry** (errors/tracing). Optional later: PostHog/Axiom-style product analytics.
- **Rate limiting / hot paths:** Upstash Redis where configured (e.g. chat).

### 6.3 AI layer

- RAG over public content in Postgres (embeddings); authenticated tools fetch user-scoped rows via service role + authorization checks in app code.
- Representative tools: pricing suggestion, invoice/booking/deliverable/milestone lookups, quote email.

## 7) Data model (reference / evolved in migrations)

Illustrative SQL (actual schema lives in `scripts/migrations/`):

```sql
-- users via supabase.auth.users

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('OWNER','CLIENT','SALES','DEV')) default 'CLIENT',
  display_name text,
  company text,
  avatar_url text,
  created_at timestamptz default now()
);

-- plus: services, bookings, payments, invoices, subscriptions, invitations,
-- milestones, contracts, deliverables, blog_posts_meta, case_studies_meta, embeddings, …
```

**RLS (principle):** users see own data; OWNER (and governed staff roles) per policies in migrations.

## 8) Key user flows

### 8.1 Prospect → lead → deposit

Service page → estimate/chat → CTA → Stripe Checkout → success → Supabase + Resend.

### 8.2 Booking

Cal.com: slot picked → webhook → `bookings` row + emails.

### 8.3 Client portal

Invite → accept → sign in → dashboard, billing, projects, chat history.

## 9) AI estimator (heuristics)

Inputs: project type, surfaces/features, integrations, AI features, timeline, codebase state, team.

Output: low–high range, rationale, disclaimer; escalate to human when confidence is low.

## 10) Integrations

- **Stripe** — deposits, subscriptions, invoices, webhooks (use Dashboard signing secret in production).
- **Cal.com** — embed + webhook.
- **Resend** — transactional email.

## 11) Security and compliance

- Security headers in `next.config.ts`; CSRF patterns where implemented.
- RLS on PII-bearing tables; service role only on server.
- Rate limits on sensitive POST routes.
- Protect secrets (Stripe, Supabase service role, webhook secrets).

## 12) Analytics and events

Product analytics: Vercel Analytics for web vitals/page views. Deeper funnel events (CTA clicks, chat) can be added via a future provider. Sentry for errors and performance samples.

## 13) SEO

Dynamic OG images, JSON-LD, sitemap, robots — see app routes under `/api/og`, `/api/sitemap`, `/api/robots`.

## 14) Testing

- E2E: Playwright (including axe accessibility suite).
- Lint: ESLint (Next config).
- Zod: validation on a growing set of API routes; extend for parity.

## 15) Milestones (historical)

- **M1** — Foundation: Next app, theme, MDX, services, Supabase, Stripe test, Resend.
- **M2** — Payments and booking (Stripe webhooks, Cal.com).
- **M3** — AI chat + RAG + tools.
- **M4** — Client portal + invitations.
- **M5** — SEO, performance, polish (A/B testing optional post-launch).

## 16) Open questions

- Cal.com vs full Google Calendar API ownership.
- Public numeric estimates vs tier bands.
- Retainer hour logging depth in portal.
- LLM choice and cost/latency tradeoffs.

## 17) Implementation notes (snippets)

**Zod-style tool input (illustrative):**

```typescript
import { z } from 'zod'

const GetPricingSuggestion = z.object({
  projectType: z.enum(['site', 'web_app', 'ecom', 'automation']),
  features: z.array(z.string()).max(20),
  integrations: z.array(z.enum(['stripe', 'oauth', 'cms', 'crm', 'gcal'])).optional(),
  timeline: z.enum(['rush', 'standard']),
  notes: z.string().max(500).optional(),
})
```

**Stripe:** use current API version from codebase; env names `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_APP_URL` (or equivalent) for callbacks.

**Google Calendar (direct path):** OAuth scopes for calendar events; encrypted refresh token; `events.watch` webhooks — only if bypassing Cal.com.
