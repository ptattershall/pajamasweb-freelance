# Quick Start Guide - Phase 3 Admin CMS

## What's Ready

✅ Admin dashboard at `http://localhost:3000/admin`
✅ Image upload component with drag-and-drop
✅ API endpoints for upload/delete
✅ Database schema for image metadata
✅ Login page scaffolding
✅ Route protection middleware

## Getting Started (5 minutes)

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Visit Admin Dashboard
```
http://localhost:3000/admin
```

You'll see:
- Dashboard with stats
- Blog management
- Case studies management
- Image management

## Manual Setup Required (15 minutes)

### Step 1: Create Supabase Storage Bucket

1. Go to Supabase dashboard
2. Storage → Create bucket
3. Name: `hero-images`
4. Visibility: Public
5. Click Create

### Step 2: Configure RLS Policies

In Supabase Storage Policies:

```sql
-- Public read
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Authenticated upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

-- Authenticated delete
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-images' AND auth.role() = 'authenticated');
```

### Step 3: Create Database Tables

1. Go to Supabase SQL Editor
2. Create new query
3. Copy contents of `docs/database/02-image-metadata-schema.sql`
4. Run query

## Testing Image Upload

1. Navigate to `http://localhost:3000/admin/images`
2. Drag and drop an image (or click to select)
3. Image should upload to Supabase Storage
4. Check Supabase Storage to verify

## Next: Implement Authentication

See `docs/ADMIN_AUTH_SETUP.md` for:
- Setting up Supabase Auth
- Implementing login logic
- Protecting routes

## File Structure

```
app/admin/
├── layout.tsx          # Sidebar navigation
├── page.tsx            # Dashboard
├── login/
│   └── page.tsx        # Login page
├── images/
│   └── page.tsx        # Image management
├── blog/
│   └── page.tsx        # Blog management
└── case-studies/
    └── page.tsx        # Case studies management

app/api/
├── images/
│   ├── upload/
│   │   └── route.ts    # Upload endpoint
│   └── delete/
│       └── route.ts    # Delete endpoint
└── search/
    └── route.ts        # Search endpoint

components/
├── ImageUpload.tsx     # Upload component
└── ui/                 # shadcn components
```

## Key Features

### Image Upload
- Max 5MB files
- Supports: JPEG, PNG, WebP, GIF
- Organized by folder (blog, case-studies)
- Drag-and-drop support

### Database
- Image metadata tracking
- Blog post associations
- Case study associations
- Hero image support

### API
- `/api/images/upload` - Upload images
- `/api/images/delete` - Delete images
- `/api/search` - Search content

## Documentation

- `docs/SUPABASE_STORAGE_SETUP.md` - Storage setup
- `docs/ADMIN_AUTH_SETUP.md` - Authentication setup
- `docs/API_REFERENCE.md` - API documentation
- `docs/database/02-image-metadata-schema.sql` - Database schema

## Troubleshooting

**"Bucket not found" error**
- Verify bucket name is `hero-images`
- Check bucket visibility is Public

**"Permission denied" error**
- Verify RLS policies are set
- Check user is authenticated

**Images not uploading**
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Check network tab in DevTools

## Build Status

✅ Build passes with no errors
✅ All routes pre-rendered
✅ TypeScript strict mode enabled
✅ Ready for deployment

## Next Steps

1. ✅ Set up Supabase Storage (manual)
2. ✅ Create database tables (manual)
3. ⏳ Implement Supabase Auth (code)
4. ⏳ Display images on pages (code)
5. ⏳ Image optimization (code)

Estimated time: 2-3 days

