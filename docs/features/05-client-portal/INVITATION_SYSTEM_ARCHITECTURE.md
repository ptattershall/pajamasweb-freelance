# Client Portal Invitation System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAJAMASWEB CLIENT PORTAL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ADMIN SIDE                          CLIENT SIDE                 │
│  ──────────                          ──────────                  │
│                                                                   │
│  /admin/clients                      /auth/accept-invitation     │
│  ├─ View all clients                 ├─ Validate token          │
│  ├─ Create invitations               ├─ Set password            │
│  ├─ Resend invitations               ├─ Create account          │
│  └─ Revoke invitations               └─ Redirect to signin      │
│                                                                   │
│  /admin/clients/invite               /portal/*                  │
│  └─ Invitation form                  ├─ Dashboard               │
│                                       ├─ Invoices (view/pay)    │
│  API: /api/admin/invitations/*       ├─ Contracts              │
│  ├─ POST /create                     ├─ Bookings               │
│  ├─ GET /list                        ├─ Deliverables           │
│  ├─ POST /[id]/resend                └─ Profile                │
│  └─ DELETE /[id]                                                │
│                                       API: /api/portal/*        │
│                                       ├─ GET /invoices          │
│                                       ├─ POST /invoices/pay     │
│                                       ├─ GET /contracts         │
│                                       └─ GET /bookings          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Invitation Creation Flow

```
Admin clicks "Invite Client"
    ↓
Admin enters email + company
    ↓
POST /api/admin/invitations/create
    ↓
Generate secure token (32 chars)
    ↓
Save to invitations table
    ↓
Send email with invitation link
    ↓
Show success with copy-to-clipboard
```

### 2. Client Acceptance Flow

```
Client receives email
    ↓
Clicks invitation link
    ↓
GET /auth/accept-invitation?token=xxx
    ↓
Validate token (not expired, not used)
    ↓
Show form: password + company
    ↓
Client submits form
    ↓
POST /api/auth/accept-invitation
    ↓
Create auth user
    ↓
Create profile with role=CLIENT
    ↓
Mark invitation as accepted
    ↓
Create session
    ↓
Redirect to /portal
```

### 3. Client Portal Access Flow

```
Client visits /portal
    ↓
Middleware checks auth token
    ↓
Token valid? → Continue
Token invalid? → Redirect to /auth/signin
    ↓
Load portal dashboard
    ↓
Query invoices, bookings, etc.
    ↓
RLS policies ensure client only sees their data
```

## Database Schema

### invitations table
```sql
id              UUID PRIMARY KEY
email           TEXT NOT NULL
token           TEXT UNIQUE NOT NULL
status          TEXT (pending|accepted|expired)
created_by      UUID REFERENCES auth.users
created_at      TIMESTAMPTZ
expires_at      TIMESTAMPTZ
accepted_at     TIMESTAMPTZ
accepted_by     UUID REFERENCES auth.users
```

### profiles table (updated)
```sql
user_id              UUID PRIMARY KEY
role                 TEXT (OWNER|CLIENT)
display_name         TEXT
company              TEXT
avatar_url           TEXT
email_verified       BOOLEAN
invited_by           UUID REFERENCES auth.users
invitation_accepted_at TIMESTAMPTZ
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
```

## Security Model

### Authentication
- Supabase Auth for user accounts
- JWT tokens stored in httpOnly cookies
- Session validation on every request

### Authorization
- Role-based access control (OWNER vs CLIENT)
- RLS policies on all tables
- Admin endpoints check OWNER role
- Client endpoints check CLIENT role

### Invitation Security
- Tokens are 32-character random strings
- Tokens expire after 7 days
- Tokens are single-use (marked as accepted)
- Email validation prevents typos
- Duplicate invitation prevention

### Data Protection
- RLS policies ensure clients only see their data
- Admins can see all client data
- Signed URLs for file downloads
- Rate limiting on API endpoints

## API Endpoints

### Admin Endpoints (OWNER only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/invitations/create` | Create invitation |
| GET | `/api/admin/invitations` | List invitations |
| POST | `/api/admin/invitations/[id]/resend` | Resend invitation |
| DELETE | `/api/admin/invitations/[id]` | Revoke invitation |
| GET | `/api/admin/clients` | List all clients |
| GET | `/api/admin/clients/[id]` | Get client details |

### Public Endpoints (No auth required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/validate-invitation` | Validate token |
| POST | `/api/auth/accept-invitation` | Accept invitation |

### Client Endpoints (CLIENT role required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/portal/invoices` | List invoices |
| POST | `/api/portal/invoices/[id]/pay` | Pay invoice |
| GET | `/api/portal/contracts` | List contracts |
| GET | `/api/portal/bookings` | List bookings |
| GET | `/api/portal/deliverables` | List deliverables |

## File Structure

```
app/
├── admin/
│   ├── clients/
│   │   ├── page.tsx              # Client list
│   │   ├── invite/
│   │   │   └── page.tsx          # Invite form
│   │   └── [id]/
│   │       └── page.tsx          # Client detail
│   └── ...
├── auth/
│   ├── accept-invitation/
│   │   └── page.tsx              # Accept invitation UI
│   ├── signin/
│   ├── signup/
│   └── ...
├── portal/
│   ├── invoices/
│   ├── contracts/
│   ├── bookings/
│   └── ...
└── api/
    ├── admin/
    │   └── invitations/
    │       ├── create/route.ts
    │       ├── route.ts
    │       └── [id]/
    │           ├── resend/route.ts
    │           └── revoke/route.ts
    ├── auth/
    │   ├── validate-invitation/route.ts
    │   └── accept-invitation/route.ts
    └── portal/
        ├── invoices/route.ts
        └── ...

lib/
├── auth-service.ts               # Auth functions
├── email-service.ts              # Email functions
└── ...

scripts/
└── migrations/
    └── 009_client_invitations.sql
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Email
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Deployment Checklist

- [ ] Run database migration (009_client_invitations.sql)
- [ ] Set environment variables
- [ ] Test invitation flow in staging
- [ ] Test client portal access
- [ ] Verify email sending
- [ ] Test RLS policies
- [ ] Deploy to production
- [ ] Monitor for errors

