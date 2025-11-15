# Cal.com Booking Deployment Guide

**Status:** Ready to Deploy  
**Estimated Time:** 45 minutes  
**Difficulty:** Easy  

---

## 📋 Overview

Your Cal.com booking system is **100% built and production-ready**. This guide walks you through the 7-step deployment process.

### What's Already Built
✅ Booking page at `/book` with Cal.com embed  
✅ Webhook handler for booking events  
✅ Database schema with RLS policies  
✅ Email service integration (Resend)  
✅ Booking management functions  

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Cal.com Account (10 minutes)

1. Go to https://cal.com
2. Click "Sign up" and create account
3. Complete your profile:
   - Name
   - Email
   - Timezone
4. Connect Google Calendar:
   - Click "Connect Calendar"
   - Select Google Calendar
   - Authorize access
5. Create Event Type:
   - Click "Event Types" → "Create"
   - Name: "Intro Call"
   - Duration: 30 minutes
   - Availability: Your preferred hours
   - Click "Save"
6. **Note your username** (visible in URL: cal.com/YOUR_USERNAME)

**Result:** You'll have a Cal.com link like `your-username/intro-call`

---

### Step 2: Generate Credentials (10 minutes)

#### API Key
1. Go to Cal.com Settings → API Keys
2. Click "Create API Key"
3. Copy the key (format: `cal_test_xxxxx`)
4. **Save this value** for Step 4

#### Webhook Secret
1. Go to Cal.com Settings → Webhooks
2. Click "Create Webhook"
3. **Webhook URL:** `https://yourdomain.com/api/webhooks/calcom`
   - For local testing: `http://localhost:3000/api/webhooks/calcom`
4. **Events:** Select all booking events
5. Copy the webhook secret (format: `webhook_secret_xxxxx`)
6. **Save this value** for Step 4

---

### Step 3: Set Up Resend Email (5 minutes)

1. Go to https://resend.com
2. Click "Sign up"
3. Create account and verify email
4. Go to API Keys
5. Click "Create API Key"
6. Copy the key (format: `re_xxxxx`)
7. **Save this value** for Step 4

**Optional:** Verify your domain for better deliverability
- Go to Domains
- Add your domain
- Follow DNS verification steps

---

### Step 4: Configure Environment Variables (10 minutes)

1. In your project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in these values:

   ```env
   # Cal.com Configuration
   NEXT_PUBLIC_CALCOM_LINK=your-username/intro-call
   CALCOM_API_KEY=cal_test_xxxxx
   CALCOM_WEBHOOK_SECRET=webhook_secret_xxxxx

   # Resend Email Service
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=bookings@yourdomain.com

   # Application URLs
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/api/webhooks/calcom
   ```

3. **For production deployment:**
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
   - Update `NEXT_PUBLIC_WEBHOOK_URL` to production webhook URL
   - Update `RESEND_FROM_EMAIL` to your verified domain

---

### Step 5: Run Database Migration (10 minutes)

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy the entire contents of:
   ```
   scripts/migrations/001_create_bookings_table.sql
   ```
5. Paste into SQL Editor
6. Click "Run"
7. Verify success (no errors)

**Verify tables created:**
- Go to Table Editor
- You should see `bookings` and `booking_history` tables
- Check RLS policies are enabled

---

### Step 6: Test Locally (20 minutes)

#### Start Development Server
```bash
npm run dev
```

#### Test Booking Page
1. Open http://localhost:3000/book
2. You should see:
   - "Book a Meeting" heading
   - Cal.com embed with calendar
   - Info cards below

#### Make Test Booking
1. Click on available time slot
2. Fill in your details
3. Click "Confirm"
4. You should see success message

#### Verify Database
1. Open Supabase Dashboard
2. Go to Table Editor
3. Click `bookings` table
4. You should see your test booking record

#### Verify Email
1. Check your email inbox
2. You should receive booking confirmation email
3. Email should contain:
   - Meeting title
   - Date and time
   - Duration

#### Test Webhook
1. In browser console (F12), check for any errors
2. In terminal, you should see logs like:
   ```
   Booking created: [booking-id]
   Confirmation email sent to [email]
   ```

---

### Step 7: Deploy to Production (10 minutes)

#### For Vercel Deployment

1. **Update environment variables:**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add/update these variables:
     ```
     NEXT_PUBLIC_CALCOM_LINK=your-username/intro-call
     CALCOM_API_KEY=cal_test_xxxxx
     CALCOM_WEBHOOK_SECRET=webhook_secret_xxxxx
     RESEND_API_KEY=re_xxxxx
     RESEND_FROM_EMAIL=bookings@yourdomain.com
     NEXT_PUBLIC_APP_URL=https://yourdomain.com
     NEXT_PUBLIC_WEBHOOK_URL=https://yourdomain.com/api/webhooks/calcom
     ```

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy Cal.com booking system"
   git push origin main
   ```
   - Vercel will auto-deploy

3. **Update Cal.com webhook:**
   - Go to Cal.com Settings → Webhooks
   - Edit webhook URL to: `https://yourdomain.com/api/webhooks/calcom`

4. **Test production:**
   - Visit https://yourdomain.com/book
   - Make test booking
   - Verify email received
   - Check Supabase for booking record

---

## ✅ Verification Checklist

- [ ] Cal.com account created
- [ ] Event type "Intro Call" created
- [ ] API key generated and saved
- [ ] Webhook secret generated and saved
- [ ] Resend account created
- [ ] Resend API key generated and saved
- [ ] `.env.local` configured with all values
- [ ] Database migration executed
- [ ] `bookings` table visible in Supabase
- [ ] `booking_history` table visible in Supabase
- [ ] Local test booking successful
- [ ] Confirmation email received
- [ ] Booking record in Supabase
- [ ] Production environment variables set
- [ ] Code deployed to production
- [ ] Production webhook URL updated in Cal.com
- [ ] Production test booking successful

---

## 🆘 Troubleshooting

### Booking page shows blank embed
- Check `NEXT_PUBLIC_CALCOM_LINK` is correct
- Verify Cal.com event type is published
- Check browser console for errors

### Webhook not receiving events
- Verify webhook URL is correct in Cal.com
- Check webhook secret matches `CALCOM_WEBHOOK_SECRET`
- Look for webhook logs in Cal.com dashboard

### Email not sending
- Verify `RESEND_API_KEY` is correct
- Check `RESEND_FROM_EMAIL` is verified in Resend
- Look for errors in terminal logs

### Database migration fails
- Verify Supabase credentials are correct
- Check SQL syntax in migration file
- Try running each CREATE TABLE separately

### Booking not appearing in database
- Check RLS policies are enabled
- Verify `client_id` is being set correctly
- Check Supabase logs for errors

---

## 📞 Support Resources

- Cal.com Docs: https://cal.com/docs
- Resend Docs: https://resend.com/docs
- Supabase Docs: https://supabase.com/docs
- Project Docs: `docs/features/03-booking-calendar/`

---

## 🎯 Success Looks Like

✅ Booking page loads at `/book`  
✅ Cal.com embed visible and interactive  
✅ Can select time and make booking  
✅ Booking appears in Supabase within seconds  
✅ Confirmation email received  
✅ Booking appears in your Google Calendar  

---

**Ready to deploy?** Start with Step 1 above! 🚀

