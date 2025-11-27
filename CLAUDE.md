# CLAUDE.md - AI Assistant Guide for PajamasWeb

## Project Overview

**PajamasWeb** is a Next.js 16-based AI-powered service platform for managing services, bookings, payments, AI chat, and client portals. This is a freelance portfolio and service management platform with integrated payment processing, calendar booking, and AI-powered customer support.

### Key Goals
- **Primary**: 5+ qualified leads/mo, ≥30% lead→call, ≥40% call→proposal, ≥25% proposal→deposit
- **Secondary**: Avg. time-to-first-response < 2 min (AI chat), blog SEO traffic +20% MoM
- **Quality**: LCP < 2.5s, 0 P0 production errors/wk, WCAG AA compliance

## Tech Stack

### Core Framework
- **Next.js 16** with App Router (React Server Components)
- **React 19.2.0**
- **TypeScript 5** (strict mode enabled)
- **Node.js** (ES2017 target)

### Database & Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Prisma 6.19.0** (ORM, output: `lib/generated/prisma`)
- **Direct Supabase REST API** with Zod validation (free tier compatible)
- Row Level Security (RLS) policies enforced

### Styling & UI
- **Tailwind CSS 3.4** with CSS variables
- **shadcn/ui** component library
- **next-themes** for dark mode
- **Radix UI** primitives
- **lucide-react** icons
- **Geist** font family

### AI & LLM
- **OpenAI SDK** (`@ai-sdk/openai`, `ai` SDK)
- **LangChain** for orchestration
- **RAG (Retrieval-Augmented Generation)** for context
- **Vercel AI SDK** for streaming responses

### Payments & Booking
- **Stripe** (deposits, retainers, invoicing, webhooks)
- **Cal.com** integration for booking
- **Resend** for transactional emails

### Content & SEO
- **MDX** via `next-mdx-remote`
- **gray-matter** for frontmatter parsing
- **Satori** for OG images
- **@vercel/og** for dynamic Open Graph images

### Security & Monitoring
- **Sentry** (@sentry/nextjs) for error tracking
- **@upstash/ratelimit** with Redis for rate limiting
- **CSRF protection** (custom implementation)
- **Content filtering** and moderation
- **jose** for JWT handling

### Development Tools
- **ESLint 9** with Next.js config
- **tsx** for running TypeScript scripts
- **Zod 4.1** for runtime validation

## Directory Structure

