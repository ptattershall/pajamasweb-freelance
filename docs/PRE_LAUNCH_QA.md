# Pre-launch QA checklist

Use this checklist before going live.

## Cross-browser

Smoke-test critical paths on **Chrome, Firefox, Safari, Edge**:

| Path                                  | Chrome | Firefox | Safari | Edge  |
|---------------------------------------|--------|---------|--------|-------|
| Home `/`                              | ☐      | ☐       | ☐      | ☐     |
| Services `/services`                  | ☐      | ☐       | ☐      | ☐     |
| Book `/book`                          | ☐      | ☐       | ☐      | ☐     |
| Checkout success (after test payment) | ☐      | ☐       | ☐      | ☐     |
| Portal sign-in and dashboard          | ☐      | ☐       | ☐      | ☐     |

Check: layout, forms, navigation, no console errors.

## Performance

- Run **Lighthouse** (Performance) on `/`, `/services`, `/blog`. Address any critical regressions (e.g. LCP &gt; 2.5s, CLS &gt; 0.1).
- Optional: add Lighthouse CI to a branch or PR to enforce budgets.

## Security

- **Headers:** Confirmed in [next.config.ts](../next.config.ts): X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy.
- **Auth:** See [SECURITY_AND_SUPABASE_CONFIG.md](SECURITY_AND_SUPABASE_CONFIG.md) for callback and confirm-email behavior; verify redirect URLs and RLS in Supabase Dashboard.
- **Stripe:** Webhook uses raw body and `constructEvent`; production must use the **Dashboard** webhook endpoint secret (not Stripe CLI). See [PRODUCTION_VERIFICATION.md](PRODUCTION_VERIFICATION.md).

## Accessibility

- Re-run `npm run test:a11y` (axe on key routes). See [ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md).

## Load and UAT

- **Load (optional):** Use k6 or Artillery on key API routes (e.g. `/api/chat`, `/api/search`) if you expect high traffic.
- **UAT:** Short script or walkthrough for stakeholder (sign up, book, pay, portal).
