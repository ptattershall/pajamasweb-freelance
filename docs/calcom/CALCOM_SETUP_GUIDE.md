# Cal.com Integration Setup Guide

## Overview
This guide walks you through setting up the Cal.com booking feature for PajamasWeb.

## Step 1: Create Cal.com Account

1. Visit [cal.com](https://cal.com) and sign up
2. Complete your profile setup
3. Connect your Google Calendar:
   - Go to Settings → Integrations
   - Click "Google Calendar"
   - Authorize and connect your calendar

## Step 2: Create Event Type

1. In Cal.com dashboard, go to "Event Types"
2. Click "Create New Event Type"
3. Configure:
   - **Title**: "Intro Call" or "Discovery Call"
   - **Duration**: 30 minutes
   - **Description**: "Let's discuss your project"
   - **Calendar**: Select your Google Calendar
4. Note your event type slug (e.g., `intro-call`)

## Step 3: Generate API Key & Webhook Secret

1. Go to Settings → API Keys
2. Create a new API key:
   - Name: "PajamasWeb Webhook"
   - Copy the key (starts with `cal_`)
3. Go to Settings → Webhooks
4. Create a new webhook:
   - URL: `https://yourdomain.com/api/webhooks/calcom`
   - Events: Select "Booking Created", "Booking Rescheduled", "Booking Cancelled"
   - Copy the webhook secret

## Step 4: Set Up Database

1. Run the migration to create tables:
   ```bash
   # Copy the SQL from scripts/migrations/001_create_bookings_table.sql
   # Paste into Supabase SQL Editor and execute
   ```

2. Verify tables were created:
   - `bookings`
   - `booking_history`

## Step 5: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in the values:
   ```env
   # Cal.com
   NEXT_PUBLIC_CALCOM_LINK=your-username/intro-call
   CALCOM_API_KEY=cal_test_xxxxx
   CALCOM_WEBHOOK_SECRET=webhook_secret_xxxxx
   
   # Resend
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=bookings@yourdomain.com
   
   # Supabase (already configured)
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

## Step 6: Get Resend API Key

1. Visit [resend.com](https://resend.com)
2. Sign up or log in
3. Go to API Keys
4. Create a new API key
5. Verify your sender email domain

## Step 7: Test Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/book`
3. You should see the Cal.com embed
4. Test booking a call

## Step 8: Deploy to Production

1. Update environment variables in your hosting platform
2. Ensure webhook URL is publicly accessible:
   ```
   https://yourdomain.com/api/webhooks/calcom
   ```
3. Test webhook delivery:
   - Make a test booking in Cal.com
   - Check Supabase for the booking record
   - Verify email was sent

## Step 9: Monitor & Verify

1. **Check Supabase**:
   - Query `bookings` table
   - Verify new bookings appear

2. **Check Resend**:
   - Go to Resend dashboard
   - Verify emails are being sent
   - Check delivery rates

3. **Check Cal.com**:
   - Verify bookings appear in your calendar
   - Test rescheduling and cancellation

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check webhook secret in Cal.com settings
- Review webhook logs in Cal.com dashboard

### Emails Not Sending
- Verify Resend API key is correct
- Check sender email is verified in Resend
- Review Resend dashboard for errors

### Bookings Not Appearing in Database
- Check Supabase connection
- Verify RLS policies are correct
- Check webhook handler logs

## Files Created

- `app/book/page.tsx` - Booking page with Cal.com embed
- `app/api/webhooks/calcom/route.ts` - Webhook handler
- `lib/webhook-utils.ts` - Webhook verification utilities
- `lib/booking-service.ts` - Booking database operations
- `lib/email-service.ts` - Email sending with Resend
- `scripts/migrations/001_create_bookings_table.sql` - Database schema
- `.env.local.example` - Environment variables template

## Next Steps

1. ✅ Set up Cal.com account
2. ✅ Create event type
3. ✅ Generate API key and webhook secret
4. ✅ Set up database
5. ✅ Configure environment variables
6. ✅ Get Resend API key
7. ✅ Test locally
8. ✅ Deploy to production
9. ✅ Monitor and verify

## Support

For issues or questions:
- Cal.com Docs: https://cal.com/docs
- Resend Docs: https://resend.com/docs
- Supabase Docs: https://supabase.com/docs

