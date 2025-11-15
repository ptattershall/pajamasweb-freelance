# Feature: Booking & Calendar Integration

## 📊 Implementation Status

**Last Updated:** November 13, 2025

### ✅ What's Complete (Production Ready)

**Phase 1: Cal.com Integration** - COMPLETE

- ✅ Cal.com embed on booking page (`/book`)
- ✅ Webhook handler with HMAC SHA-256 signature verification
- ✅ Database schema with bookings and booking_history tables
- ✅ RLS policies for data security
- ✅ Booking creation, update, and cancellation
- ✅ Email confirmations via Resend
- ✅ Automatic audit trail logging

**Phase 4: Email Notifications** - PARTIALLY COMPLETE

- ✅ Booking confirmation emails
- ✅ Cancellation notification emails
- ✅ Reminder email functions (24h, 1h)
- ⏳ Automated reminder scheduling (needs cron job)

**Phase 3: Booking Management** - PARTIALLY COMPLETE

- ✅ Client portal bookings view
- ✅ Upcoming/past bookings tabs
- ✅ API endpoint for fetching bookings
- ⏳ Reschedule/cancel UI (backend ready, UI needed)

### ⏳ What's In Progress

1. **Booking Management UI**
   - Need: Reschedule button functionality
   - Need: Cancel button functionality
   - Need: ICS calendar export
   - Need: Admin dashboard

2. **Automated Reminders**
   - Need: Cron job or scheduled task to send reminder emails
   - Functions exist but not scheduled

### ⬜ What's Not Started

1. **Google Calendar Direct Integration (Option B)**
   - OAuth2 flow
   - Token encryption
   - Availability checking
   - Push notifications
   - *Note: This is an alternative to Cal.com, not required for MVP*

2. **Advanced Features**
   - SMS reminders
   - Notification preferences UI
   - Booking filters and search
   - Rescheduling notification emails

## Overview

Calendar booking system with two implementation options: Cal.com embed or direct Google Calendar API integration.

**Current Implementation:** Cal.com (Option A) - Recommended for MVP

## User Stories

- As a **Prospect**, I want to book an intro call at a convenient time
- As a **Client**, I want to schedule follow-up meetings
- As a **Founder/Operator**, I want bookings to sync with my Google Calendar automatically
- As a **System**, I want to send booking confirmations and reminders

## Technical Requirements

### Two Implementation Approaches

#### Option A: Cal.com (Recommended for MVP)

- Cal.com embed with Google Calendar sync
- Fastest implementation
- Robust rescheduling/reminders built-in
- Webhook integration for booking data

#### Option B: Direct Google Calendar API

- OAuth2 (offline access) to Google account
- Store refresh token (encrypted) in Supabase
- Create events on booking
- Listen to push notifications (webhooks) for changes
- Send Resend confirmations

