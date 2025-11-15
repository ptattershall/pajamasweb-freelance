# Supabase Setup - Automated & Manual Steps

## ✅ Completed Automatically

The setup script has successfully completed the following:

### 1. Storage Bucket Created ✅

- **Bucket Name:** `hero-images`
- **Access:** Public
- **Status:** Ready to use

### 2. Admin User Created ✅

- **Email:** `admin@example.com`
- **Password:** `ChangeMe123!`
- **Status:** Email confirmed and ready to login

## ⚠️ Manual Step Required

### Create Database Tables

The database tables must be created manually in Supabase SQL Editor. This is the most reliable method:

**Step-by-Step Instructions:**

1. Open your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click the **New Query** button
4. Copy the SQL script below and paste it into the editor:

```sql
-- Image Metadata Schema for Phase 3

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  folder TEXT NOT NULL CHECK (folder IN ('blog', 'case-studies')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_post_images junction table
CREATE TABLE IF NOT EXISTS blog_post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_slug TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  is_hero BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_post_slug, image_id)
);

-- Create case_study_images junction table
CREATE TABLE IF NOT EXISTS case_study_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_slug TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  is_hero BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_study_slug, image_id)
);

-- Create indexes for performance
CREATE INDEX idx_images_folder ON images(folder);
CREATE INDEX idx_images_uploaded_at ON images(uploaded_at DESC);
CREATE INDEX idx_blog_post_images_slug ON blog_post_images(blog_post_slug);
CREATE INDEX idx_blog_post_images_hero ON blog_post_images(is_hero) WHERE is_hero = TRUE;
CREATE INDEX idx_case_study_images_slug ON case_study_images(case_study_slug);
CREATE INDEX idx_case_study_images_hero ON case_study_images(is_hero) WHERE is_hero = TRUE;

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for images (public read, authenticated write)
CREATE POLICY "Images are publicly readable"
  ON images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert images"
  ON images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their images"
  ON images FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for blog_post_images (public read, authenticated write)
CREATE POLICY "Blog post images are publicly readable"
  ON blog_post_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage blog post images"
  ON blog_post_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog post images"
  ON blog_post_images FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for case_study_images (public read, authenticated write)
CREATE POLICY "Case study images are publicly readable"
  ON case_study_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage case study images"
  ON case_study_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete case study images"
  ON case_study_images FOR DELETE
  USING (auth.role() = 'authenticated');
```

1. Click the **Run** button (or press Ctrl+Enter)
2. You should see a success message

**What this creates:**

- `images` table - Stores image metadata
- `blog_post_images` table - Associates images with blog posts
- `case_study_images` table - Associates images with case studies
- Row Level Security (RLS) policies for security
- Performance indexes for fast queries

## 🧪 Testing Your Setup

Once the database tables are created, test everything:

### 1. Test Login

Go to: `http://localhost:3000/admin/login`

- Email: `admin@example.com`
- Password: `ChangeMe123!`

### 2. Test Image Upload

Go to: `http://localhost:3000/admin/images`

- Upload a test image for blog posts
- Upload a test image for case studies
- Verify images appear in Supabase Storage

### 3. Test Image Display

- Visit a blog post: `http://localhost:3000/blog/getting-started-with-web-design`
- Visit a case study: `http://localhost:3000/case-studies/ecommerce-redesign`
- Images should display if associated in database

## 📝 Environment Variables

All required environment variables are already set in `.env.local`:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_SECRET_KEY`
- ✅ `SUPABASE_JWT_SECRET`

## 🔐 Security Notes

- Change the default admin password after first login
- The `SERVICE_ROLE_SECRET_KEY` should never be exposed in client code
- RLS policies protect data from unauthorized access
- Storage bucket is public but images are organized by folder

## 📚 Next Steps

1. Create database tables (manual SQL step above)
2. Test login and image upload
3. Start using the admin CMS!