```
pajamasweb-freelance/
├── app/                          # Next.js App Router (React Server Components)
│   ├── (routes)/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout (Sentry, theme provider)
│   │   ├── globals.css           # Global styles with CSS variables
│   │   └── favicon.ico
│   ├── admin/                    # Admin CMS UI
│   │   ├── layout.tsx            # Admin sidebar layout
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── blog/                 # Blog post management
│   │   ├── case-studies/         # Case study management
│   │   └── images/               # Image uploads
│   ├── api/                      # API Routes (REST endpoints)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── chat/                 # AI chat streaming endpoint
│   │   ├── portal/               # Client portal APIs
│   │   ├── admin/                # Admin APIs (clients, contracts, etc.)
│   │   ├── webhooks/             # Stripe webhooks
│   │   ├── images/               # Image upload/management
│   │   ├── og/                   # Open Graph image generation
│   │   ├── search/               # Search API
│   │   ├── sitemap/              # Dynamic sitemap
│   │   └── robots/               # robots.txt
│   ├── auth/                     # Auth pages (sign-in, sign-up, reset)
│   ├── portal/                   # Client portal UI
│   ├── blog/                     # Blog listing + [slug] pages
│   ├── case-studies/             # Case studies listing + [slug]
│   ├── services/                 # Service pages
│   ├── checkout/                 # Stripe checkout flows
│   ├── book/                     # Cal.com booking page
│   └── chat/                     # AI chat interface
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ... (14 components total)
│   └── [feature-components].tsx  # Feature-specific components
│
├── lib/                          # Shared utilities and services
│   ├── supabase.ts               # Supabase client (browser)
│   ├── supabase-server.ts        # Supabase server client
│   ├── utils.ts                  # cn() utility for classnames
│   ├── validation-schemas.ts     # Centralized Zod schemas
│   ├── query-helpers.ts          # Type-safe DB query helpers
│   ├── auth-service.ts           # Authentication logic
│   ├── client-service.ts         # Client management
│   ├── booking-service.ts        # Booking management
│   ├── invoices-service.ts       # Invoice management
│   ├── storage-service.ts        # Supabase Storage helpers
│   ├── email-service.ts          # Resend email integration
│   ├── pricing.ts                # Pricing logic/heuristics
│   ├── rag-service.ts            # RAG context retrieval
│   ├── embeddings.ts             # Vector embeddings
│   ├── content.ts                # MDX content utilities
│   ├── content-filter.ts         # Content moderation
│   ├── moderation-service.ts     # AI moderation
│   ├── safety-service.ts         # Safety guardrails
│   ├── escalation-service.ts     # Support escalation
│   ├── rate-limit.ts             # Upstash rate limiting
│   ├── csrf-protection.ts        # CSRF token handling
│   ├── audit-logger.ts           # Audit logging
│   ├── og-utils.ts               # OG image generation
│   ├── og-cache.ts               # OG image caching
│   ├── json-ld-schemas.ts        # Structured data for SEO
│   ├── webhook-utils.ts          # Webhook signature verification
│   ├── chat-history.ts           # Chat history management
│   ├── chat-related-items.ts     # Related content for chat
│   ├── tools/                    # AI chat tools (function calling)
│   │   ├── pricing-suggestion.ts
│   │   ├── invoice-status.ts
│   │   ├── booking-status.ts
│   │   └── deliverables.ts
│   └── generated/prisma/         # Prisma generated client (gitignored)
│
├── prisma/
│   └── schema.prisma             # Prisma schema (custom output path)
│
├── scripts/                      # Utility scripts
│   ├── migrations/               # SQL migration files (001-011)
│   ├── run-all-migrations.ts     # Run all migrations
│   ├── setup-supabase.ts         # Initial Supabase setup
│   ├── generate-embeddings.ts    # Generate vector embeddings
│   ├── generate-rag-embeddings.ts # RAG embeddings
│   ├── seed-services.ts          # Seed service data
│   ├── sync-metadata.ts          # Sync content metadata
│   ├── test-*.ts                 # Test scripts (auth, security, performance)
│   └── verify-migrations.js      # Verify migration status
│
├── content/                      # MDX content files (Git-versioned)
│   ├── blog/                     # Blog posts (.mdx)
│   ├── case-studies/             # Case studies (.mdx)
│   └── faqs.json                 # FAQ data
│
├── docs/                         # Project documentation
│   ├── PROJECT_STRUCTURE.md      # This project's structure
│   ├── DEVELOPMENT_ROADMAP.md    # Feature roadmap
│   ├── Pajamasweb_PRD.md         # Product requirements
│   ├── REST_API_ZOD_GUIDE.md     # API + Zod patterns
│   ├── QUERY_PATTERNS_REFERENCE.md # Query helper patterns
│   ├── PRISMA_QUICK_START.md     # Prisma setup
│   ├── ZOD_USAGE_EXAMPLES.md     # Zod validation examples
│   ├── MIGRATION_GUIDE.md        # Migration guide
│   ├── features/                 # Feature-specific docs
│   ├── ai-chat/                  # AI chat documentation
│   ├── calcom/                   # Cal.com integration docs
│   ├── database/                 # Database schemas
│   └── archive/                  # Historical phase summaries
│
├── public/                       # Static assets
├── .vscode/settings.json         # VS Code settings
├── components.json               # shadcn/ui configuration
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config (Sentry, image domains)
├── package.json                  # Dependencies and scripts
└── .gitignore                    # Git ignore rules
```

## Code Conventions & Patterns

### TypeScript Best Practices
- **Strict mode enabled**: All TypeScript strict checks are on
- **No `any` types**: Use proper typing or `unknown` with type guards
- **Path aliases**: Use `@/*` to import from project root
- **JSX runtime**: `react-jsx` (no need to import React)
- **Module resolution**: `bundler` mode

### File Naming Conventions
- **React components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities/services**: kebab-case (e.g., `auth-service.ts`)
- **API routes**: `route.ts` (Next.js App Router convention)
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx`
- **Scripts**: kebab-case (e.g., `run-all-migrations.ts`)

### Component Patterns
- **Server Components by default**: Use `"use client"` only when needed
- **Client components**: Interactive UI, hooks, browser APIs, event handlers
- **Server components**: Data fetching, direct DB access, no state
- **shadcn/ui**: All UI components are in `components/ui/`
- **Composition over props drilling**: Use React Context or composition patterns

### Database Patterns (Supabase + Zod)

#### ✅ ALWAYS Use This Pattern
```typescript
// 1. Define Zod schema in lib/validation-schemas.ts
export const bookingSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
  booking_date: z.string().datetime(),
  // ... more fields
})
export type Booking = z.infer<typeof bookingSchema>

