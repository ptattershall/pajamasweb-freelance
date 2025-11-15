# Cal.com Deployment Quick Checklist

**Total Time:** 45 minutes | **Difficulty:** Easy

---

## ⏱️ Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Create Cal.com Account | 10 min | [ ] |
| 2 | Generate Credentials | 10 min | [ ] |
| 3 | Set Up Resend | 5 min | [ ] |
| 4 | Configure .env.local | 10 min | [ ] |
| 5 | Run Database Migration | 10 min | [ ] |
| 6 | Test Locally | 20 min | [ ] |
| 7 | Deploy to Production | 10 min | [ ] |

---

## 📝 Step 1: Cal.com Account (10 min)

```
[ ] Go to https://cal.com
[ ] Sign up and create account
[ ] Complete profile (name, email, timezone)
[ ] Connect Google Calendar
[ ] Create "Intro Call" event type (30 min)
[ ] Note username: ___________________
```

---

## 🔑 Step 2: Credentials (10 min)

```
[ ] Generate API Key
    Value: ___________________
    
[ ] Create Webhook
    URL: https://yourdomain.com/api/webhooks/calcom
    Secret: ___________________
```

---

## 📧 Step 3: Resend (5 min)

```
[ ] Sign up at https://resend.com
[ ] Create API Key
    Value: ___________________
    
[ ] Verify sender domain (optional)
```

---

## ⚙️ Step 4: Environment Variables (10 min)

```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local with these values:
NEXT_PUBLIC_CALCOM_LINK=your-username/intro-call
CALCOM_API_KEY=cal_test_xxxxx
CALCOM_WEBHOOK_SECRET=webhook_secret_xxxxx
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=bookings@yourdomain.com
```

```
[ ] .env.local created
[ ] All values filled in
[ ] File saved
```

---

## 🗄️ Step 5: Database (10 min)

```
[ ] Open Supabase Dashboard
[ ] Go to SQL Editor
[ ] Copy scripts/migrations/001_create_bookings_table.sql
[ ] Paste and run
[ ] Verify tables created:
    [ ] bookings table
    [ ] booking_history table
    [ ] RLS policies enabled
```

---

## 🧪 Step 6: Local Testing (20 min)

```bash
npm run dev
```

```
[ ] Visit http://localhost:3000/book
[ ] Cal.com embed visible
[ ] Make test booking
[ ] Success message appears
[ ] Check Supabase for booking record
[ ] Check email for confirmation
[ ] Check terminal for logs
```

---

## 🚀 Step 7: Production (10 min)

```
[ ] Set Vercel environment variables
[ ] Deploy code (git push)
[ ] Update Cal.com webhook URL
[ ] Test production booking
[ ] Verify email received
[ ] Verify Supabase record created
```

---

## ✅ Final Verification

```
[ ] Booking page loads
[ ] Cal.com embed works
[ ] Can make booking
[ ] Email received
[ ] Database record created
[ ] Webhook logs show success
[ ] No errors in console
```

---

## 📞 Quick Links

- Cal.com: https://cal.com
- Resend: https://resend.com
- Supabase: https://supabase.com
- Full Guide: `docs/CALCOM_DEPLOYMENT_GUIDE.md`

---

**Status:** Ready to deploy! 🚀

