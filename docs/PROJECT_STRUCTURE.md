# Project structure

High-level map of the repo. For feature status see [REMAINING_FEATURES_BREAKDOWN.md](./REMAINING_FEATURES_BREAKDOWN.md).

## Directory layout

```
pajamasweb-freelance/
├── app/                          # Next.js App Router (v16)
│   ├── admin/                    # Owner CMS: dashboard, clients, invoices, payments, blog, images, …
│   ├── api/                      # Route handlers (REST): auth, portal, admin, webhooks, cron, OG, sitemap, …
│   ├── auth/                     # Sign-in, sign-up, password reset, invitation accept, callback UI
│   ├── portal/                   # Client / SALES / DEV dashboard (sidebar layout)
│   ├── blog/, case-studies/      # MDX-backed content pages
│   ├── services/, checkout/, book/
│   ├── chat/                     # Full-page chat (optional entry)
│   ├── layout.tsx, page.tsx, globals.css
│   └── ...
├── components/                   # UI: ChatWidget, checkout, admin forms, JsonLdScript, …
│   └── ui/                       # shadcn-style primitives
├── content/                      # MDX sources (blog, case studies)
├── lib/                          # Supabase, Stripe, auth, services, RAG, validation-schemas, rate-limit, …
├── scripts/                      # sync-metadata, migrations runner, seed, test utilities
├── tests/e2e/                    # Playwright (e.g. accessibility)
├── docs/                         # Product & technical documentation
├── proxy.ts                      # Next.js 16 proxy: /admin/* and /portal/* auth + CSRF cookie
├── next.config.ts
├── package.json
└── ...
```

## Request interception (auth)

- **[proxy.ts](../proxy.ts)** — `export async function proxy` with `config.matcher` for `/admin/:path*` and `/portal/:path*`. Admin uses JWT cookie; portal uses Supabase session cookie. Not named `middleware.ts` (Next 16 convention).

## Key technologies

- **Next.js 16** — App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v3** + **shadcn/ui**
- **Supabase** — Postgres, Auth, Storage (RLS via `scripts/migrations/`)
- **Stripe** — Checkout, subscriptions, invoicing, webhooks
- **next-mdx-remote** + **gray-matter** — MDX content (no Contentlayer)
- **Vercel Analytics** + **Sentry**
- **Upstash Redis** — rate limiting (where configured)
- **AI SDK** / **LangChain** — chat + tools

## Common commands

```bash
npm run dev
npm run build
npm start
npm run lint
npm run test:a11y
npm run migrate
npm run seed
```

## Environment variables (minimal)

See [.env.local](../.env.local) (not committed) and [PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md). Typically:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (canonical; some code paths also accept `SUPABASE_SERVICE_ROLE_SECRET_KEY`)
- `SUPABASE_JWT_SECRET` (admin JWT / verification)
- Stripe, Resend, OpenAI, Upstash, Sentry, cron secrets as needed for deployed features

## Documentation index

- [docs/README.md](./README.md)