// 2. Use query helpers from lib/query-helpers.ts
import { getBooking, listBookings } from '@/lib/query-helpers'

const booking = await getBooking(bookingId) // Type-safe, validated
const bookings = await listBookings(clientId) // Type-safe array
```

#### ❌ NEVER Use Direct Supabase Queries Without Validation
```typescript
// DON'T DO THIS - No type safety, no validation
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('id', bookingId)
  .single()
```

### API Route Patterns

#### Standard API Route Structure
```typescript
// app/api/[resource]/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { someSchema } from '@/lib/validation-schemas'

export async function GET(req: Request) {
  try {
    // 1. Extract auth token
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify user
    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Validate input with Zod
    const input = someSchema.parse(await req.json())

    // 4. Business logic (use service layer)
    const result = await someService(user.id, input)

    // 5. Return response
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Authentication Patterns

#### Server-Side Auth (API Routes)
```typescript
import { createServerSupabaseClient } from '@/lib/auth-service'

const supabase = createServerSupabaseClient()
const { data: { user }, error } = await supabase.auth.getUser(token)
```

#### Client-Side Auth (React Components)
```typescript
import { createClientSupabaseClient } from '@/lib/auth-service'

const supabase = createClientSupabaseClient()
const { data: { session } } = await supabase.auth.getSession()
```

### Security Patterns

#### Rate Limiting
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
})

const { success } = await ratelimit.limit(userId)
if (!success) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

#### CSRF Protection
```typescript
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf-protection'

// Generate token (on page load)
const token = await generateCSRFToken()

// Validate token (on form submission)
const isValid = await validateCSRFToken(token)
```

#### Row Level Security (RLS)
- All Supabase tables use RLS policies
- Policies are defined in `scripts/migrations/*.sql`
- NEVER bypass RLS by using service role key for user operations
- Use service role key ONLY for admin operations

### AI Chat Patterns

#### Streaming Responses
```typescript
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

const result = streamText({
  model: openai('gpt-4-turbo'),
  messages: convertToModelMessages(messages),
  tools: {
    pricingSuggestion: pricingSuggestionTool,
    invoiceStatus: invoiceStatusTool,
    // ... more tools
  },
  system: 'You are a helpful assistant...',
})

return result.toDataStreamResponse()
```

#### RAG Context Retrieval
```typescript
import { retrieveRAGContext } from '@/lib/rag-service'

const context = await retrieveRAGContext(query, userId)
// Use context in system prompt
```

### Content Management (MDX)

#### Content File Structure
```mdx
---
title: "Blog Post Title"
date: "2024-01-15"
description: "Brief description"
tags: ["tag1", "tag2"]
image: "/images/hero.jpg"
---

# Content goes here

Regular markdown/MDX content...
```

#### Parsing Content
```typescript
import { getAllPosts, getPostBySlug } from '@/lib/content'

const posts = await getAllPosts('blog')
const post = await getPostBySlug('blog', slug)
```

### Stripe Integration

#### Webhook Handler Pattern
```typescript
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle payment success
      break
    case 'invoice.paid':
      // Handle invoice payment
      break
    // ... more event types
  }

  return new Response('OK', { status: 200 })
}
```

## Environment Variables

### Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DATABASE_URL=postgresql://xxx
DIRECT_URL=postgresql://xxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Resend (Email)
RESEND_API_KEY=re_xxx

# Sentry
SENTRY_AUTH_TOKEN=xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Cal.com (Optional)
NEXT_PUBLIC_CALCOM_EMBED_URL=https://cal.com/xxx

# Site Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Environment File Locations
- `.env.local` - Local development (gitignored)
- `.env.example` - Example template (not present, create one if needed)
- `.env.sentry-build-plugin` - Sentry build config (gitignored)

## Database Management

### Migrations
- **Location**: `scripts/migrations/001-011_*.sql`
- **Runner**: `npm run migrate` or `tsx scripts/run-all-migrations.ts`
- **Pattern**: Sequential numbering (001, 002, 003...)
- **Testing**: `tsx scripts/verify-migrations.js`

