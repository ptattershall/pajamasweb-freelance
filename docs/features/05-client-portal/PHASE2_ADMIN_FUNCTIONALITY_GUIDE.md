# Phase 2: Admin Client Management - Implementation Guide

**Status**: READY TO START  
**Priority**: HIGH  
**Estimated Time**: 2-3 days

## Overview

Phase 2 implements the admin dashboard for managing clients and invitations. This allows you (the admin) to:
- View all clients and their status
- Create new client invitations
- Resend expired invitations
- Revoke/cancel invitations
- Track invitation acceptance

## Architecture

### Admin Routes
```
/admin/clients                    # Client list & management
/admin/clients/invite             # Create new invitation
/admin/clients/[id]               # Client detail page
/admin/clients/[id]/edit          # Edit client info
```

### API Endpoints
```
GET    /api/admin/clients                    # List all clients
GET    /api/admin/clients/[id]               # Get client details
POST   /api/admin/invitations/create         # Create invitation (DONE)
GET    /api/admin/invitations                # List invitations (DONE)
POST   /api/admin/invitations/[id]/resend    # Resend invitation
DELETE /api/admin/invitations/[id]           # Revoke invitation
```

## Implementation Tasks

### Task 2.1: Create Admin Clients List Page

**File**: `app/admin/clients/page.tsx`

**Features**:
- Display table of all clients
- Show client name, email, company, status
- Show invitation date and acceptance date
- Search/filter by name or email
- Pagination (20 per page)
- Action buttons: View, Edit, Resend Invite, Revoke

**Data to Display**:
```typescript
interface ClientRow {
  id: string                    // user_id
  email: string                 // from auth.users
  display_name: string
  company: string | null
  status: 'pending' | 'active'  // pending = not accepted, active = accepted
  invited_at: string
  accepted_at: string | null
  invited_by: string            // admin name
}
```

**Query**:
```sql
SELECT 
  p.user_id,
  au.email,
  p.display_name,
  p.company,
  CASE WHEN p.invitation_accepted_at IS NULL THEN 'pending' ELSE 'active' END as status,
  i.created_at as invited_at,
  p.invitation_accepted_at as accepted_at,
  admin.display_name as invited_by
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
LEFT JOIN invitations i ON i.accepted_by = p.user_id
LEFT JOIN profiles admin ON admin.user_id = p.invited_by
WHERE p.role = 'CLIENT'
ORDER BY p.created_at DESC
```

### Task 2.2: Create Admin Invite Client Page

**File**: `app/admin/clients/invite/page.tsx`

**Features**:
- Form to enter client email
- Optional: company name
- Optional: expiration days (1-30, default 7)
- Submit button to create invitation
- Success message with invitation link
- Copy-to-clipboard for invitation URL

**Form Fields**:
```typescript
{
  email: string              // required, must be valid email
  company?: string           // optional
  expiresInDays?: number     // optional, default 7
}
```

**Success Response**:
```typescript
{
  success: true
  invitation: {
    id: string
    email: string
    token: string
    expiresAt: string
  }
  invitationUrl: string      // Full URL to send to client
}
```

### Task 2.3: Create API Endpoint - Resend Invitation

**File**: `app/api/admin/invitations/[id]/resend/route.ts`

**Functionality**:
- Find existing invitation by ID
- Check if it's expired or already accepted
- Generate new token
- Update invitation record
- Send new email
- Return new invitation URL

**Request**:
```
POST /api/admin/invitations/{invitationId}/resend
Authorization: Required (OWNER)
```

**Response**:
```json
{
  "success": true,
  "invitation": {
    "id": "uuid",
    "token": "new_token",
    "expiresAt": "2025-11-21T..."
  },
  "invitationUrl": "https://..."
}
```

### Task 2.4: Create API Endpoint - Revoke Invitation

**File**: `app/api/admin/invitations/[id]/revoke/route.ts`

**Functionality**:
- Find invitation by ID
- Check if it's not already accepted
- Mark as 'expired' status
- Return success

**Request**:
```
DELETE /api/admin/invitations/{invitationId}
Authorization: Required (OWNER)
```

**Response**:
```json
{
  "success": true,
  "message": "Invitation revoked"
}
```

### Task 2.5: Create API Endpoint - List Clients

**File**: `app/api/admin/clients/route.ts`

**Functionality**:
- List all CLIENT role users
- Include invitation status
- Support filtering by status (pending/active)
- Support search by email/name
- Pagination

**Query Parameters**:
```
GET /api/admin/clients?status=active&search=john&limit=20&offset=0
```

**Response**:
```json
{
  "success": true,
  "clients": [...],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Database Queries Needed

### Get all clients with invitation status
```sql
SELECT 
  p.user_id,
  au.email,
  p.display_name,
  p.company,
  p.created_at,
  p.invitation_accepted_at,
  i.created_at as invited_at,
  i.status as invitation_status
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
LEFT JOIN invitations i ON i.accepted_by = p.user_id
WHERE p.role = 'CLIENT'
ORDER BY p.created_at DESC
```

### Get pending invitations
```sql
SELECT 
  i.*,
  au.email as admin_email,
  admin.display_name as admin_name
FROM invitations i
LEFT JOIN auth.users au ON i.created_by = au.id
LEFT JOIN profiles admin ON admin.user_id = i.created_by
WHERE i.status = 'pending'
ORDER BY i.created_at DESC
```

## UI Components Needed

- **ClientsTable**: Display clients in table format
- **InvitationForm**: Form to create new invitation
- **InvitationSuccess**: Show success with copy-to-clipboard
- **ClientActions**: Dropdown menu for client actions
- **SearchBar**: Search clients by email/name
- **StatusBadge**: Show pending/active status

## Testing Checklist

- [ ] Create invitation as admin
- [ ] Verify email is sent
- [ ] Accept invitation as client
- [ ] Verify client appears in admin list as "active"
- [ ] Resend invitation to pending client
- [ ] Verify new token works
- [ ] Revoke invitation
- [ ] Verify revoked invitation cannot be used
- [ ] Search clients by email
- [ ] Filter by status
- [ ] Pagination works

## Security Considerations

- ✅ All endpoints require OWNER role
- ✅ RLS policies protect data
- ✅ Tokens are single-use
- ✅ Tokens expire after 7 days
- ✅ Email validation on creation
- ✅ Duplicate invitation prevention

## Next Steps After Phase 2

Once Phase 2 is complete:
1. Run database migration (009_client_invitations.sql)
2. Test admin invitation flow
3. Move to Phase 4: Client Portal Features
   - Invoice viewing and payment
   - Contract viewing
   - Booking viewing
   - Deliverables viewing

