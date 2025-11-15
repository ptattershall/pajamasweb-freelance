# Supabase Storage Setup Guide

## Overview

This guide walks through setting up Supabase Storage for hero image uploads in the PJais.ai project.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name it: `hero-images`
5. Set visibility to **Public** (so images are accessible)
6. Click **Create bucket**

## Step 2: Configure RLS Policies

In the Supabase dashboard, go to **Storage** → **Policies** for the `hero-images` bucket:

### Public Read Policy
```sql
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-images');
```

### Authenticated Upload Policy
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);
```

### Authenticated Delete Policy
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Create Database Tables

Run the SQL migration in `docs/database/02-image-metadata-schema.sql`:

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy and paste the contents of `02-image-metadata-schema.sql`
4. Click **Run**

This creates:
- `images` table - Image metadata
- `blog_post_images` - Junction table for blog posts
- `case_study_images` - Junction table for case studies

## Step 4: Test Upload

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin/images`
3. Try uploading an image
4. Check Supabase Storage to verify the file was uploaded

## File Structure in Storage

Images are organized by folder:

```
hero-images/
├── blog/
│   ├── 1699564800000-my-image.jpg
│   └── 1699564900000-another-image.png
└── case-studies/
    ├── 1699565000000-project-image.jpg
    └── 1699565100000-results-image.png
```

## API Endpoints

### Upload Image
```bash
POST /api/images/upload

FormData:
- file: File
- folder: 'blog' | 'case-studies'

Response:
{
  "success": true,
  "file": {
    "path": "blog/1699564800000-image.jpg",
    "url": "https://...",
    "name": "image.jpg",
    "size": 102400,
    "type": "image/jpeg"
  }
}
```

### Delete Image
```bash
POST /api/images/delete

Body:
{
  "path": "blog/1699564800000-image.jpg"
}

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Validation Rules

- **Max file size:** 5MB
- **Allowed types:** JPEG, PNG, WebP, GIF
- **Folders:** blog, case-studies

## Troubleshooting

### "Bucket not found" error
- Verify bucket name is exactly `hero-images`
- Check bucket visibility is set to Public

### "Permission denied" error
- Verify RLS policies are set correctly
- Check user is authenticated for upload/delete

### Images not displaying
- Verify bucket is public
- Check image URL is correct
- Verify CORS settings if needed

## Next Steps

1. Associate images with blog posts/case studies
2. Display images on content pages
3. Implement image optimization
4. Add authentication to admin routes

See `docs/NEXT_STEPS.md` for more details.

