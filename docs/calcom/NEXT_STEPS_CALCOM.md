# Next Steps - Cal.com Implementation

## 🎯 Your Action Items

### Phase 1: Setup (Today - 45 minutes)

#### Step 1: Cal.com Account (10 min)
```
1. Go to https://cal.com
2. Sign up and complete profile
3. Connect Google Calendar
4. Create "Intro Call" event type (30 min)
5. Note: your-username/intro-call
```

#### Step 2: Generate Credentials (10 min)
```
1. Cal.com Settings → API Keys
   - Create key, copy value (cal_test_xxxxx)
2. Cal.com Settings → Webhooks
   - Create webhook: https://yourdomain.com/api/webhooks/calcom
   - Copy webhook secret
```

#### Step 3: Resend Setup (5 min)
```
1. Go to https://resend.com
2. Sign up and create API key
3. Verify sender email domain
```

#### Step 4: Database (10 min)
```
1. Open Supabase SQL Editor
2. Copy: scripts/migrations/001_create_bookings_table.sql
3. Execute the SQL
4. Verify tables created
```

#### Step 5: Environment Variables (10 min)
```
1. Copy .env.local.example to .env.local
2. Fill in:
   - NEXT_PUBLIC_CALCOM_LINK
   - CALCOM_API_KEY
   - CALCOM_WEBHOOK_SECRET
   - RESEND_API_KEY
   - RESEND_FROM_EMAIL
```

### Phase 2: Testing (Tomorrow - 30 minutes)

```bash
# Start dev server
npm run dev

# Visit booking page
http://localhost:3000/book

# Make test booking
# Check Supabase: SELECT * FROM bookings;
# Check email inbox for confirmation
```

### Phase 3: Deployment (This Week - 30 minutes)

```
1. Update environment variables in production
2. Deploy code to production
3. Make test booking
4. Verify webhook delivery
5. Verify email sending
```

## 📋 Checklist

### Before Testing
- [ ] Cal.com account created
- [ ] Event type created
- [ ] API key generated
- [ ] Webhook secret generated
- [ ] Resend account created
- [ ] Resend API key generated
- [ ] Database migration executed
- [ ] Environment variables configured

### Testing
- [ ] Dev server starts: `npm run dev`
- [ ] Booking page loads: `http://localhost:3000/book`
- [ ] Cal.com embed visible
- [ ] Can make test booking
- [ ] Booking appears in Supabase
- [ ] Confirmation email received

### Deployment
- [ ] Code deployed to production
- [ ] Environment variables updated
- [ ] Webhook URL is public
- [ ] Test booking works
- [ ] Email received
- [ ] Booking in database

## 📁 Key Files to Reference

| File | Purpose |
|------|---------|
| `docs/CALCOM_SETUP_GUIDE.md` | Detailed setup instructions |
| `docs/CALCOM_QUICK_START.md` | Quick reference checklist |
| `docs/CALCOM_IMPLEMENTATION_SUMMARY.md` | Technical overview |
| `.env.local.example` | Environment variables template |
| `scripts/migrations/001_create_bookings_table.sql` | Database schema |

## 🔗 External Resources

- Cal.com: https://cal.com
- Resend: https://resend.com
- Supabase: https://supabase.com
- Cal.com Docs: https://cal.com/docs
- Resend Docs: https://resend.com/docs

## 💬 Questions?

**Q: Where is the booking page?**
A: `http://localhost:3000/book` (or `/book` on production)

**Q: How do I verify the webhook is working?**
A: Make a test booking in Cal.com, then check Supabase for the booking record

**Q: Where are the emails sent from?**
A: From the email address in `RESEND_FROM_EMAIL` environment variable

**Q: How do I test locally without public URL?**
A: Use ngrok: `ngrok http 3000` and update webhook URL in Cal.com

**Q: What if webhook fails?**
A: Check Cal.com webhook logs, verify signature, check server logs

## 🚀 Success Criteria

✅ Booking page loads with Cal.com embed
✅ Can make booking through Cal.com
✅ Booking appears in Supabase within 5 seconds
✅ Confirmation email received within 1 minute
✅ Booking appears in Google Calendar
✅ Rescheduling updates booking in database
✅ Cancellation marks booking as cancelled

## 📞 Support

If you get stuck:
1. Check `docs/CALCOM_SETUP_GUIDE.md` for detailed steps
2. Review error logs in Supabase
3. Check Cal.com webhook logs
4. Check Resend dashboard for email errors
5. Verify environment variables are correct

## ⏱️ Timeline

- **Setup**: 45 minutes
- **Testing**: 30 minutes
- **Deployment**: 30 minutes
- **Total**: ~2 hours to production

---

**Ready to get started?** Begin with Phase 1 above!

