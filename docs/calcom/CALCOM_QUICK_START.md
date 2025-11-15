# Cal.com Quick Start Checklist

## 🚀 Get Started in 5 Steps

### Step 1: Cal.com Setup (10 minutes)
- [ ] Create account at [cal.com](https://cal.com)
- [ ] Connect Google Calendar
- [ ] Create "Intro Call" event type (30 min duration)
- [ ] Note your username and event type slug

### Step 2: Generate Credentials (5 minutes)
- [ ] Go to Settings → API Keys
- [ ] Create API key (copy the `cal_test_xxxxx` value)
- [ ] Go to Settings → Webhooks
- [ ] Create webhook pointing to `https://yourdomain.com/api/webhooks/calcom`
- [ ] Copy webhook secret

### Step 3: Resend Setup (5 minutes)
- [ ] Create account at [resend.com](https://resend.com)
- [ ] Create API key
- [ ] Verify sender email domain

### Step 4: Database Setup (5 minutes)
- [ ] Open Supabase SQL Editor
- [ ] Copy SQL from `scripts/migrations/001_create_bookings_table.sql`
- [ ] Execute the migration
- [ ] Verify tables created: `bookings`, `booking_history`

### Step 5: Environment Variables (5 minutes)
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in:
  ```env
  NEXT_PUBLIC_CALCOM_LINK=your-username/intro-call
  CALCOM_API_KEY=cal_test_xxxxx
  CALCOM_WEBHOOK_SECRET=webhook_secret_xxxxx
  RESEND_API_KEY=re_xxxxx
  RESEND_FROM_EMAIL=bookings@yourdomain.com
  ```

## ✅ Verification Steps

### Local Testing
```bash
# Start dev server
npm run dev

# Visit booking page
# http://localhost:3000/book

# Make a test booking
# Check Supabase for booking record
# Check email inbox for confirmation
```

### Production Deployment
- [ ] Update environment variables in hosting platform
- [ ] Ensure webhook URL is publicly accessible
- [ ] Make test booking in Cal.com
- [ ] Verify booking appears in Supabase
- [ ] Verify confirmation email received

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/book/page.tsx` | Booking page with Cal.com embed |
| `app/api/webhooks/calcom/route.ts` | Webhook handler |
| `lib/booking-service.ts` | Database operations |
| `lib/email-service.ts` | Email sending |
| `lib/webhook-utils.ts` | Webhook verification |
| `scripts/migrations/001_create_bookings_table.sql` | Database schema |

## 🔗 Useful Links

- [Cal.com Documentation](https://cal.com/docs)
- [Cal.com API Reference](https://cal.com/docs/api)
- [Resend Documentation](https://resend.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Troubleshooting

**Webhook not receiving events?**
- Verify webhook URL is publicly accessible
- Check webhook secret matches in Cal.com settings
- Review Cal.com webhook logs

**Emails not sending?**
- Verify Resend API key is correct
- Check sender email is verified in Resend
- Review Resend dashboard for errors

**Bookings not in database?**
- Check Supabase connection
- Verify RLS policies are enabled
- Check webhook handler logs

## 📊 What's Included

✅ Cal.com embed on `/book` page
✅ Webhook handler for booking events
✅ Email confirmations via Resend
✅ Database schema with RLS
✅ Booking management utilities
✅ Audit trail for all changes
✅ Error handling and logging

## ⏱️ Timeline

- Setup: 30 minutes
- Testing: 20 minutes
- Deployment: 15 minutes
- **Total: ~1 hour**

## 🎯 Next Steps After Setup

1. **Add booking management UI** (optional)
   - View upcoming bookings
   - Cancel bookings
   - Reschedule bookings

2. **Add reminders** (optional)
   - 24-hour reminder email
   - 1-hour reminder email

3. **Add analytics** (optional)
   - Track booking completion rate
   - Monitor email delivery
   - Track user satisfaction

## 📞 Support

For detailed setup instructions, see `docs/CALCOM_SETUP_GUIDE.md`
For implementation details, see `docs/CALCOM_IMPLEMENTATION_SUMMARY.md`

