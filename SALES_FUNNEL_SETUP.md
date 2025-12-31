# 🎯 Sales Funnel Setup Guide

Your sales funnel is fully implemented and ready to deploy! This guide will help you complete the setup.

## 📋 What's Included

The sales funnel includes:
- ✅ Multi-step form (Services → Contact Info → Booking)
- ✅ Database schema for sales inquiries
- ✅ API endpoint for form submissions
- ✅ Cal.com integration for meeting booking
- ✅ All signup pages now redirect to the sales funnel

## 🚀 Quick Start (5 minutes)

### 1️⃣ Run the Database Migration

You have **two options** to create the `sales_inquiries` table:

#### Option A: Automatic (Recommended)

If you have a `.env.local` file with your Supabase credentials:

```bash
node scripts/run-sales-migration.js
```

#### Option B: Manual (5 minutes)

If you don't have environment variables set up:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `scripts/migrations/012_sales_inquiries.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### 2️⃣ Configure Cal.com

Update your `.env.local` file with your Cal.com booking link:

```env
NEXT_PUBLIC_CALCOM_LINK=your-username/consultation
```

Replace `your-username/consultation` with your actual Cal.com event link.

**Don't have Cal.com set up yet?** See the [Cal.com Setup Guide](#cal-com-setup-detailed)

### 3️⃣ Test the Funnel

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000/sales

3. Complete the form:
   - **Step 1**: Select services and describe your project
   - **Step 2**: Enter contact information
   - **Step 3**: Book a consultation

4. Verify the data in Supabase:
   - Go to **Table Editor** → `sales_inquiries`
   - You should see your test submission

## 📊 Database Schema

The `sales_inquiries` table includes:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `full_name` | TEXT | Client's full name |
| `email` | TEXT | Client's email |
| `company` | TEXT | Company name (optional) |
| `phone` | TEXT | Phone number (optional) |
| `services` | TEXT[] | Array of selected services |
| `project_description` | TEXT | Project details |
| `timeline` | TEXT | Desired timeline |
| `budget_range` | TEXT | Budget estimate |
| `additional_notes` | TEXT | Extra information |
| `status` | ENUM | NEW, CONTACTED, QUALIFIED, PROPOSAL_SENT, CLOSED_WON, CLOSED_LOST |
| `meeting_booked` | BOOLEAN | Whether consultation was booked |
| `booking_id` | UUID | Link to bookings table |
| `created_at` | TIMESTAMP | Submission timestamp |

### Row-Level Security (RLS)

- **Public**: Can insert new inquiries (sales form submissions)
- **OWNER role**: Can view and update all inquiries
- **Clients**: Cannot access this table

## 🎨 Available Service Options

The sales funnel includes these services:

1. 🚀 **Web Development** - Custom websites and web applications
2. 🎨 **UI/UX Design** - Beautiful, user-centered designs
3. 💡 **Consulting** - Strategic technical guidance
4. 🔧 **Maintenance & Support** - Ongoing support services

These match your homepage offerings and can be customized in `/app/sales/page.tsx` (lines 15-20).

## 🔗 Cal.com Setup (Detailed)

### If You Don't Have Cal.com Yet:

1. **Create Account**
   - Go to https://cal.com
   - Sign up for a free account
   - Verify your email

2. **Create Event Type**
   - Click "Event Types" in dashboard
   - Click "+ New Event Type"
   - Name it "Sales Consultation" or "Project Discovery Call"
   - Set duration (recommended: 30-60 minutes)
   - Configure your availability
   - Save

3. **Get Your Cal.com Link**
   - Copy the event link (e.g., `your-username/consultation`)
   - Add to `.env.local`:
     ```env
     NEXT_PUBLIC_CALCOM_LINK=your-username/consultation
     ```

4. **Test the Embed**
   - Complete a test submission through `/sales`
   - The calendar should appear on Step 3
   - Try booking a test meeting

### Webhook Integration (Optional)

To link bookings back to sales inquiries:

1. In Cal.com, go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/webhooks/calcom`
3. The webhook will create bookings in your database

## 📁 Files Modified/Created

### New Files:
- `app/sales/page.tsx` - Sales funnel page
- `app/api/sales-inquiry/route.ts` - API endpoint
- `lib/sales-inquiry-service.ts` - Service layer
- `scripts/migrations/012_sales_inquiries.sql` - Database migration
- `scripts/run-sales-migration.js` - Migration runner

### Modified Files:
- `app/auth/signup/page.tsx` - Now redirects to `/sales`
- `app/portal/signup/page.tsx` - Now redirects to `/sales`
- `app/auth/signin/page.tsx` - "Book a Consultation" link
- `app/book/page.tsx` - Updated messaging
- `components/HomePageClient.tsx` - Updated CTAs
- `lib/validation-schemas.ts` - Added sales inquiry schemas

## 🎯 User Journey

1. **Discovery**: User visits your site, clicks "Book Consultation"
2. **Redirect**: Any signup links now go to `/sales`
3. **Step 1**: User selects services and describes their project
4. **Step 2**: User enters contact information
5. **Step 3**: Form submits, user sees success message with Cal.com embed
6. **Booking**: User books a consultation directly
7. **Admin**: You receive inquiry in database and meeting on your calendar

## 🔍 Viewing Sales Inquiries

### Option 1: Supabase Dashboard
1. Go to Table Editor
2. Select `sales_inquiries` table
3. View all submissions with filters and sorting

### Option 2: Build Admin Panel (Future)
You could add an admin page at `/admin/inquiries` to:
- View all inquiries
- Update status (NEW → CONTACTED → QUALIFIED → etc.)
- Add admin notes
- Link to bookings

## 🚨 Troubleshooting

### Migration Failed?
- Check your Supabase credentials in `.env.local`
- Try running manually via SQL Editor
- Check the SQL for syntax errors

### Cal.com Not Loading?
- Verify `NEXT_PUBLIC_CALCOM_LINK` in `.env.local`
- Check browser console for errors
- Ensure Cal.com account is active
- Try the fallback: `/book` page

### Form Not Submitting?
- Check browser console for errors
- Verify Supabase is running
- Check that `sales_inquiries` table exists
- Ensure RLS policies are set up correctly

## 📈 Next Steps

1. **Test in Production**
   - Deploy to Vercel/your hosting platform
   - Test the full flow
   - Send test inquiries

2. **Customize Copy**
   - Update service descriptions
   - Adjust form fields as needed
   - Personalize messaging

3. **Set Up Notifications**
   - Get email when new inquiry comes in
   - Set up Slack/Discord webhooks
   - Create admin dashboard

4. **Analytics**
   - Track funnel conversion rates
   - Monitor which services are most popular
   - Analyze drop-off points

## ✅ Checklist

- [ ] Database migration completed
- [ ] Cal.com event type created
- [ ] Environment variable set
- [ ] Test submission successful
- [ ] Data appears in Supabase
- [ ] Calendar loads on Step 3
- [ ] Test booking works
- [ ] All signup redirects work
- [ ] Ready for production!

## 🤝 Support

- Database issues: Check Supabase dashboard logs
- Cal.com issues: See https://cal.com/docs
- Form issues: Check browser console

---

🎉 **You're all set!** The sales funnel is ready to start capturing leads and booking consultations.
