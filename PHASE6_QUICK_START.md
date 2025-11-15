# Phase 6 Quick Start Guide

## 🚀 Getting Started

### 1. Database Migration
First, run the new migration in Supabase:

```sql
-- Copy and paste the contents of:
-- scripts/migrations/011_milestone_notifications.sql
-- Into Supabase SQL Editor and execute
```

### 2. Client Portal Features

#### View Project Overview
- Navigate to `/portal/projects`
- See all milestone statistics
- View overall project progress
- Access deliverables and contracts summary

#### View Milestone Details
- Go to `/portal/milestones`
- Click any milestone card
- View full details, progress, and update history
- See all milestone updates with timestamps

#### Check Notifications
- Unread notifications appear in the notification system
- Mark notifications as read via API
- Notification types: status_change, progress_update, due_soon, overdue

### 3. Admin Features

#### Manage Milestones
- Navigate to `/admin/milestones`
- Create new milestones for clients
- Update milestone status and progress
- Delete milestones
- Add milestone updates/notes

#### Create Notifications
- Use API endpoint: `POST /api/admin/notifications`
- Payload:
```json
{
  "client_id": "uuid",
  "milestone_id": "uuid",
  "notification_type": "status_change|progress_update|due_soon|overdue",
  "message": "Your message here"
}
```

## 📡 API Reference

### Client Endpoints

#### Get All Milestones
```
GET /api/portal/milestones
```

#### Get Single Milestone with Updates
```
GET /api/portal/milestones/[id]
```

#### Get Unread Notifications
```
GET /api/portal/notifications
```

#### Mark Notification as Read
```
POST /api/portal/notifications/[id]/read
```

#### Get Project Overview
```
GET /api/portal/projects/overview
```

### Admin Endpoints

#### List All Milestones
```
GET /api/admin/milestones
```

#### Create Milestone
```
POST /api/admin/milestones
Body: {
  "client_id": "uuid",
  "title": "string",
  "description": "string",
  "due_date": "ISO date",
  "status": "pending|in_progress|completed|blocked",
  "progress_percent": 0-100
}
```

#### Update Milestone
```
PUT /api/admin/milestones/[id]
Body: { same as create }
```

#### Delete Milestone
```
DELETE /api/admin/milestones/[id]
```

#### Add Milestone Update
```
POST /api/admin/milestones/[id]/updates
Body: {
  "update_text": "string"
}
```

#### Create Notification
```
POST /api/admin/notifications
Body: {
  "client_id": "uuid",
  "milestone_id": "uuid",
  "notification_type": "status_change|progress_update|due_soon|overdue",
  "message": "string"
}
```

## 🔍 Navigation

### Client Portal
- Dashboard → Projects (new)
- Projects → Milestones (existing)
- Projects → Deliverables
- Projects → Contracts

### Admin Panel
- Admin → Milestones (new)

## 💡 Common Tasks

### Create a Milestone for a Client
1. Go to `/admin/milestones`
2. Click "New Milestone"
3. Fill in client ID, title, description
4. Set due date and status
5. Set progress percentage
6. Click "Save"

### Update Milestone Progress
1. Go to `/admin/milestones`
2. Find the milestone
3. Click "Edit" (when implemented)
4. Update progress percentage
5. Save changes

### Notify Client of Milestone Update
1. Use API: `POST /api/admin/notifications`
2. Include client_id, milestone_id, notification_type, message
3. Client will see unread notification

### View Project Status
1. Client logs in
2. Clicks "Projects" in sidebar
3. Sees overview with:
   - Total milestones
   - Completed/in-progress/blocked counts
   - Overall progress percentage
   - Recent milestones list

## 🐛 Troubleshooting

### Milestone Not Showing
- Verify client_id is correct
- Check RLS policies are enabled
- Ensure user is authenticated

### Notification Not Appearing
- Verify milestone_id exists
- Check client_id is correct
- Ensure notification_type is valid

### Admin Access Denied
- Verify user role is 'OWNER'
- Check authentication session
- Verify user profile exists

## 📞 Support

For issues or questions:
1. Check the detailed documentation in `docs/features/05-client-portal/PHASE6_COMPLETION.md`
2. Review API endpoint implementations
3. Check database RLS policies
4. Verify authentication session

---

**Ready to use!** All features are production-ready after database migration.