### Database Schema

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id),
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  external_id text, -- cal.com or gcal event id
  provider text, -- 'calcom' | 'gcal'
  created_at timestamptz default now()
);
```

### RLS Policies

- `bookings`: user can read only their own; OWNER can read all

## Development Phases

### Phase 1: Cal.com Integration (Option A) ✅ COMPLETE

**Estimated Time:** 2-3 days

**Tasks:**

- [x] Create Cal.com account and configure event types
- [x] Connect Cal.com to Google Calendar
- [x] Set up Cal.com webhook endpoint
- [x] Create `bookings` table in Supabase
- [x] Set up RLS policies for bookings
- [x] Embed Cal.com widget on booking page
- [x] Handle Cal.com webhook events
- [x] Store booking data in Supabase
- [x] Send confirmation emails via Resend
- [x] Test booking flow end-to-end

**Acceptance Criteria:**

- ✅ Users can book calls through Cal.com widget
- ✅ Bookings appear in Google Calendar
- ✅ Booking data syncs to Supabase
- ✅ Confirmation emails are sent to both parties
- ✅ Rescheduling and cancellations work correctly

**Implementation Status:**

**Files Created:**

- `app/book/page.tsx` - Booking page with Cal.com embed
- `app/api/webhooks/calcom/route.ts` - Webhook handler for Cal.com events
- `lib/booking-service.ts` - Database operations for bookings
- `lib/email-service.ts` - Email sending via Resend
- `lib/webhook-utils.ts` - Webhook signature verification
- `scripts/migrations/001_create_bookings_table.sql` - Database schema

**Features Implemented:**

- Cal.com inline embed with event listeners
- HMAC SHA-256 webhook signature verification
- Booking creation, update, and cancellation
- Automatic audit trail in booking_history table
- Email confirmations and cancellations
- RLS policies for data security

### Phase 2: Google Calendar Direct API (Option B - Alternative) ⬜ NOT STARTED

**Estimated Time:** 5-7 days

**Tasks:**

- [ ] Set up Google Cloud project and OAuth credentials
- [ ] Implement Google OAuth2 flow
- [ ] Store encrypted refresh token in Supabase
- [ ] Build availability checking logic
- [ ] Create time slot selection UI
- [ ] Implement event creation via Calendar API
- [ ] Set up Google Calendar push notifications
- [ ] Create webhook endpoint for calendar changes
- [ ] Handle event updates and cancellations
- [ ] Send booking confirmations via Resend
- [ ] Build booking management UI

**Acceptance Criteria:**

- OAuth flow works securely
- Availability reflects Google Calendar accurately
- Events are created in Google Calendar
- Push notifications update booking status
- Users can reschedule and cancel bookings

### Phase 3: Booking Management ⏳ IN PROGRESS

**Estimated Time:** 2-3 days

**Tasks:**

- [x] Build upcoming bookings view for clients
- [x] Create booking history view
- [x] Add API endpoint for fetching bookings
- [ ] Add booking details page
- [ ] Implement booking cancellation UI
- [ ] Implement booking rescheduling UI
- [ ] Add calendar export (ICS file)
- [ ] Build admin booking dashboard
- [ ] Add booking filters and search

**Acceptance Criteria:**

- ✅ Clients can view their upcoming and past bookings
- ⏳ Cancellation and rescheduling work smoothly (backend ready, UI needed)
- ⏳ Admin can manage all bookings (needs admin dashboard)
- ⏳ Calendar exports work correctly (not implemented)

**Implementation Status:**

**Files Created:**

- `app/portal/bookings/page.tsx` - Client bookings view with tabs
- `app/api/portal/bookings/route.ts` - API endpoint for fetching bookings
- `scripts/migrations/004_client_portal_phase4_bookings.sql` - Extended schema

**Features Implemented:**

- Upcoming/past bookings tabs
- Booking list with date, time, duration
- Meeting link display
- Responsive design

**Still Needed:**

- Reschedule/cancel buttons functionality
- ICS calendar export
- Admin dashboard for managing all bookings
- Booking detail view

### Phase 4: Notifications & Reminders ⏳ PARTIALLY COMPLETE

**Estimated Time:** 2-3 days

**Tasks:**

- [x] Create email templates for booking events
- [x] Implement booking confirmation emails
- [x] Add reminder emails (24h before, 1h before) - functions ready
- [x] Build cancellation notification emails
- [ ] Add rescheduling notification emails
- [ ] Implement automated reminder scheduling
- [ ] Implement SMS reminders (optional)
- [ ] Create notification preferences UI

**Acceptance Criteria:**

- ✅ Booking confirmation emails sent on creation
- ✅ Cancellation emails sent on cancellation
- ⏳ Reminders are sent at correct times (functions exist, scheduling needed)
- ⏳ Users can manage notification preferences (not implemented)

**Implementation Status:**

**Files Created:**

- `lib/email-service.ts` - Complete email service with Resend

**Features Implemented:**

- `sendBookingConfirmation()` - Sends confirmation with booking details
- `sendBookingCancellation()` - Sends cancellation notice
- `sendBookingReminder24h()` - 24-hour reminder function
- `sendBookingReminder1h()` - 1-hour reminder function
- HTML email templates with styling

**Still Needed:**

- Automated scheduling of reminder emails (cron job or scheduled task)
- Rescheduling notification emails
- User notification preferences UI
- SMS reminders (optional)

## User Flows

### Flow 1: Prospect Books Intro Call

1. Prospect clicks "Book Intro" on service page
2. Cal.com widget shows available time slots
3. Prospect selects time and enters details
4. Cal.com creates event in Google Calendar
5. Webhook triggers → store booking in Supabase
6. Confirmation emails sent to both parties

### Flow 2: Client Reschedules Meeting

1. Client views upcoming bookings in portal
2. Clicks "Reschedule" on a booking
3. Selects new time slot
4. Calendar event updated
5. Webhook updates Supabase booking
6. Rescheduling emails sent to both parties

## Integration Requirements

### Cal.com (Option A)

#### Setup & Configuration

- Create Cal.com account and configure event types
- Connect Cal.com to Google Calendar for sync
- Generate Cal.com API key for webhook integration
- Configure webhook endpoint: `https://yourdomain.com/api/webhooks/calcom`
- Customize branding and event type settings

#### Webhook Events

Cal.com sends the following webhook events:

- `BOOKING_CREATED`: New booking made
- `BOOKING_RESCHEDULED`: Booking time changed
- `BOOKING_CANCELLED`: Booking cancelled
- `BOOKING_CONFIRMED`: Booking confirmed by attendee

#### Embed Implementation

```html
<!-- Cal.com embed on booking page -->
<script type="module" src="https://app.cal.com/embed.js"></script>
<cal-embed
  calLink="your-username"
  style="width:100%;height:100%;overflow:hidden;"
></cal-embed>
```

