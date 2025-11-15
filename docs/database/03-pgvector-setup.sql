-- Enable pgvector extension
-- Run this SQL in your Supabase SQL Editor to enable pgvector

-- Create the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector similarity search indexes for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_meta_embedding 
  ON public.blog_posts_meta 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Create vector similarity search indexes for case studies
CREATE INDEX IF NOT EXISTS idx_case_studies_meta_embedding 
  ON public.case_studies_meta 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.blog_posts_meta TO anon, authenticated;
GRANT SELECT ON public.case_studies_meta TO anon, authenticated;

