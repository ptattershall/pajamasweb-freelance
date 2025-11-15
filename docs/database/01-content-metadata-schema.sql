-- Content Management Metadata Tables
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Create blog_posts_meta table
CREATE TABLE IF NOT EXISTS public.blog_posts_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create case_studies_meta table
CREATE TABLE IF NOT EXISTS public.case_studies_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client_name TEXT,
  problem TEXT,
  results TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies_meta ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "blog_posts_meta_public_read"
  ON public.blog_posts_meta
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "case_studies_meta_public_read"
  ON public.case_studies_meta
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_slug ON public.blog_posts_meta(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_published_at ON public.blog_posts_meta(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_tags ON public.blog_posts_meta USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_case_studies_meta_slug ON public.case_studies_meta(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_meta_published_at ON public.case_studies_meta(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_studies_meta_tags ON public.case_studies_meta USING GIN(tags);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_search ON public.blog_posts_meta 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(summary, '')));

CREATE INDEX IF NOT EXISTS idx_case_studies_meta_search ON public.case_studies_meta 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(problem, '') || ' ' || COALESCE(results, '')));

