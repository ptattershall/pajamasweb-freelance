# Phase 5: Deliverables & Contracts - Quick Start Guide

## Overview

Phase 5 provides complete file management for the client portal with secure storage, downloads, and previews.

## Quick Setup (5 minutes)

### 1. Run Database Migration

```sql
-- Copy and run in Supabase SQL Editor
-- File: scripts/migrations/010_client_portal_file_storage.sql

-- Creates storage buckets and RLS policies
```

### 2. Verify Storage Buckets

In Supabase Dashboard:
1. Go to Storage
2. Verify `deliverables` bucket exists
3. Verify `contracts` bucket exists

### 3. Test Admin Upload

1. Navigate to `http://localhost:3000/admin/deliverables`
2. Fill in form:
   - Client ID: (any valid UUID)
   - Title: "Test Deliverable"
   - File: (any PDF or image)
3. Click "Upload Deliverable"
4. Should see success message

### 4. Test Client Download

1. Navigate to `http://localhost:3000/portal/deliverables`
2. Should see uploaded deliverable
3. Click preview icon to view in modal
4. Click download icon to download file

## File Structure

```
Phase 5 Implementation:
├── Database
│   └── scripts/migrations/010_client_portal_file_storage.sql
├── Services
│   └── lib/storage-service.ts
├── API Routes
│   ├── app/api/portal/deliverables/[id]/download/route.ts
│   ├── app/api/portal/contracts/[id]/download/route.ts
│   ├── app/api/admin/deliverables/upload/route.ts
│   └── app/api/admin/contracts/upload/route.ts
├── Admin Pages
│   ├── app/admin/deliverables/page.tsx
│   └── app/admin/contracts/page.tsx
├── Portal Pages
│   ├── app/portal/deliverables/page.tsx
│   └── app/portal/contracts/page.tsx
├── Components
│   └── components/file-preview-modal.tsx
└── Tests
    ├── scripts/test-phase5-file-storage.ts
    └── scripts/test-phase5-api.ts
```

## Key Features

### For Clients
- View deliverables and contracts
- Preview files (PDFs, images, documents)
- Download files with signed URLs
- See file metadata (size, type, date)

### For Admins
- Upload deliverables for clients
- Upload contracts for clients
- Assign to specific clients
- Add descriptions and project IDs

## API Endpoints

### Client Endpoints (Authenticated)

```
GET /api/portal/deliverables
  - List all deliverables for authenticated client

GET /api/portal/deliverables/[id]/download
  - Generate signed URL for deliverable download

GET /api/portal/contracts
  - List all contracts for authenticated client

GET /api/portal/contracts/[id]/download
  - Generate signed URL for contract download
```

### Admin Endpoints (Owner Only)

```
POST /api/admin/deliverables/upload
  - Upload new deliverable
  - Body: FormData with file, clientId, title, description, projectId

POST /api/admin/contracts/upload
  - Upload new contract
  - Body: FormData with file, clientId, title
```

## Security Features

- **Authentication:** Session-based via Supabase
- **Authorization:** RLS policies enforce data access
- **Signed URLs:** Time-limited (1 hour) for downloads
- **Private Storage:** Buckets are not publicly accessible
- **Role-Based:** Clients see only their files, owners see all

## Testing

```bash
# Test database and storage setup
npx ts-node scripts/test-phase5-file-storage.ts

# Test API endpoints
npx ts-node scripts/test-phase5-api.ts
```

## Troubleshooting

### Files not uploading
- Check Supabase Storage buckets exist
- Verify RLS policies are enabled
- Check user has OWNER role

### Downloads not working
- Verify signed URL generation endpoint
- Check file exists in storage
- Verify client owns the file

### Preview not showing
- Check file type is supported (PDF, image, text)
- Verify signed URL is valid
- Check browser console for errors

## Next Steps

1. Run migration in Supabase
2. Test admin upload
3. Test client download
4. Test file preview
5. Deploy to production

## Support

For detailed documentation, see:
- `docs/features/05-client-portal/CLIENT_PORTAL_FEATURE.md`
- `docs/features/05-client-portal/PHASE5_COMPLETION_SUMMARY.md`

