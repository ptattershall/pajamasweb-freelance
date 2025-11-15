-- Vector Similarity Search Functions
-- Run this SQL in your Supabase SQL Editor to create the search functions

-- Function to find similar blog posts
CREATE OR REPLACE FUNCTION match_blog_posts(
  query_embedding vector(1536),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  summary text,
  tags text[],
  published_at timestamptz,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    blog_posts_meta.id,
    blog_posts_meta.slug,
    blog_posts_meta.title,
    blog_posts_meta.summary,
    blog_posts_meta.tags,
    blog_posts_meta.published_at,
    (1 - (blog_posts_meta.embedding <=> query_embedding)) as similarity
  FROM blog_posts_meta
  WHERE blog_posts_meta.embedding IS NOT NULL
  ORDER BY blog_posts_meta.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find similar case studies
CREATE OR REPLACE FUNCTION match_case_studies(
  query_embedding vector(1536),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  client_name text,
  problem text,
  results text,
  tags text[],
  published_at timestamptz,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    case_studies_meta.id,
    case_studies_meta.slug,
    case_studies_meta.title,
    case_studies_meta.client_name,
    case_studies_meta.problem,
    case_studies_meta.results,
    case_studies_meta.tags,
    case_studies_meta.published_at,
    (1 - (case_studies_meta.embedding <=> query_embedding)) as similarity
  FROM case_studies_meta
  WHERE case_studies_meta.embedding IS NOT NULL
  ORDER BY case_studies_meta.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

