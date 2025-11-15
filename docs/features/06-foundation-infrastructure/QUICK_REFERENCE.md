# Foundation & Infrastructure - Quick Reference

## Phase Status at a Glance

```
Phase 1: Next.js Setup          ✅ COMPLETE
Phase 2: Design System          ✅ COMPLETE
Phase 3: Supabase Setup         ✅ COMPLETE
Phase 4: Authentication         ✅ COMPLETE
Phase 5: Database Schema        ✅ COMPLETE
Phase 6: Email (Resend)         ✅ COMPLETE
Phase 7: Analytics              🔄 IN PROGRESS (0%)
Phase 8: Performance            🔄 IN PROGRESS (50%)
Phase 9: Security               🔄 IN PROGRESS (40%)
Phase 10: SEO                   ⬜ NOT STARTED (0%)
```

## Key Files & Locations

| Component | File | Status |
|-----------|------|--------|
| Next.js Config | `next.config.ts` | ✅ |
| Tailwind Config | `tailwind.config.js` | ✅ |
| TypeScript Config | `tsconfig.json` | ✅ |
| Supabase Client | `lib/supabase.ts` | ✅ |
| Middleware | `middleware.ts` | ✅ |
| Database Migrations | `docs/database/*.sql` | ✅ |
| Global Styles | `app/globals.css` | ✅ |
| Layout | `app/layout.tsx` | ✅ |

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
RESEND_API_KEY

# Optional
UPSTASH_REDIS_REST_URL
STRIPE_SECRET_KEY
CALCOM_API_KEY
```

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data

# Testing
npm run test             # Run Vitest
npm run test:e2e         # Run Playwright
npm run test:a11y        # Run accessibility tests

# Deployment
npm run build            # Build
npm start                # Start production server
```

## Critical Paths

### User Authentication
1. User signs up → Supabase Auth
2. Email verification → Resend
3. JWT token created → HTTP-only cookie
4. Protected routes → Middleware verification

### Payment Processing
1. User initiates payment → Stripe Checkout
2. Payment confirmed → Webhook handler
3. Record in database → Payment table
4. Email receipt → Resend

### Booking Integration
1. User selects time → Cal.com calendar
2. Booking confirmed → Cal.com webhook
3. Record in database → Bookings table
4. Confirmation email → Resend

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ⏳ TBD |
| FID | < 100ms | ⏳ TBD |
| CLS | < 0.1 | ⏳ TBD |
| Lighthouse | > 90 | ⏳ TBD |

## Security Checklist

- [x] RLS policies on all tables
- [x] JWT validation in middleware
- [x] HTTP-only cookies
- [x] Rate limiting with Upstash
- [ ] CSP headers
- [ ] HSTS configuration
- [ ] CSRF protection
- [ ] Security audit

## Documentation Files

- `feature.md` - Feature specification (updated)
- `IMPLEMENTATION_STATUS.md` - Current status
- `TECHNICAL_SUMMARY.md` - Architecture details
- `NEXT_STEPS.md` - Action plan
- `COMPLETION_REPORT.md` - Full report
- `QUICK_REFERENCE.md` - This file

## Support Resources

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs
- Stripe: https://stripe.com/docs
- Resend: https://resend.com/docs

