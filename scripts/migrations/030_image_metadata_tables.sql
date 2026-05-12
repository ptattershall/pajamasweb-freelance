-- 030: Track image metadata tables used by blog and case-study pages.
--
-- Purpose:
-- - Create the images, blog_post_images, and case_study_images tables in the
--   tracked migration chain instead of relying on manual SQL docs.
-- - Restore the foreign-key relationships required by PostgREST nested selects
--   like blog_post_images -> images and case_study_images -> images.
-- - Allow public read access to image metadata while keeping writes limited to
--   authenticated users via RLS.

CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  folder TEXT NOT NULL CHECK (folder IN ('blog', 'case-studies')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_slug TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  is_hero BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blog_post_images_unique UNIQUE (blog_post_slug, image_id)
);

CREATE TABLE IF NOT EXISTS public.case_study_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_slug TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  is_hero BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT case_study_images_unique UNIQUE (case_study_slug, image_id)
);

ALTER TABLE public.images
  ADD COLUMN IF NOT EXISTS path TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS filename TEXT,
  ADD COLUMN IF NOT EXISTS size INTEGER,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS folder TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.blog_post_images
  ADD COLUMN IF NOT EXISTS blog_post_slug TEXT,
  ADD COLUMN IF NOT EXISTS image_id UUID,
  ADD COLUMN IF NOT EXISTS is_hero BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.case_study_images
  ADD COLUMN IF NOT EXISTS case_study_slug TEXT,
  ADD COLUMN IF NOT EXISTS image_id UUID,
  ADD COLUMN IF NOT EXISTS is_hero BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.images
  ALTER COLUMN path SET NOT NULL,
  ALTER COLUMN url SET NOT NULL,
  ALTER COLUMN filename SET NOT NULL,
  ALTER COLUMN size SET NOT NULL,
  ALTER COLUMN mime_type SET NOT NULL,
  ALTER COLUMN folder SET NOT NULL;

ALTER TABLE public.images
  DROP CONSTRAINT IF EXISTS images_folder_check;
ALTER TABLE public.images
  ADD CONSTRAINT images_folder_check CHECK (folder IN ('blog', 'case-studies'));

ALTER TABLE public.blog_post_images
  ALTER COLUMN blog_post_slug SET NOT NULL,
  ALTER COLUMN image_id SET NOT NULL;

ALTER TABLE public.case_study_images
  ALTER COLUMN case_study_slug SET NOT NULL,
  ALTER COLUMN image_id SET NOT NULL;

ALTER TABLE public.blog_post_images
  DROP CONSTRAINT IF EXISTS blog_post_images_image_id_fkey;
ALTER TABLE public.blog_post_images
  ADD CONSTRAINT blog_post_images_image_id_fkey
  FOREIGN KEY (image_id) REFERENCES public.images(id) ON DELETE CASCADE;

ALTER TABLE public.case_study_images
  DROP CONSTRAINT IF EXISTS case_study_images_image_id_fkey;
ALTER TABLE public.case_study_images
  ADD CONSTRAINT case_study_images_image_id_fkey
  FOREIGN KEY (image_id) REFERENCES public.images(id) ON DELETE CASCADE;

ALTER TABLE public.blog_post_images
  DROP CONSTRAINT IF EXISTS blog_post_images_unique;
ALTER TABLE public.blog_post_images
  ADD CONSTRAINT blog_post_images_unique UNIQUE (blog_post_slug, image_id);

ALTER TABLE public.case_study_images
  DROP CONSTRAINT IF EXISTS case_study_images_unique;
ALTER TABLE public.case_study_images
  ADD CONSTRAINT case_study_images_unique UNIQUE (case_study_slug, image_id);

CREATE OR REPLACE FUNCTION public.update_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS images_updated_at_trigger
  ON public.images;
CREATE TRIGGER images_updated_at_trigger
BEFORE UPDATE ON public.images
FOR EACH ROW
EXECUTE FUNCTION public.update_images_updated_at();

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Images are publicly readable" ON public.images;
CREATE POLICY "Images are publicly readable"
  ON public.images
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.images;
CREATE POLICY "Authenticated users can insert images"
  ON public.images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their images" ON public.images;
CREATE POLICY "Authenticated users can delete their images"
  ON public.images
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Blog post images are publicly readable" ON public.blog_post_images;
CREATE POLICY "Blog post images are publicly readable"
  ON public.blog_post_images
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can manage blog post images" ON public.blog_post_images;
CREATE POLICY "Authenticated users can manage blog post images"
  ON public.blog_post_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete blog post images" ON public.blog_post_images;
CREATE POLICY "Authenticated users can delete blog post images"
  ON public.blog_post_images
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Case study images are publicly readable" ON public.case_study_images;
CREATE POLICY "Case study images are publicly readable"
  ON public.case_study_images
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can manage case study images" ON public.case_study_images;
CREATE POLICY "Authenticated users can manage case study images"
  ON public.case_study_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete case study images" ON public.case_study_images;
CREATE POLICY "Authenticated users can delete case study images"
  ON public.case_study_images
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

GRANT SELECT ON public.images TO anon, authenticated;
GRANT SELECT ON public.blog_post_images TO anon, authenticated;
GRANT SELECT ON public.case_study_images TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_images_folder
  ON public.images(folder);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at
  ON public.images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_post_images_slug
  ON public.blog_post_images(blog_post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_images_hero
  ON public.blog_post_images(is_hero)
  WHERE is_hero = TRUE;
CREATE INDEX IF NOT EXISTS idx_case_study_images_slug
  ON public.case_study_images(case_study_slug);
CREATE INDEX IF NOT EXISTS idx_case_study_images_hero
  ON public.case_study_images(is_hero)
  WHERE is_hero = TRUE;

COMMENT ON TABLE public.images IS
  'Metadata for files stored in the hero-images Supabase Storage bucket.';
COMMENT ON TABLE public.blog_post_images IS
  'Associates uploaded images with blog posts by slug.';
COMMENT ON TABLE public.case_study_images IS
  'Associates uploaded images with case studies by slug.';