#### API Integration

```typescript
// Fetch available slots
const response = await fetch('https://api.cal.com/v2/slots', {
  headers: {
    'Authorization': `Bearer ${process.env.CALCOM_API_KEY}`,
    'cal-api-version': '2024-08-13'
  },
  body: JSON.stringify({
    eventTypeId: 123,
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T17:00:00Z',
    timeZone: 'America/New_York'
  })
});

// Create booking via API
const booking = await fetch('https://api.cal.com/v2/bookings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.CALCOM_API_KEY}`,
    'cal-api-version': '2024-08-13'
  },
  body: JSON.stringify({
    eventTypeId: 123,
    start: '2024-01-15T10:00:00Z',
    attendee: {
      name: 'John Doe',
      email: 'john@example.com',
      timeZone: 'America/New_York'
    }
  })
});
```

### Google Calendar API (Option B) - Advanced Implementation

#### OAuth2 Setup

- Create Google Cloud project and OAuth 2.0 credentials
- Configure OAuth consent screen
- Set redirect URI: `https://yourdomain.com/api/auth/google/callback`
- Required scopes:
  - `https://www.googleapis.com/auth/calendar` (read/write events)
  - `https://www.googleapis.com/auth/calendar.events` (manage events)

#### 1. Secure Credential Storage

Store encrypted refresh tokens in Supabase:

```sql
create table calendar_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null, -- 'google' | 'microsoft'
  refresh_token text not null, -- encrypted
  access_token text, -- encrypted, short-lived
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_user_provider unique(user_id, provider)
);

alter table calendar_credentials enable row level security;

create policy "users_manage_own_credentials" on calendar_credentials
  for all using (auth.uid() = user_id);
```

#### 2. Token Encryption/Decryption

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

#### 3. OAuth Flow Implementation

```typescript
// app/api/auth/google/route.ts
import { google } from 'googleapis';
import { redirect } from 'next/navigation';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'connect') {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent screen to get refresh token
    });

    redirect(url);
  }
}

// app/api/auth/google/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return new Response('No authorization code', { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Encrypt and store tokens
    const encryptedRefreshToken = encryptToken(tokens.refresh_token!);

    const { error } = await supabase
      .from('calendar_credentials')
      .upsert({
        user_id: getCurrentUserId(),
        provider: 'google',
        refresh_token: encryptedRefreshToken,
        access_token: tokens.access_token,
        expires_at: new Date(tokens.expiry_date!)
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) throw error;

    redirect('/settings/calendar?connected=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    redirect('/settings/calendar?error=connection_failed');
  }
}
```

#### 4. Push Notifications Setup

```typescript
// lib/calendar-watch.ts
import { google } from 'googleapis';

export async function setupCalendarWatch(userId: string) {
  const credentials = await getEncryptedCredentials(userId);
  oauth2Client.setCredentials(credentials);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const watchResponse = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: `${userId}-watch-${Date.now()}`,
      type: 'web_hook',
      address: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/google-calendar`,
      token: userId // For identifying the user in webhook
    }
  });

  // Store watch channel info for renewal
  await supabase
    .from('calendar_watches')
    .insert({
      user_id: userId,
      channel_id: watchResponse.data.id,
      resource_id: watchResponse.data.resourceId,
      expiration: new Date(parseInt(watchResponse.data.expiration!))
    });

  return watchResponse.data;
}
```

#### 5. Availability Checking

```typescript
// lib/availability.ts
export async function getAvailableSlots(
  userId: string,
  date: Date,
  durationMinutes: number = 60
) {
  const credentials = await getEncryptedCredentials(userId);
  oauth2Client.setCredentials(credentials);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0);

  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  });

  const busyTimes = events.data.items || [];
  const availableSlots = calculateAvailableSlots(
    startOfDay,
    endOfDay,
    busyTimes,
    durationMinutes
  );

  return availableSlots;
}

function calculateAvailableSlots(
  dayStart: Date,
  dayEnd: Date,
  busyTimes: any[],
  durationMinutes: number
): Date[] {
  const slots: Date[] = [];
  let currentTime = new Date(dayStart);

  while (currentTime < dayEnd) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

    const isAvailable = !busyTimes.some(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      return currentTime < eventEnd && slotEnd > eventStart;
    });

    if (isAvailable && slotEnd <= dayEnd) {
      slots.push(new Date(currentTime));
    }

    currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-min intervals
  }

  return slots;
}
```

#### 6. Event Creation

```typescript
// lib/calendar-event.ts
export async function createCalendarEvent(
  userId: string,
  eventData: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail: string;
    description?: string;
  }
) {
  const credentials = await getEncryptedCredentials(userId);
  oauth2Client.setCredentials(credentials);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: 'America/New_York'
      },
      attendees: [
        { email: eventData.attendeeEmail }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    },
    sendUpdates: 'all' // Notify attendees
  });

  return event.data;
}
```

#### OAuth Flow Implementation

```typescript
// app/actions/google-auth.ts
'use server';