### Migration Workflow
```bash
# 1. Create new migration file
# scripts/migrations/012_new_feature.sql

# 2. Write SQL migration
CREATE TABLE IF NOT EXISTS new_table (...);

# 3. Run migration
npm run migrate

# 4. Verify migration
tsx scripts/verify-migrations.js
```

### Prisma Workflow
```bash
# Generate Prisma client (after schema changes)
npx prisma generate

# Reset database (CAUTION: deletes all data)
npx prisma db push --force-reset

# Open Prisma Studio
npx prisma studio
```

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Testing
```bash
# Test authentication
npm run test:auth

# Test security features
npm run test:security

# Test performance
npm run test:performance

# Run specific test script
tsx scripts/test-[feature].ts
```

### Building for Production
```bash
# Build the application
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Setup
```bash
# Initial Supabase setup
tsx scripts/setup-supabase.ts

# Run all migrations
npm run migrate

# Seed services data
tsx scripts/seed-services.ts

# Generate embeddings for RAG
tsx scripts/generate-rag-embeddings.ts
```

## Common Tasks

### Adding a New API Endpoint

1. **Create route file**: `app/api/[resource]/route.ts`
2. **Define Zod schema**: Add to `lib/validation-schemas.ts`
3. **Create service layer**: `lib/[resource]-service.ts` (if needed)
4. **Implement route handler**: Use standard API route pattern
5. **Add error handling**: Zod validation + try/catch
6. **Test endpoint**: Create test script in `scripts/`

### Adding a New Database Table

1. **Create migration**: `scripts/migrations/0XX_table_name.sql`
2. **Define table schema**: Include RLS policies
3. **Run migration**: `npm run migrate`
4. **Add Zod schema**: `lib/validation-schemas.ts`
5. **Add query helpers**: `lib/query-helpers.ts`
6. **Test queries**: Create test script

### Adding a New UI Component

1. **Use shadcn/ui if available**: `npx shadcn@latest add [component]`
2. **Or create custom**: `components/ComponentName.tsx`
3. **Follow naming**: PascalCase, descriptive names
4. **Use TypeScript**: Properly typed props
5. **Import via alias**: `import { Component } from '@/components/Component'`

### Adding a New AI Chat Tool

1. **Create tool file**: `lib/tools/[tool-name].ts`
2. **Define tool schema**: Use Zod for parameters
3. **Implement tool logic**: Query database, call APIs, etc.
4. **Export tool**: Follow existing tool patterns
5. **Register in chat route**: `app/api/chat/route.ts`
6. **Test tool**: Use chat interface

### Adding a New Page

1. **Create page file**: `app/[route]/page.tsx`
2. **Use Server Component**: Fetch data directly in component
3. **Add metadata**: Use `generateMetadata` for SEO
4. **Add to navigation**: Update navigation components
5. **Add to sitemap**: Will auto-generate if dynamic

## Testing Scripts

### Available Test Scripts
- `test-auth.ts` - Authentication flow testing
- `test-security.ts` - Security features (CSRF, rate limiting)
- `test-performance.ts` - Performance benchmarks
- `test-pricing.ts` - Pricing logic validation
- `test-query-helpers.ts` - Database query helpers
- `test-rls-policies.ts` - RLS policy verification
- `test-service-files.ts` - Service layer testing
- `test-phase5-api.ts` - API endpoint testing
- `test-phase5-features.ts` - Feature integration testing
- `test-phase6-safety.ts` - AI safety guardrails testing
- `test-client-tools.ts` - AI chat tools testing

### Running Tests
```bash
# Run specific test
tsx scripts/test-[feature].ts

# Example: Test authentication
tsx scripts/test-auth.ts

