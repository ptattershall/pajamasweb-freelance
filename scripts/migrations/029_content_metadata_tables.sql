-- 029: Track content metadata tables in the migration chain.
--
-- Purpose:
-- - Create the blog_posts_meta and case_studies_meta tables in tracked SQL.
-- - Keep public read access under RLS while allowing trusted server-side writes
--   through the service-role client used by build scripts and admin flows.
-- - Add the indexes required by metadata lookups and content search.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.blog_posts_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_studies_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client_name TEXT,
  problem TEXT,
  results TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_posts_meta
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS embedding VECTOR(1536),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.case_studies_meta
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS problem TEXT,
  ADD COLUMN IF NOT EXISTS results TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS embedding VECTOR(1536),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.update_content_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_meta_updated_at_trigger
  ON public.blog_posts_meta;
CREATE TRIGGER blog_posts_meta_updated_at_trigger
BEFORE UPDATE ON public.blog_posts_meta
FOR EACH ROW
EXECUTE FUNCTION public.update_content_metadata_updated_at();

DROP TRIGGER IF EXISTS case_studies_meta_updated_at_trigger
  ON public.case_studies_meta;
CREATE TRIGGER case_studies_meta_updated_at_trigger
BEFORE UPDATE ON public.case_studies_meta
FOR EACH ROW
EXECUTE FUNCTION public.update_content_metadata_updated_at();

ALTER TABLE public.blog_posts_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_meta_public_read" ON public.blog_posts_meta;
CREATE POLICY "blog_posts_meta_public_read"
  ON public.blog_posts_meta
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "case_studies_meta_public_read" ON public.case_studies_meta;
CREATE POLICY "case_studies_meta_public_read"
  ON public.case_studies_meta
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.blog_posts_meta TO anon, authenticated;
GRANT SELECT ON public.case_studies_meta TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_slug
  ON public.blog_posts_meta(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_published_at
  ON public.blog_posts_meta(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_tags
  ON public.blog_posts_meta USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_case_studies_meta_slug
  ON public.case_studies_meta(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_meta_published_at
  ON public.case_studies_meta(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_studies_meta_tags
  ON public.case_studies_meta USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_search
  ON public.blog_posts_meta
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(summary, '')));

CREATE INDEX IF NOT EXISTS idx_case_studies_meta_search
  ON public.case_studies_meta
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(problem, '') || ' ' || COALESCE(results, '')));

COMMENT ON TABLE public.blog_posts_meta IS
  'Metadata mirror of local MDX blog posts used for search, related content, and embeddings.';
COMMENT ON TABLE public.case_studies_meta IS
  'Metadata mirror of local MDX case studies used for search, related content, and embeddings.';
