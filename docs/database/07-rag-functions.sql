-- RAG Vector Search Functions
-- Run this SQL in your Supabase SQL Editor to create the necessary functions

-- Function to match embeddings by similarity
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB,
  source TEXT,
  type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity FLOAT
) LANGUAGE SQL STABLE AS $$
  SELECT
    embeddings.id,
    embeddings.content,
    embeddings.embedding,
    embeddings.metadata,
    embeddings.source,
    embeddings.type,
    embeddings.created_at,
    embeddings.updated_at,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE 1 - (embeddings.embedding <=> query_embedding) > similarity_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to match embeddings by type
CREATE OR REPLACE FUNCTION match_embeddings_by_type(
  query_embedding VECTOR(1536),
  embedding_type TEXT,
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB,
  source TEXT,
  type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity FLOAT
) LANGUAGE SQL STABLE AS $$
  SELECT
    embeddings.id,
    embeddings.content,
    embeddings.embedding,
    embeddings.metadata,
    embeddings.source,
    embeddings.type,
    embeddings.created_at,
    embeddings.updated_at,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE embeddings.type = embedding_type
    AND 1 - (embeddings.embedding <=> query_embedding) > similarity_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to match embeddings by source
CREATE OR REPLACE FUNCTION match_embeddings_by_source(
  query_embedding VECTOR(1536),
  embedding_source TEXT,
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB,
  source TEXT,
  type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity FLOAT
) LANGUAGE SQL STABLE AS $$
  SELECT
    embeddings.id,
    embeddings.content,
    embeddings.embedding,
    embeddings.metadata,
    embeddings.source,
    embeddings.type,
    embeddings.created_at,
    embeddings.updated_at,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE embeddings.source = embedding_source
    AND 1 - (embeddings.embedding <=> query_embedding) > similarity_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION match_embeddings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION match_embeddings_by_type TO anon, authenticated;
GRANT EXECUTE ON FUNCTION match_embeddings_by_source TO anon, authenticated;

