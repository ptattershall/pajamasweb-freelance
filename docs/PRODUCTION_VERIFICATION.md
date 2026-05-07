# Production verification

Before going live, confirm the following.

## Sentry

- **DSN:** Set `SENTRY_DSN` (server/edge) and `NEXT_PUBLIC_SENTRY_DSN` (client) in production env. If unset, the app falls back to the default DSN in code.
- **Sampling:** In production, `tracesSampleRate` is set to `0.1` (10%) in [sentry.server.config.ts](../sentry.server.config.ts), [instrumentation-client.ts](../instrumentation-client.ts), and [sentry.edge.config.ts](../sentry.edge.config.ts) to limit volume. Adjust in code or via a future env var if needed.
- **PII:** `sendDefaultPii: true` is enabled. If you must avoid sending IP/email to Sentry for GDPR, set it to `false` in the Sentry config files.

## Stripe

- **Webhook:** The app verifies webhook signatures using the raw request body and `STRIPE_WEBHOOK_SECRET`. In production:
  - Register the webhook endpoint in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks) (e.g. `https://yourdomain.com/api/webhooks/stripe`).
  - Use the **Dashboard** endpoint’s signing secret (`whsec_...`) in `STRIPE_WEBHOOK_SECRET`. Do **not** use the secret from `stripe listen` (CLI) in production.
- **Keys:** Use live API keys in production; keep test keys for local/staging.

## Supabase

- **URLs and keys:** Set production `NEXT_PUBLIC_SUPABASE_URL` and **`SUPABASE_SERVICE_ROLE_KEY`** (canonical; matches [lib/supabase-server.ts](../lib/supabase-server.ts) and most API routes). Some scripts also accept `SUPABASE_SERVICE_ROLE_SECRET_KEY` as an alias; the Stripe webhook resolves the service role key in that order. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` where the client or proxy verifies sessions.
- **Auth:** Configure Site URL and Redirect URLs in Supabase Dashboard → Authentication → URL Configuration per [SECURITY_AND_SUPABASE_CONFIG.md](SECURITY_AND_SUPABASE_CONFIG.md).
- **RLS:** Apply all migrations in `scripts/migrations/` in order. In Dashboard → Database → Tables, confirm RLS is **Enabled** and policies match the migrations (see [SECURITY_AND_SUPABASE_CONFIG.md](SECURITY_AND_SUPABASE_CONFIG.md)).