import { google } from 'googleapis';
import { redirect } from 'next/navigation';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
);

export async function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  redirect(url);
}

export async function handleGoogleCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);

  // Encrypt and store refresh token in Supabase
  const encryptedToken = encrypt(tokens.refresh_token);

  await supabase
    .from('calendar_credentials')
    .insert({
      user_id: getCurrentUserId(),
      provider: 'google',
      refresh_token: encryptedToken,
      access_token: tokens.access_token,
      expires_at: new Date(tokens.expiry_date)
    });
}
```

#### Event Creation

```typescript
// Create event in Google Calendar
async function createCalendarEvent(
  userId: string,
  eventData: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail: string;
    description?: string;
  }
) {
  const credentials = await getEncryptedCredentials(userId);
  oauth2Client.setCredentials(credentials);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: 'America/New_York'
      },
      attendees: [
        { email: eventData.attendeeEmail }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    },
    sendUpdates: 'all'
  });

  return event.data;
}
```

#### Push Notifications Setup

```typescript
// Set up watch channel for calendar changes
async function setupCalendarWatch(userId: string) {
  const credentials = await getEncryptedCredentials(userId);
  oauth2Client.setCredentials(credentials);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const watch = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: `${userId}-watch-${Date.now()}`,
      type: 'web_hook',
      address: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/google-calendar`
    }
  });

  // Store watch channel info
  await supabase
    .from('calendar_watches')
    .insert({
      user_id: userId,
      channel_id: watch.data.id,
      resource_id: watch.data.resourceId,
      expiration: new Date(parseInt(watch.data.expiration))
    });
}
```

#### Availability Checking

```typescript
// Get available time slots
async function getAvailableSlots(
  userId: string,
  date: Date,
  durationMinutes: number = 60
) {
  const credentials = await getEncryptedCredentials(userId);
  oauth2Client.setCredentials(credentials);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0);

  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  });

  // Calculate available slots
  const busyTimes = events.data.items || [];
  const availableSlots = calculateAvailableSlots(
    startOfDay,
    endOfDay,
    busyTimes,
    durationMinutes
  );

  return availableSlots;
}

function calculateAvailableSlots(
  dayStart: Date,
  dayEnd: Date,
  busyTimes: any[],
  durationMinutes: number
): Date[] {
  const slots: Date[] = [];
  let currentTime = new Date(dayStart);

  while (currentTime < dayEnd) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

    // Check if slot conflicts with busy times
    const isAvailable = !busyTimes.some(event => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      return currentTime < eventEnd && slotEnd > eventStart;
    });

    if (isAvailable && slotEnd <= dayEnd) {
      slots.push(new Date(currentTime));
    }

    currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-min intervals
  }

  return slots;
}
```

### Resend Email Templates

- **Booking confirmation**: Sent immediately after booking created
  - Include: event title, date/time, attendee details, calendar link
- **Booking reminder (24h)**: Sent 24 hours before event
  - Include: event details, join link, reschedule option
- **Booking reminder (1h)**: Sent 1 hour before event
  - Include: event details, join link, quick reschedule
- **Booking cancelled**: Sent when booking cancelled
  - Include: cancellation reason, rebook link
- **Booking rescheduled**: Sent when booking time changed
  - Include: old and new times, calendar update link

## Security Considerations

### Encrypt OAuth Refresh Tokens

```typescript
// Encryption utility
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### Validate Webhook Signatures

```typescript
// Cal.com webhook verification
function verifyCalcomWebhook(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.CALCOM_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

// Google Calendar webhook verification
function verifyGoogleWebhook(headers: any): boolean {
  const channelToken = headers['x-goog-channel-token'];
  return channelToken === process.env.GOOGLE_CHANNEL_TOKEN;
}
```

### Rate Limiting

```typescript
// Rate limit booking endpoints
import rateLimit from 'express-rate-limit';

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many booking requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/bookings', bookingLimiter, handleBooking);
```

### RLS Policies

```sql
-- Bookings RLS
CREATE POLICY "users_read_own_bookings" ON bookings
  FOR SELECT USING (auth.uid() = client_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "users_create_own_bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Calendar credentials RLS
CREATE POLICY "users_read_own_credentials" ON calendar_credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_manage_own_credentials" ON calendar_credentials
  FOR ALL USING (auth.uid() = user_id);
```

### Prevent Double-Booking

```typescript
async function checkDoubleBooking(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('client_id', userId)
    .lt('starts_at', endTime.toISOString())
    .gt('ends_at', startTime.toISOString())
    .neq('id', excludeBookingId || '');

  return (conflicts?.length || 0) > 0;
}
```

## Implementation Checklist

### Phase 1: Cal.com Integration (MVP - 2-3 days)

**Setup & Configuration:**

- [ ] Create Cal.com account and configure event types
- [ ] Connect Cal.com to Google Calendar for sync
- [ ] Generate Cal.com API key for webhook integration
- [ ] Configure webhook endpoint in Cal.com dashboard
- [ ] Set `CALCOM_API_KEY` and `CALCOM_WEBHOOK_SECRET` in environment

**Backend Implementation:**

- [ ] Create `bookings` table in Supabase
- [ ] Set up RLS policies for bookings
- [ ] Implement webhook signature verification
- [ ] Create webhook handler for booking events
- [ ] Implement booking creation/update/delete logic
- [ ] Set up Resend email service

**Frontend Implementation:**

- [ ] Create booking page component
- [ ] Embed Cal.com widget with proper configuration
- [ ] Add event listeners for booking actions
- [ ] Implement success/error handling
- [ ] Add loading states and error messages

**Email & Notifications:**

- [ ] Create booking confirmation email template
- [ ] Create reminder email templates (24h, 1h)
- [ ] Implement email scheduling
- [ ] Test email delivery

**Testing:**

- [ ] Unit tests for webhook handlers
- [ ] Integration tests for booking flow
- [ ] E2E tests for complete user journey
- [ ] Email delivery verification

### Phase 2: Google Calendar Integration (Optional - 5-7 days)

**OAuth Setup:**

- [ ] Create Google Cloud project
- [ ] Configure OAuth 2.0 credentials
- [ ] Set up OAuth consent screen
- [ ] Configure redirect URIs

**Backend Implementation:**

- [ ] Create `calendar_credentials` table
- [ ] Implement token encryption/decryption
- [ ] Create OAuth flow handlers
- [ ] Implement availability checking
- [ ] Set up push notification channel
- [ ] Create webhook handler for calendar changes

**Frontend Implementation:**

- [ ] Create calendar connection UI
- [ ] Implement OAuth flow
- [ ] Create availability picker component
- [ ] Add booking confirmation flow

**Testing:**

- [ ] OAuth flow tests
- [ ] Availability calculation tests
- [ ] Push notification handling tests
- [ ] Event creation/update tests

## Testing Requirements

### Unit Tests

```typescript
// tests/unit/webhook-verification.test.ts
import { verifyCalcomWebhook } from '@/lib/webhook-utils';

describe('Webhook Verification', () => {
  it('should verify valid Cal.com webhook signature', () => {
    const payload = JSON.stringify({ test: 'data' });
    const signature = generateValidSignature(payload);

    expect(verifyCalcomWebhook(payload, signature)).toBe(true);
  });

  it('should reject invalid webhook signature', () => {
    const payload = JSON.stringify({ test: 'data' });
    const invalidSignature = 'invalid_signature';

    expect(verifyCalcomWebhook(payload, invalidSignature)).toBe(false);
  });
});

// tests/unit/availability.test.ts
import { calculateAvailableSlots } from '@/lib/availability';

describe('Availability Calculation', () => {
  it('should calculate available slots correctly', () => {
    const dayStart = new Date('2024-01-15T09:00:00');
    const dayEnd = new Date('2024-01-15T17:00:00');
    const busyTimes = [
      {
        start: { dateTime: '2024-01-15T10:00:00' },
        end: { dateTime: '2024-01-15T11:00:00' }
      }
    ];

    const slots = calculateAvailableSlots(dayStart, dayEnd, busyTimes, 60);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].getHours()).toBe(9);
  });

  it('should not return slots that conflict with busy times', () => {
    const dayStart = new Date('2024-01-15T09:00:00');
    const dayEnd = new Date('2024-01-15T17:00:00');
    const busyTimes = [
      {
        start: { dateTime: '2024-01-15T09:00:00' },
        end: { dateTime: '2024-01-15T10:00:00' }
      }
    ];

    const slots = calculateAvailableSlots(dayStart, dayEnd, busyTimes, 60);

    expect(slots.some(s => s.getHours() === 9)).toBe(false);
  });
});
```

### Integration Tests

```typescript
// tests/integration/booking-webhook.test.ts
import { POST } from '@/app/api/webhooks/calcom/route';

describe('Booking Webhook Handler', () => {
  it('should create booking from Cal.com webhook', async () => {
    const payload = {
      triggerEvent: 'BOOKING_CREATED',
      payload: {
        uid: 'test-uid-123',
        title: 'Test Meeting',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        attendees: [{ email: 'test@example.com', name: 'Test User' }]
      }
    };

    const request = new Request('http://localhost/api/webhooks/calcom', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'x-cal-signature': generateValidSignature(JSON.stringify(payload))
      }
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify booking in database
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('external_id', 'test-uid-123')
      .single();

    expect(booking).toBeDefined();
    expect(booking.title).toBe('Test Meeting');
  });

  it('should reject webhook with invalid signature', async () => {
    const payload = { test: 'data' };
    const request = new Request('http://localhost/api/webhooks/calcom', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'x-cal-signature': 'invalid_signature'
      }
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});

// tests/integration/email-delivery.test.ts
import { sendBookingConfirmation } from '@/lib/email-service';

describe('Email Delivery', () => {
  it('should send booking confirmation email', async () => {
    const booking = {
      id: 'booking-123',
      title: 'Test Meeting',
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 3600000).toISOString(),
      attendee_email: 'test@example.com',
      attendee_name: 'Test User'
    };

    const result = await sendBookingConfirmation(booking);

    expect(result.id).toBeDefined();
    expect(result.from).toBe('bookings@yourdomain.com');
  });

  it('should handle email sending errors gracefully', async () => {
    const booking = {
      id: 'booking-123',
      title: 'Test Meeting',
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 3600000).toISOString(),
      attendee_email: 'invalid-email',
      attendee_name: 'Test User'
    };

    await expect(sendBookingConfirmation(booking)).rejects.toThrow();
  });
});
```

### E2E Tests

```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete booking from start to finish', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book');

    // Wait for Cal.com embed to load
    await page.waitForSelector('[data-testid="cal-embed"]');

    // Verify booking page elements
    await expect(page.locator('h1')).toContainText('Book a Meeting');

    // Simulate booking (Cal.com handles the actual booking)
    // In real scenario, this would interact with Cal.com iframe
    await page.evaluate(() => {
      window.Cal?.('on', {
        action: 'bookingSuccessful',
        callback: (e: any) => {
          console.log('Booking successful:', e.detail);
        }
      });
    });
  });

  test('should display error message on booking failure', async ({ page }) => {
    await page.goto('/book');

    // Simulate booking error
    await page.evaluate(() => {
      window.Cal?.('on', {
        action: 'bookingFailed',
        callback: (e: any) => {
          console.log('Booking failed:', e.detail);
        }
      });
    });

    // Verify error message displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});

// tests/e2e/oauth-flow.spec.ts
test.describe('Google Calendar OAuth Flow', () => {
  test('should connect Google Calendar account', async ({ page }) => {
    await page.goto('/settings/calendar');

    // Click connect button
    await page.click('[data-testid="connect-google"]');

    // Verify redirect to Google OAuth
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });
});
```

### Performance Tests

```typescript
// tests/performance/booking-response-time.test.ts
describe('Booking Response Time', () => {
  it('should handle webhook within 2 seconds', async () => {
    const startTime = Date.now();

    const response = await fetch('/api/webhooks/calcom', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'x-cal-signature': validSignature }
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(2000);
  });
});
```

## Implementation Deep Dive

### Cal.com Embed Integration (Recommended MVP Path)

#### 1. Basic Embed Setup

Cal.com provides multiple embedding options. For the booking page, use the inline embed:

```html
<!-- Add to your booking page component -->
<script type="module" src="https://app.cal.com/embed.js"></script>
<div id="cal-embed"></div>

<script>
  Cal("inline", {
    elementOrSelector: "#cal-embed",
    calLink: "your-username/event-type",
    config: {
      theme: "light",
      layout: "month_view"
    }
  });
</script>
```

#### 2. Prefill User Information

Pre-populate form fields with known user data:

```javascript
Cal("inline", {
  elementOrSelector: "#cal-embed",
  calLink: "your-username/event-type",
  config: {
    name: user.name,
    email: user.email,
    notes: `Prospect from ${user.source}`,
    theme: "light"
  }
});
```

#### 3. Listen to Booking Events

Capture booking events to trigger backend actions:

```javascript
Cal("on", {
  action: "bookingSuccessful",
  callback: (e) => {
    const { data, type, namespace } = e.detail;
    console.log("Booking created:", data);

    // Trigger backend webhook handler
    fetch("/api/webhooks/calcom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "BOOKING_CREATED",
        bookingData: data
      })
    });
  }
});
```

#### 4. Webhook Handler Implementation

```typescript
// app/api/webhooks/calcom/route.ts
import { verifyCalcomWebhook } from '@/lib/webhook-utils';
import { createBooking, sendConfirmationEmail } from '@/lib/booking-service';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('x-cal-signature');

  // Verify webhook authenticity
  if (!verifyCalcomWebhook(payload, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const event = JSON.parse(payload);

  switch (event.triggerEvent) {
    case 'BOOKING_CREATED':
      await handleBookingCreated(event.payload);
      break;
    case 'BOOKING_RESCHEDULED':
      await handleBookingRescheduled(event.payload);
      break;
    case 'BOOKING_CANCELLED':
      await handleBookingCancelled(event.payload);
      break;
  }

  return new Response('OK', { status: 200 });
}

async function handleBookingCreated(payload: any) {
  // Store booking in Supabase
  const booking = await createBooking({
    client_id: payload.attendees[0].email,
    title: payload.title,
    starts_at: payload.startTime,
    ends_at: payload.endTime,
    external_id: payload.uid,
    provider: 'calcom'
  });

  // Send confirmation emails
  await sendConfirmationEmail(booking);
}
```

#### 5. Webhook Signature Verification

```typescript
// lib/webhook-utils.ts
import crypto from 'crypto';

export function verifyCalcomWebhook(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.CALCOM_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  return hash === signature;
}
```

### Email Confirmation with Resend

#### 1. Booking Confirmation Email

```typescript
// lib/email-service.ts
import { Resend } from 'resend';
import BookingConfirmationEmail from '@/emails/BookingConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(booking: Booking) {
  const { data, error } = await resend.emails.send({
    from: 'bookings@yourdomain.com',
    to: booking.attendee_email,
    subject: `Booking Confirmed: ${booking.title}`,
    react: <BookingConfirmationEmail booking={booking} />,
    tags: [
      { name: 'category', value: 'booking_confirmation' },
      { name: 'booking_id', value: booking.id }
    ]
  });

  if (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }

  return data;
}
```

#### 2. React Email Template

```typescript
// emails/BookingConfirmation.tsx
import React from 'react';
import { format } from 'date-fns';

