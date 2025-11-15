# Invitation System - Quick Reference

## 🎯 What Changed

| Before | After |
|--------|-------|
| Anyone could sign up | Only invited clients can sign up |
| No admin control | Admin controls who gets access |
| No tracking | Full invitation tracking |
| No email notifications | Automatic email invitations |

## 📍 Key Files

### Database
- `scripts/migrations/009_client_invitations.sql` - Run this first!

### Auth Service
- `lib/auth-service.ts` - Functions: `createInvitation()`, `validateInvitation()`, `acceptInvitation()`
- `lib/email-service.ts` - Function: `sendInvitationEmail()`

### API Endpoints
- `app/api/admin/invitations/create/route.ts` - Create invitation
- `app/api/admin/invitations/route.ts` - List invitations
- `app/api/auth/validate-invitation/route.ts` - Validate token
- `app/api/auth/accept-invitation/route.ts` - Accept invitation

### UI Pages
- `app/auth/accept-invitation/page.tsx` - Accept invitation form
- `app/auth/signup/page.tsx` - Now redirects to invitation flow

## 🔑 Key Functions

### Create Invitation (Admin)
```typescript
import { createInvitation } from '@/lib/auth-service'

const { invitation, token, success } = await createInvitation(
  'client@example.com',
  adminUserId,
  7  // expires in 7 days
)

const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${token}`
```

### Validate Invitation (Client)
```typescript
import { validateInvitation } from '@/lib/auth-service'

const { valid, invitation, error } = await validateInvitation(token)
```

### Accept Invitation (Client)
```typescript
import { acceptInvitation } from '@/lib/auth-service'

const { user, success } = await acceptInvitation(
  token,
  'password123',
  'John Doe',
  'Acme Corp'
)
```

## 🔗 API Endpoints

### Admin Only (OWNER role required)

**Create Invitation**
```
POST /api/admin/invitations/create
Content-Type: application/json
Cookie: auth-token=...

{
  "email": "client@example.com",
  "expiresInDays": 7
}

Response: { success: true, invitation: {...}, token: "..." }
```

**List Invitations**
```
GET /api/admin/invitations?status=pending&limit=20&offset=0
Cookie: auth-token=...

Response: { success: true, invitations: [...], pagination: {...} }
```

### Public (No auth required)

**Validate Token**
```
GET /api/auth/validate-invitation?token=xxx

Response: { valid: true, email: "...", expiresAt: "..." }
```

**Accept Invitation**
```
POST /api/auth/accept-invitation
Content-Type: application/json

{
  "token": "xxx",
  "password": "...",
  "display_name": "...",
  "company": "..."
}

Response: { success: true, user: {...} }
```

## 🗄️ Database Tables

### invitations
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

### profiles (updated)
```sql
invited_by              UUID REFERENCES auth.users
invitation_accepted_at  TIMESTAMPTZ
```

## 🔐 Security Checklist

- ✅ Tokens are 32-character random strings
- ✅ Tokens expire after 7 days
- ✅ Tokens are single-use (marked as accepted)
- ✅ Email validation prevents typos
- ✅ Duplicate invitation prevention
- ✅ Admin-only invitation creation
- ✅ RLS policies protect all data
- ✅ Session-based authentication

## 🧪 Testing Commands

### Create Invitation
```bash
curl -X POST http://localhost:3000/api/admin/invitations/create \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN" \
  -d '{"email": "test@example.com"}'
```

### List Invitations
```bash
curl http://localhost:3000/api/admin/invitations \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN"
```

### Validate Token
```bash
curl "http://localhost:3000/api/auth/validate-invitation?token=TOKEN"
```

## 📋 Implementation Checklist

- [ ] Run database migration (009_client_invitations.sql)
- [ ] Test create invitation endpoint
- [ ] Test validate invitation endpoint
- [ ] Test accept invitation endpoint
- [ ] Test email sending
- [ ] Test client portal access
- [ ] Test RLS policies
- [ ] Deploy to production

## 🚀 Next Phase (Phase 2)

Admin dashboard features:
- [ ] Client list page
- [ ] Invitation creation form
- [ ] Resend invitation endpoint
- [ ] Revoke invitation endpoint

See: `PHASE2_ADMIN_FUNCTIONALITY_GUIDE.md`

## 📚 Full Documentation

- `README_INVITATION_SYSTEM.md` - Complete guide
- `INVITATION_SYSTEM_ARCHITECTURE.md` - System design
- `INVITATION_SYSTEM_IMPLEMENTATION_SUMMARY.md` - What was built
- `CLIENT_PORTAL_INVITATION_SYSTEM_TRACKING.md` - Progress tracker
- `PHASE2_ADMIN_FUNCTIONALITY_GUIDE.md` - Next phase guide

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🆘 Troubleshooting

**Token not working?**
- Check if token is expired (7 days)
- Check if token was already used
- Verify token format (32 characters)

**Email not sending?**
- Check RESEND_API_KEY is set
- Check RESEND_FROM_EMAIL is set
- Check email address is valid

**Client can't access portal?**
- Check auth token cookie is set
- Check user role is CLIENT
- Check RLS policies allow access

## 📞 Support

See documentation files for detailed information on:
- Architecture and data flow
- API endpoint specifications
- Database schema
- Security implementation
- Testing procedures

