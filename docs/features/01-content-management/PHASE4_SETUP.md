# Phase 4: Vector Embeddings & Recommendations - Setup Guide

## Overview

Phase 4 implements vector embeddings for blog posts and case studies, enabling semantic similarity search and "Related Content" recommendations on detail pages.

## Prerequisites

1. **OpenAI API Key** - Required for generating embeddings
   - Sign up at https://platform.openai.com
   - Create an API key in your account settings
   - Add to `.env.local`: `OPENAI_API_KEY=sk_...`

2. **pgvector Extension** - Must be enabled in Supabase
3. **Vector Search Functions** - SQL functions for similarity search

## Setup Steps

### Step 1: Enable pgvector Extension

Run the SQL migration in your Supabase SQL Editor:

```bash
# File: docs/database/03-pgvector-setup.sql
```

This creates:
- pgvector extension
- Vector similarity indexes (IVFFlat with cosine distance)
- Proper permissions

### Step 2: Create Vector Search Functions

Run the SQL migration in your Supabase SQL Editor:

```bash
# File: docs/database/04-vector-search-functions.sql
```

This creates two functions:
- `match_blog_posts(query_embedding, match_count)` - Find similar blog posts
- `match_case_studies(query_embedding, match_count)` - Find similar case studies

### Step 3: Generate Embeddings

Once pgvector is enabled and functions are created, generate embeddings for all content:

```bash
npx ts-node scripts/generate-embeddings.ts
```

This script:
- Reads all blog posts and case studies from MDX files
- Generates embeddings using OpenAI API
- Stores embeddings in Supabase database
- Includes rate limiting to avoid API throttling

**Note:** This will consume OpenAI API credits. The `text-embedding-3-small` model is cost-effective.

### Step 4: Verify Setup

1. Check Supabase database:
   - `blog_posts_meta` table should have `embedding` column populated
   - `case_studies_meta` table should have `embedding` column populated

2. Test the API endpoints:
   ```bash
   curl -X POST http://localhost:3000/api/related-posts \
     -H "Content-Type: application/json" \
     -d '{"embedding": [...], "currentSlug": "post-slug", "limit": 3}'
   ```

## Features

### Related Content Components

**RelatedBlogPosts** - Displays similar blog posts
- Shows up to 3 related posts by default
- Displays similarity score (0-100%)
- Includes loading and error states

**RelatedCaseStudies** - Displays similar case studies
- Shows up to 3 related studies by default
- Displays client name and problem summary
- Includes similarity score

### Vector Similarity Search

Uses cosine distance for semantic similarity:
- Finds content with similar meaning
- Filters out current content
- Returns results sorted by relevance

### API Endpoints

**POST /api/related-posts**
```json
{
  "embedding": [0.1, 0.2, ...],
  "currentSlug": "blog-post-slug",
  "limit": 3
}
```

**POST /api/related-case-studies**
```json
{
  "embedding": [0.1, 0.2, ...],
  "currentSlug": "case-study-slug",
  "limit": 3
}
```

## Files Created

- `lib/embeddings.ts` - Embedding generation service
- `scripts/generate-embeddings.ts` - Batch embedding generation
- `components/RelatedBlogPosts.tsx` - Related posts component
- `components/RelatedCaseStudies.tsx` - Related case studies component
- `app/api/related-posts/route.ts` - Related posts API
- `app/api/related-case-studies/route.ts` - Related case studies API
- `docs/database/03-pgvector-setup.sql` - pgvector setup
- `docs/database/04-vector-search-functions.sql` - Search functions

## Files Modified

- `lib/supabase.ts` - Added vector search functions
- `app/blog/[slug]/page.tsx` - Added RelatedBlogPosts component
- `app/case-studies/[slug]/page.tsx` - Added RelatedCaseStudies component

## Troubleshooting

### "OPENAI_API_KEY not set"
- Add `OPENAI_API_KEY` to `.env.local`
- Restart dev server

### "pgvector extension not found"
- Run `docs/database/03-pgvector-setup.sql` in Supabase SQL Editor
- Verify extension is enabled in Supabase dashboard

### "Function match_blog_posts does not exist"
- Run `docs/database/04-vector-search-functions.sql` in Supabase SQL Editor

### No related content showing
- Verify embeddings are generated: `npx ts-node scripts/generate-embeddings.ts`
- Check that `embedding` column is populated in database
- Verify API endpoints are working

## Performance Notes

- Vector indexes use IVFFlat with 100 lists for optimal performance
- Cosine distance metric for semantic similarity
- Queries typically complete in <100ms
- Embeddings are 1536-dimensional (OpenAI standard)

## Cost Considerations

- OpenAI embedding API: ~$0.02 per 1M tokens
- Typical blog post: 500-1000 tokens
- Initial generation: ~$0.01-0.05 for sample content
- Regeneration: Only needed when content changes