interface BookingConfirmationProps {
  booking: {
    title: string;
    starts_at: string;
    ends_at: string;
    attendee_email: string;
    attendee_name: string;
  };
}

export default function BookingConfirmationEmail({ booking }: BookingConfirmationProps) {
  const startTime = format(new Date(booking.starts_at), 'PPpp');
  const endTime = format(new Date(booking.ends_at), 'p');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Booking Confirmed!</h1>
      <p>Hi {booking.attendee_name},</p>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>{booking.title}</h2>
        <p><strong>Date & Time:</strong> {startTime} - {endTime}</p>
        <p><strong>Confirmation:</strong> Your booking has been added to your calendar</p>
      </div>

      <p>
        <a href={`${process.env.NEXT_PUBLIC_URL}/bookings/${booking.id}`}
           style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          View Booking Details
        </a>
      </p>

      <p>Questions? Reply to this email or contact support.</p>
    </div>
  );
}
```

#### 3. Reminder Emails (24h and 1h before)

```typescript
// lib/reminder-service.ts
export async function scheduleReminders(booking: Booking) {
  const startTime = new Date(booking.starts_at);

  // 24-hour reminder
  const reminder24h = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
  await scheduleEmail(booking, reminder24h, '24h');

  // 1-hour reminder
  const reminder1h = new Date(startTime.getTime() - 60 * 60 * 1000);
  await scheduleEmail(booking, reminder1h, '1h');
}