# Example: Test security
tsx scripts/test-security.ts
```

## AI Assistant Guidelines

### When Working on This Project

1. **Always Read Before Modifying**
   - Read existing files before suggesting changes
   - Understand current patterns and conventions
   - Maintain consistency with existing code

2. **Follow Established Patterns**
   - Use Zod validation for all inputs/outputs
   - Use query helpers instead of direct Supabase queries
   - Follow the API route structure
   - Use service layer for business logic

3. **Security First**
   - NEVER bypass RLS policies
   - Always validate user input with Zod
   - Implement rate limiting for public endpoints
   - Use CSRF protection for state-changing operations
   - Never expose sensitive credentials

4. **Type Safety**
   - Use Zod schemas for runtime validation
   - Infer TypeScript types from Zod schemas
   - No `any` types unless absolutely necessary
   - Properly type all function parameters and returns

5. **Performance Considerations**
   - Use Server Components for static content
   - Client Components only when needed
   - Optimize images with Next.js Image component
   - Cache OG images
   - Use Supabase edge functions for heavy computation

6. **Documentation**
   - Update CLAUDE.md when making architectural changes
   - Document new patterns in relevant docs/
   - Add JSDoc comments for complex functions
   - Update README.md if user-facing changes

7. **Testing**
   - Create test scripts for new features
   - Verify migrations before committing
   - Test authentication flows
   - Test RLS policies

8. **Git Workflow**
   - Work on feature branches (claude/*)
   - Commit with clear, descriptive messages
   - Push to designated branch only
   - Never force push to main/master

### Common Pitfalls to Avoid

- ❌ Using direct Supabase queries without Zod validation
- ❌ Bypassing RLS with service role key for user operations
- ❌ Missing error handling in API routes
- ❌ Not validating user input
- ❌ Using `any` types
- ❌ Client Components when Server Components would work
- ❌ Hardcoding sensitive values
- ❌ Missing rate limiting on public endpoints
- ❌ Not testing RLS policies
- ❌ Modifying files without reading them first

### Best Practices

- ✅ Use Server Components by default
- ✅ Validate all inputs with Zod
- ✅ Use query helpers for database operations
- ✅ Implement rate limiting for APIs
- ✅ Use CSRF protection
- ✅ Follow the service layer pattern
- ✅ Write clear error messages
- ✅ Add proper TypeScript types
- ✅ Test security features
- ✅ Document new patterns

## Key Documentation References

### Essential Docs (Read First)
- `docs/PROJECT_STRUCTURE.md` - Project organization
- `docs/DEVELOPMENT_ROADMAP.md` - Feature roadmap and status
- `docs/Pajamasweb_PRD.md` - Product requirements
- `docs/REST_API_ZOD_GUIDE.md` - API + Zod patterns (IMPORTANT)
- `docs/QUERY_PATTERNS_REFERENCE.md` - Database query patterns

### Feature-Specific Docs
- `docs/ai-chat/` - AI chat implementation
- `docs/calcom/` - Cal.com booking integration
- `docs/features/01-content-management/` - Content management system
- `docs/database/` - Database schemas and migrations

### Implementation Guides
- `docs/PRISMA_QUICK_START.md` - Prisma setup
- `docs/ZOD_USAGE_EXAMPLES.md` - Zod validation patterns
- `docs/MIGRATION_GUIDE.md` - Database migrations
- `docs/SECURITY_IMPLEMENTATION_SUMMARY.md` - Security features

### Quick References
- `START_HERE.md` - Quick start guide
- `QUICK_REFERENCE_GUIDE.md` - Common tasks reference
- `API_ENDPOINTS_REFERENCE.md` - API endpoint documentation

## Troubleshooting

### Common Issues

**Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Regenerate Prisma client: `npx prisma generate`
- Check environment variables

**Database Connection Issues**
- Verify `DATABASE_URL` and `DIRECT_URL` are set
- Check Supabase project is active
- Test with `tsx scripts/verify-migrations.js`

**Authentication Issues**
- Check Supabase URL and keys
- Verify RLS policies are applied
- Test with `npm run test:auth`

**TypeScript Errors**
- Run `npm install` to update types
- Check `tsconfig.json` paths
- Regenerate Prisma client

**Stripe Webhook Issues**
- Verify webhook secret is correct
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check webhook signature validation

## Version Information

- **Next.js**: 16.0.2
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Node.js**: ES2017+ required
- **Prisma**: 6.19.0
- **Supabase JS**: 2.81.1
- **Zod**: 4.1.12
- **Stripe**: 19.3.1

## Project Status

**Current State**: Production-ready with all core features implemented
- ✅ Content Management (MDX + Admin CMS)
- ✅ Services & Checkout (Stripe integration)
- ✅ Booking & Calendar (Cal.com)
- ✅ AI Chat (RAG + Safety features)
- ✅ Client Portal (Authentication + File management)
- ✅ Security & Performance optimizations
- ✅ SEO & OG images

**Recent Commits**:
- `ed2143a` - Fix TypeScript errors in Stripe webhook handler
- `842a474` - Lazy initialize Supabase client in Stripe webhook
- `aaa41f5` - Complete project implementation with all features

---

**Last Updated**: 2025-11-27
**For Questions**: Refer to docs/ folder or existing code patterns
