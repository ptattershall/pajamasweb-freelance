# Phase 4: Quick Reference Guide

## One-Time Setup

```bash
# 1. Supabase SQL Editor - Run these two files:
docs/database/03-pgvector-setup.sql
docs/database/04-vector-search-functions.sql

# 2. Environment
OPENAI_API_KEY=sk_...

# 3. Generate embeddings
npx ts-node scripts/generate-embeddings.ts
```

## File Structure

```
lib/
├── embeddings.ts              # Embedding generation
└── supabase.ts                # Vector search functions

scripts/
└── generate-embeddings.ts     # Batch embedding generation

components/
├── RelatedBlogPosts.tsx       # Related posts component
└── RelatedCaseStudies.tsx     # Related studies component

app/api/
├── related-posts/route.ts     # Posts API endpoint
└── related-case-studies/route.ts  # Studies API endpoint

app/
├── blog/[slug]/page.tsx       # Blog detail (with related posts)
└── case-studies/[slug]/page.tsx   # Study detail (with related studies)

docs/database/
├── 03-pgvector-setup.sql      # pgvector extension
└── 04-vector-search-functions.sql  # Search functions
```

## Key Functions

### Embedding Generation
```typescript
import { generateEmbedding, prepareContentForEmbedding } from '@/lib/embeddings'

const text = prepareContentForEmbedding({
  title: 'My Post',
  summary: 'Summary text',
  content: 'Full content...'
})

const { embedding } = await generateEmbedding(text)
```

### Vector Search
```typescript
import { findSimilarBlogPosts, findSimilarCaseStudies } from '@/lib/supabase'

const similar = await findSimilarBlogPosts(embedding, 5)
const studies = await findSimilarCaseStudies(embedding, 3)
```

### Components
```typescript
import { RelatedBlogPosts } from '@/components/RelatedBlogPosts'
import { RelatedCaseStudies } from '@/components/RelatedCaseStudies'

// In blog detail page
<RelatedBlogPosts 
  currentSlug={slug}
  embedding={embedding}
  limit={3}
/>

// In case study detail page
<RelatedCaseStudies
  currentSlug={slug}
  embedding={embedding}
  limit={3}
/>
```

## API Endpoints

### POST /api/related-posts
```json
{
  "embedding": [0.1, 0.2, ...],
  "currentSlug": "blog-post-slug",
  "limit": 3
}
```

Response:
```json
{
  "posts": [
    {
      "id": "uuid",
      "slug": "related-post",
      "title": "Related Post Title",
      "summary": "Summary...",
      "similarity": 0.92
    }
  ],
  "count": 1
}
```

### POST /api/related-case-studies
```json
{
  "embedding": [0.1, 0.2, ...],
  "currentSlug": "case-study-slug",
  "limit": 3
}
```

Response:
```json
{
  "studies": [
    {
      "id": "uuid",
      "slug": "related-study",
      "title": "Related Study",
      "client_name": "Client Name",
      "problem": "Problem...",
      "similarity": 0.88
    }
  ],
  "count": 1
}
```

## Database Schema

### blog_posts_meta
```sql
embedding vector(1536)  -- OpenAI embedding
```

### case_studies_meta
```sql
embedding vector(1536)  -- OpenAI embedding
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OPENAI_API_KEY not set | Add to `.env.local` and restart |
| pgvector not found | Run `03-pgvector-setup.sql` |
| Function not found | Run `04-vector-search-functions.sql` |
| No related content | Run `npx ts-node scripts/generate-embeddings.ts` |
| Slow queries | Check IVFFlat index exists |

## Performance Tips

- Embeddings: ~500ms per post (with rate limiting)
- Vector search: <100ms per query
- API response: <200ms typical
- Component load: Async with loading state

## Cost Estimation

- OpenAI embeddings: ~$0.02 per 1M tokens
- 100 blog posts: ~$0.01-0.05
- 50 case studies: ~$0.01-0.03
- Total initial: ~$0.02-0.08

## Monitoring

Check Supabase dashboard:
1. `blog_posts_meta` - Verify `embedding` column populated
2. `case_studies_meta` - Verify `embedding` column populated
3. Query performance - Monitor vector search queries

## Common Tasks

### Regenerate all embeddings
```bash
npx ts-node scripts/generate-embeddings.ts
```

### Test API endpoint
```bash
curl -X POST http://localhost:3000/api/related-posts \
  -H "Content-Type: application/json" \
  -d '{"embedding": [...], "currentSlug": "slug", "limit": 3}'
```

### Check embedding status
```sql
SELECT slug, embedding IS NOT NULL as has_embedding 
FROM blog_posts_meta;
```

## Resources

- Setup Guide: `docs/PHASE4_SETUP.md`
- Completion Summary: `docs/PHASE4_COMPLETION_SUMMARY.md`
- Final Summary: `docs/PHASE4_FINAL_SUMMARY.md`
- Implementation Progress: `docs/features/01-content-management/IMPLEMENTATION_PROGRESS.md`