async function scheduleEmail(booking: Booking, scheduledTime: Date, type: string) {
  const { data, error } = await resend.emails.send({
    from: 'reminders@yourdomain.com',
    to: booking.attendee_email,
    subject: `Reminder: ${booking.title} in ${type}`,
    react: <BookingReminderEmail booking={booking} type={type} />,
    scheduledAt: scheduledTime.toISOString()
  });

  if (error) {
    console.error(`Failed to schedule ${type} reminder:`, error);
  }
}
```

### Database Schema Implementation

```sql
-- Create bookings table
create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  external_id text, -- cal.com or gcal event id
  provider text not null, -- 'calcom' | 'gcal'
  attendee_email text not null,
  attendee_name text,
  status text default 'confirmed', -- 'confirmed' | 'cancelled' | 'rescheduled'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_provider check (provider in ('calcom', 'gcal'))
);

-- Create booking history table for audit trail
create table booking_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  action text not null, -- 'created' | 'rescheduled' | 'cancelled'
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table bookings enable row level security;
alter table booking_history enable row level security;

-- RLS Policies
create policy "users_read_own_bookings" on bookings
  for select using (auth.uid() = client_id or auth.jwt() ->> 'role' = 'admin');

create policy "users_create_own_bookings" on bookings
  for insert with check (auth.uid() = client_id);

