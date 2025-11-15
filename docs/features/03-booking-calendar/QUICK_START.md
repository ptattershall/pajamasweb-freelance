# Booking & Calendar Feature - Quick Start Guide

## 5-Minute Setup

### 1. Create Cal.com Account
```bash
# Visit https://cal.com and sign up
# Connect Google Calendar
# Create event type (e.g., "intro-call")
# Generate API key from settings
```

### 2. Set Environment Variables
```env
CALCOM_API_KEY=cal_test_xxxxx
CALCOM_WEBHOOK_SECRET=webhook_secret_xxxxx
RESEND_API_KEY=re_xxxxx
ENCRYPTION_KEY=your-32-byte-hex-key
```

### 3. Create Database Tables
```sql
-- Run migrations from feature.md Database Schema section
-- Enable RLS on all tables
-- Test RLS policies
```

### 4. Implement Webhook Handler
```typescript
// Create app/api/webhooks/calcom/route.ts
// Copy webhook handler from feature.md
// Verify signature implementation
```

### 5. Add Booking Page
```typescript
// Create app/book/page.tsx
// Embed Cal.com widget
// Add event listeners
// Test booking flow
```

## Key Files to Create

```
app/
├── api/
│   ├── webhooks/
│   │   └── calcom/route.ts
│   └── auth/
│       └── google/
│           ├── route.ts
│           └── callback/route.ts
├── book/
│   └── page.tsx
└── settings/
    └── calendar/
        └── page.tsx

lib/
├── webhook-utils.ts
├── email-service.ts
├── booking-service.ts
├── encryption.ts
├── availability.ts
└── calendar-event.ts

emails/
├── BookingConfirmation.tsx
├── BookingReminder.tsx
└── BookingCancellation.tsx

tests/
├── unit/
│   ├── webhook-verification.test.ts
│   └── availability.test.ts
├── integration/
│   ├── booking-webhook.test.ts
│   └── email-delivery.test.ts
└── e2e/
    ├── booking-flow.spec.ts
    └── oauth-flow.spec.ts
```

## Testing Checklist

- [ ] Webhook signature verification works
- [ ] Booking created in database
- [ ] Confirmation email sent
- [ ] Calendar event created
- [ ] Reminders scheduled
- [ ] Error handling works
- [ ] Rate limiting active
- [ ] RLS policies enforced

## Deployment Steps

1. Configure all environment variables
2. Run database migrations
3. Test webhook endpoint publicly
4. Deploy to staging
5. Run full E2E test suite
6. Deploy to production
7. Monitor webhook delivery
8. Verify email delivery

## Common Commands

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Deploy
npm run deploy

# Check webhook logs
npm run logs:webhook

# Verify email delivery
npm run check:emails
```

## Support Resources

- Cal.com Docs: https://cal.com/docs
- Google Calendar API: https://developers.google.com/calendar
- Resend Docs: https://resend.com/docs
- Feature Document: ./feature.md

