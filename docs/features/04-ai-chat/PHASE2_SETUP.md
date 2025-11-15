# Phase 2: Public RAG - Setup Guide

## Prerequisites

- Phase 1 completed and working
- OpenAI API key with embeddings access
- Supabase project with pgvector extension enabled
- Node.js 20+

## Step 1: Create Vector Search Functions

### 1.1 Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**

### 1.2 Run Vector Search Functions
1. Copy entire contents of `docs/database/07-rag-functions.sql`
2. Paste into SQL editor
3. Click **Run**

Expected output:
```
CREATE FUNCTION
CREATE FUNCTION
CREATE FUNCTION
GRANT
GRANT
GRANT
```

### 1.3 Verify Functions Created
In Supabase, go to **Database** → **Functions** and verify:
- ✅ `match_embeddings` exists
- ✅ `match_embeddings_by_type` exists
- ✅ `match_embeddings_by_source` exists

## Step 2: Generate Embeddings

### 2.1 Verify Content Files
Check that these files exist:
- ✅ `content/faqs.json` - 10 FAQs
- ✅ `content/blog/` - Blog posts
- ✅ `content/case-studies/` - Case studies
- ✅ Services in Supabase database

### 2.2 Run Embedding Generation
```bash
# Set OpenAI API key
export OPENAI_API_KEY=sk-your_key_here

# Run embedding generation script
npx ts-node scripts/generate-rag-embeddings.ts
```

### 2.3 Monitor Progress
Script will output:
```
🚀 Starting RAG embedding generation...

📚 Generating service embeddings...
✅ Stored X service embeddings

📚 Generating FAQ embeddings...
✅ Stored 10 FAQ embeddings

📚 Generating blog post embeddings...
✅ Stored X blog embeddings

📚 Generating case study embeddings...
✅ Stored X case study embeddings

✅ All embeddings generated successfully!
```

### 2.4 Verify Embeddings Stored
In Supabase:
1. Go to **Table Editor**
2. Select `embeddings` table
3. Verify rows exist for each type:
   - ✅ `type = 'service'`
   - ✅ `type = 'faq'`
   - ✅ `type = 'blog'`
   - ✅ `type = 'case_study'`

## Step 3: Test RAG Retrieval

### 3.1 Start Dev Server
```bash
npm run dev
```

### 3.2 Test Chat with RAG
1. Open browser to `http://localhost:3000/chat`
2. Click chat widget button
3. Ask a question that should retrieve context:
   - "How much does a website cost?"
   - "What integrations do you support?"
   - "How long does a project take?"

### 3.3 Verify Context Injection
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Send a message
4. Click the `/api/chat` request
5. In **Response**, you should see the AI response includes information from FAQs

### 3.4 Check Logs
In browser console, you should see:
- No errors
- Chat messages sent and received
- Streaming responses working

## Step 4: Monitor Performance

### 4.1 Check Response Times
1. Open DevTools **Network** tab
2. Send a message
3. Check `/api/chat` request time
4. Should be <500ms (including RAG retrieval)

### 4.2 Check Database Queries
In Supabase:
1. Go to **Database** → **Query Performance**
2. Look for `match_embeddings` function calls
3. Verify query times are <100ms

## Step 5: Troubleshooting

### Issue: Embeddings not generating
**Solution:**
```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Check content files exist
ls content/faqs.json
ls content/blog/
ls content/case-studies/

# Check Supabase connection
# Verify NEXT_PUBLIC_SUPABASE_URL and keys are set
```

### Issue: Vector search returns no results
**Solution:**
1. Verify embeddings were stored:
   ```sql
   SELECT COUNT(*) FROM embeddings;
   ```
2. Check similarity threshold:
   ```sql
   SELECT * FROM match_embeddings(
     query_embedding => '[...]'::vector,
     match_count => 5,
     similarity_threshold => 0.5  -- Lower threshold
   );
   ```

### Issue: Chat API errors
**Solution:**
1. Check browser console for errors
2. Check server logs: `npm run dev` output
3. Verify RAG service imports in `app/api/chat/route.ts`
4. Verify database functions exist in Supabase

### Issue: Slow responses
**Solution:**
1. Check HNSW index exists:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'embeddings';
   ```
2. Verify index is being used:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM match_embeddings(...);
   ```

## Step 6: Production Deployment

### 6.1 Verify All Setup Complete
- [ ] Vector search functions created
- [ ] Embeddings generated and stored
- [ ] Chat API updated with RAG
- [ ] Local testing successful
- [ ] Performance acceptable

### 6.2 Deploy to Production
```bash
npm run build
npm run start
```

### 6.3 Regenerate Embeddings in Production
```bash
# SSH into production server or use CI/CD
export OPENAI_API_KEY=sk-...
npx ts-node scripts/generate-rag-embeddings.ts
```

## Next Steps

After Phase 2 is working:
1. **Phase 3:** Implement Sales Estimator Tool
2. **Phase 4:** Add Client-Specific Tools
3. **Phase 5:** Polish Chat UI
4. **Phase 6:** Add Guardrails and Safety

See `QUICK_START.md` for Phase 3 implementation guide.