create policy "users_update_own_bookings" on bookings
  for update using (auth.uid() = client_id or auth.jwt() ->> 'role' = 'admin');

create policy "users_read_own_history" on booking_history
  for select using (
    exists (
      select 1 from bookings
      where bookings.id = booking_history.booking_id
      and (bookings.client_id = auth.uid() or auth.jwt() ->> 'role' = 'admin')
    )
  );
```

## Environment Variables

### Cal.com Integration

```env
# Cal.com Configuration
CALCOM_API_KEY=cal_test_xxxxx
CALCOM_WEBHOOK_SECRET=webhook_secret_xxxxx
CALCOM_USERNAME=your-username
CALCOM_EVENT_TYPE=event-type-slug

# Webhook Configuration
NEXT_PUBLIC_WEBHOOK_URL=https://yourdomain.com/api/webhooks/calcom
```

### Google Calendar Integration (Optional)

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-key-here
```

### Email Service

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=bookings@yourdomain.com
RESEND_REPLY_TO=support@yourdomain.com
```

### Database

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Deployment Considerations

### Security Best Practices

1. **Webhook Signature Verification**
   - Always verify webhook signatures before processing
   - Use environment variables for secrets
   - Implement rate limiting on webhook endpoints

2. **Token Encryption**
   - Encrypt OAuth refresh tokens at rest
   - Use AES-256-GCM for encryption
   - Rotate encryption keys periodically

3. **CORS & CSRF Protection**
   - Configure CORS for Cal.com embed domain
   - Implement CSRF tokens for state-changing operations
   - Use SameSite cookies for session management

4. **Data Privacy**
   - Implement RLS policies in Supabase
   - Audit access to calendar credentials
   - Comply with GDPR/CCPA requirements

### Monitoring & Logging

```typescript
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

