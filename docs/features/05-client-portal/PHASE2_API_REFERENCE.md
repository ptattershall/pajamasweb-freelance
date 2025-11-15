# Phase 2: Admin Client Management - API Reference

## Overview

Phase 2 adds 4 new API endpoints for managing clients and their invitations.

## Endpoints

### 1. List All Clients

**Endpoint**: `GET /api/admin/clients`  
**Authentication**: Required (OWNER role)  
**Rate Limit**: None

**Query Parameters**:
```
status: 'all' | 'active' | 'pending' (default: 'all')
search: string (optional, searches email and name)
limit: number (1-100, default: 20)
offset: number (default: 0)
```

**Example Request**:
```bash
GET /api/admin/clients?status=active&limit=20&offset=0
Cookie: auth-token=...
```

**Success Response** (200):
```json
{
  "success": true,
  "clients": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "status": "active",
      "createdAt": "2025-11-14T10:00:00Z",
      "acceptedAt": "2025-11-14T11:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 5,
    "hasMore": false
  }
}
```

**Error Responses**:
- 400: Invalid query parameters
- 401: Unauthorized (no auth token)
- 403: Forbidden (not OWNER role)
- 500: Internal server error

---

### 2. Get Client Details

**Endpoint**: `GET /api/admin/clients/[id]`  
**Authentication**: Required (OWNER role)  
**Rate Limit**: None

**Path Parameters**:
```
id: string (UUID of client)
```

**Example Request**:
```bash
GET /api/admin/clients/550e8400-e29b-41d4-a716-446655440000
Cookie: auth-token=...
```

**Success Response** (200):
```json
{
  "success": true,
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "status": "active",
    "createdAt": "2025-11-14T10:00:00Z",
    "acceptedAt": "2025-11-14T11:00:00Z"
  },
  "invitations": [
    {
      "id": "inv-uuid",
      "email": "john@example.com",
      "status": "accepted",
      "createdAt": "2025-11-14T10:00:00Z",
      "expiresAt": "2025-11-21T10:00:00Z",
      "acceptedAt": "2025-11-14T11:00:00Z"
    }
  ]
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden
- 404: Client not found
- 500: Internal server error

---

### 3. Resend Invitation

**Endpoint**: `POST /api/admin/invitations/[id]/resend`  
**Authentication**: Required (OWNER role)  
**Rate Limit**: None

**Path Parameters**:
```
id: string (UUID of invitation)
```

**Request Body**:
```json
{
  "expiresInDays": 7
}
```

**Example Request**:
```bash
POST /api/admin/invitations/inv-uuid/resend
Content-Type: application/json
Cookie: auth-token=...

{
  "expiresInDays": 7
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Invitation resent successfully",
  "invitation": {
    "id": "inv-uuid",
    "email": "john@example.com",
    "token": "new-token-32-chars",
    "expiresAt": "2025-11-21T10:00:00Z",
    "invitationUrl": "https://yourdomain.com/auth/accept-invitation?token=new-token-32-chars"
  }
}
```

**Error Responses**:
- 400: Invalid request body
- 401: Unauthorized
- 403: Forbidden
- 404: Invitation not found
- 500: Internal server error

---

### 4. Revoke Invitation

**Endpoint**: `DELETE /api/admin/invitations/[id]/revoke`  
**Authentication**: Required (OWNER role)  
**Rate Limit**: None

**Path Parameters**:
```
id: string (UUID of invitation)
```

**Example Request**:
```bash
DELETE /api/admin/invitations/inv-uuid/revoke
Cookie: auth-token=...
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Invitation revoked successfully",
  "invitation": {
    "id": "inv-uuid",
    "email": "john@example.com",
    "status": "expired"
  }
}
```

**Error Responses**:
- 400: Cannot revoke accepted invitation
- 401: Unauthorized
- 403: Forbidden
- 404: Invitation not found
- 500: Internal server error

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (no auth token) |
| 403 | Forbidden (not OWNER role) |
| 404 | Not found |
| 500 | Internal server error |

## Authentication

All endpoints require:
1. Valid `auth-token` cookie
2. User with `OWNER` role in profiles table

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for production.

## Pagination

List endpoints support pagination:
- `limit`: 1-100 (default: 20)
- `offset`: 0+ (default: 0)
- Response includes `hasMore` flag

## Filtering

### Status Filter
- `all`: All clients
- `active`: Clients who accepted invitation
- `pending`: Clients with pending invitation

### Search Filter
- Searches across email and display_name
- Case-insensitive
- Minimum 3 characters recommended

## Error Handling

All errors return JSON with error message:
```json
{
  "error": "Error message",
  "details": {} // Optional validation details
}
```

## Testing

### Using cURL

**List clients**:
```bash
curl -H "Cookie: auth-token=YOUR_TOKEN" \
  "http://localhost:3000/api/admin/clients?status=active"
```

**Get client details**:
```bash
curl -H "Cookie: auth-token=YOUR_TOKEN" \
  "http://localhost:3000/api/admin/clients/CLIENT_ID"
```

**Resend invitation**:
```bash
curl -X POST \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expiresInDays": 7}' \
  "http://localhost:3000/api/admin/invitations/INV_ID/resend"
```

**Revoke invitation**:
```bash
curl -X DELETE \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  "http://localhost:3000/api/admin/invitations/INV_ID/revoke"
```

## Notes

- All timestamps are in ISO 8601 format
- All IDs are UUIDs
- Tokens are 32-character random strings
- Invitations expire after specified days
- Accepted invitations cannot be revoked

