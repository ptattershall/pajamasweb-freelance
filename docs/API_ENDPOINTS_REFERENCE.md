# Phase 6 API Endpoints Reference

## Client Endpoints

### Milestones

#### Get All Milestones
```
GET /api/portal/milestones
Authentication: Required (Session)
Response: Milestone[]
```

#### Get Single Milestone with Updates
```
GET /api/portal/milestones/[id]
Authentication: Required (Session)
Response: {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  progress_percent: number
  created_at: string
  updated_at: string
  updates: MilestoneUpdate[]
}
```

### Notifications

#### Get Unread Notifications
```
GET /api/portal/notifications
Authentication: Required (Session)
Response: Notification[]
```

#### Mark Notification as Read
```
POST /api/portal/notifications/[id]/read
Authentication: Required (Session)
Response: Notification
```

### Projects

#### Get Project Overview
```
GET /api/portal/projects/overview
Authentication: Required (Session)
Response: {
  stats: {
    total_milestones: number
    completed_milestones: number
    in_progress_milestones: number
    blocked_milestones: number
    total_deliverables: number
    total_contracts: number
    signed_contracts: number
    average_progress: number
  }
  milestones: Milestone[]
  deliverables: Deliverable[]
  contracts: Contract[]
}
```

## Admin Endpoints

### Milestones

#### List All Milestones
```
GET /api/admin/milestones
Authentication: Required (Session + OWNER role)
Response: Milestone[]
```

#### Create Milestone
```
POST /api/admin/milestones
Authentication: Required (Session + OWNER role)
Body: {
  client_id: string (UUID)
  title: string (required)
  description: string (optional)
  due_date: string (ISO date, optional)
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  progress_percent: number (0-100)
}
Response: Milestone (201 Created)
```

#### Update Milestone
```
PUT /api/admin/milestones/[id]
Authentication: Required (Session + OWNER role)
Body: {
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  progress_percent: number
}
Response: Milestone
```

#### Delete Milestone
```
DELETE /api/admin/milestones/[id]
Authentication: Required (Session + OWNER role)
Response: { success: true }
```

#### Add Milestone Update
```
POST /api/admin/milestones/[id]/updates
Authentication: Required (Session + OWNER role)
Body: {
  update_text: string (required)
}
Response: MilestoneUpdate (201 Created)
```

### Notifications

#### Create Notification
```
POST /api/admin/notifications
Authentication: Required (Session + OWNER role)
Body: {
  client_id: string (UUID)
  milestone_id: string (UUID)
  notification_type: 'status_change' | 'progress_update' | 'due_soon' | 'overdue'
  message: string
}
Response: Notification (201 Created)
```

## Data Types

### Milestone
```typescript
{
  id: string
  client_id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  progress_percent: number
  created_at: string
  updated_at: string
}
```

### MilestoneUpdate
```typescript
{
  id: string
  milestone_id: string
  update_text: string
  created_at: string
}
```

### Notification
```typescript
{
  id: string
  client_id: string
  milestone_id: string
  notification_type: 'status_change' | 'progress_update' | 'due_soon' | 'overdue'
  message: string
  read: boolean
  created_at: string
}
```

## Error Responses

### 401 Unauthorized
```json
{ "error": "Unauthorized" }
```

### 403 Forbidden
```json
{ "error": "Only admins can access this" }
```

### 404 Not Found
```json
{ "error": "Milestone not found" }
```

### 500 Internal Server Error
```json
{ "error": "Failed to fetch milestones" }
```

## Authentication

All endpoints require:
- Valid Supabase session cookie
- User must be authenticated
- Admin endpoints require OWNER role

## Rate Limiting

No explicit rate limiting implemented. Consider adding:
- 100 requests per minute per user
- 1000 requests per minute per IP

## Pagination

Not implemented. Consider adding for large datasets:
- `limit` parameter (default: 50, max: 100)
- `offset` parameter (default: 0)

---

**Last Updated:** November 14, 2025
**Version:** 1.0
**Status:** Production Ready