export function logBookingEvent(event: string, data: any) {
  console.log(`[BOOKING] ${event}:`, data);

  Sentry.captureMessage(`Booking event: ${event}`, 'info', {
    extra: data
  });
}

export function logWebhookError(error: Error, payload: any) {
  console.error('[WEBHOOK_ERROR]', error);

  Sentry.captureException(error, {
    extra: { payload }
  });
}
```

### Database Backups

- Enable automated backups in Supabase
- Test restore procedures regularly
- Keep 30-day backup retention

### Scaling Considerations

1. **Webhook Processing**
   - Use message queue (Bull, RabbitMQ) for async processing
   - Implement idempotency keys to prevent duplicate processing
   - Set up dead-letter queues for failed webhooks

2. **Email Delivery**
   - Use Resend's batch API for bulk emails
   - Implement exponential backoff for retries
   - Monitor email delivery rates

3. **Calendar API Rate Limits**
   - Implement caching for availability queries
   - Use batch operations where possible
   - Monitor API quota usage

### Deployment Checklist

```markdown
## Pre-Production Deployment

- [ ] All environment variables configured
- [ ] Webhook endpoint publicly accessible
- [ ] SSL certificate valid and up-to-date
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Encryption key securely stored
- [ ] Monitoring and logging configured
- [ ] Error tracking (Sentry) set up
- [ ] Email templates tested
- [ ] Webhook signature verification working
- [ ] Rate limiting configured
- [ ] CORS settings configured
- [ ] Database backups enabled
- [ ] Load testing completed
- [ ] Security audit completed

## Post-Deployment

- [ ] Monitor webhook delivery
- [ ] Check email delivery rates
- [ ] Verify calendar sync
- [ ] Monitor error rates
- [ ] Review user feedback
- [ ] Check performance metrics
```

## Troubleshooting Guide

### Common Issues

**Webhook Not Receiving Events**

- Verify webhook URL is publicly accessible
- Check webhook signature verification logic
- Ensure firewall allows incoming requests
- Verify Cal.com webhook configuration

**Emails Not Sending**

- Check Resend API key is valid
- Verify sender email is verified in Resend
- Check email template for errors
- Review Resend dashboard for delivery status

**Calendar Sync Issues**

- Verify Google OAuth tokens are valid
- Check calendar permissions
- Ensure push notification channel is active
- Review Google Calendar API quota

**Availability Not Updating**

- Clear availability cache
- Verify calendar credentials
- Check for timezone mismatches
- Review event filtering logic

## Open Questions

- **Calendar path:** Cal.com (speed) vs direct Google API (control)
- Should we support multiple calendar providers?
- What's the cancellation policy (time limits)?
- Should we implement SMS reminders in addition to email?
- Do we need to support recurring bookings?
- Should we implement timezone detection for users?
- Do we need to support team bookings?

## Milestone

**M2 – Payments & Booking (1–2 wks)**

- Booking via Cal.com initially (fast), or start Direct API POC
- Webhook integration for booking data sync
- Email confirmations and reminders via Resend
- Basic booking management UI
- End-to-end testing and deployment

## Success Metrics

- Booking completion rate > 80%
- Email delivery rate > 99%
- Webhook processing latency < 2 seconds
- Calendar sync latency < 5 minutes
- User satisfaction score > 4.5/5

## References

- [Cal.com Documentation](https://cal.com/docs)
- [Cal.com API Reference](https://cal.com/docs/api)
- [Google Calendar API](https://developers.google.com/calendar)
- [Resend Documentation](https://resend.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
