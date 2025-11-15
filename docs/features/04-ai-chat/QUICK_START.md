# AI Chat Feature - Quick Start Guide

## Phase 1 ✅ Complete

### What's Ready
- Chat API endpoint at `/api/chat`
- Chat UI component with streaming
- Chat page at `/chat`
- Database schema with pgvector support
- Rate limiting and security

### Setup Steps

1. **Create Database Tables**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `docs/database/06-chat-schema.sql`
   - Run the SQL

2. **Set Environment Variables**
   ```
   OPENAI_API_KEY=your_openai_key
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   ```

3. **Test Locally**
   ```bash
   npm run dev
   # Visit http://localhost:3000/chat
   ```

## Phase 2 - Next: Public RAG

### What to Build
1. Embedding generation for services, FAQs, blog posts
2. Vector similarity search with pgvector
3. RAG retrieval pipeline
4. Context injection into chat

### Key Files to Create
- `lib/rag-service.ts` - RAG operations
- `scripts/generate-embeddings.ts` - Embedding generation
- Update `app/api/chat/route.ts` - Add RAG context

### Implementation Pattern
```typescript
// 1. Generate embeddings
const embedding = await generateEmbedding(content);

// 2. Store in pgvector
await supabase.from('embeddings').insert({
  content,
  embedding,
  type: 'service',
  source: 'services',
});

// 3. Retrieve similar documents
const similar = await findSimilarEmbeddings(queryEmbedding, 5);

// 4. Inject into system prompt
const context = similar.map(s => s.content).join('\n\n');
```

## Phase 3 - Sales Estimator Tool

### What to Build
1. Pricing heuristics and scoring
2. Zod schemas for tool inputs
3. Tool definition for Vercel AI SDK
4. Confidence calculation

### Key Files to Create
- `lib/pricing.ts` - Pricing logic
- `lib/tools/pricing-suggestion.ts` - Tool definition
- Update `app/api/chat/route.ts` - Add tool to streamText

## Phase 4 - Client-Specific Tools

### What to Build
1. Invoice status tool
2. Booking/meeting tool
3. Deliverables tool
4. RLS enforcement

### Key Files to Create
- `lib/tools/client-tools.ts` - Tool definitions
- `lib/actions/client-tools.ts` - Server actions
- Update `app/api/chat/route.ts` - Add tools

## Phase 5 - Chat UI Polish

### What to Build
1. Chat history management
2. Conversation threading
3. Feedback mechanism
4. Accessibility improvements

### Key Files to Update
- `components/ChatWidget.tsx` - Enhanced UI
- `app/chat/page.tsx` - History display

## Phase 6 - Guardrails & Safety

### What to Build
1. Confidence thresholds
2. Human escalation
3. Content filtering
4. Rate limiting refinement

### Key Files to Update
- `app/api/chat/route.ts` - Add guardrails
- `lib/moderation.ts` - Moderation logic

## Useful Commands

```bash
# Run dev server
npm run dev

# Build for production
npm build

# Run linter
npm run lint

# View database in Supabase
# https://app.supabase.com → SQL Editor
```

## Troubleshooting

### Chat not responding
- Check OpenAI API key is set
- Verify Supabase connection
- Check browser console for errors

### Rate limiting errors
- Verify Upstash Redis credentials
- Check rate limit is not exceeded (10/hour)

### Database errors
- Ensure SQL migration was run
- Check RLS policies are enabled
- Verify user is authenticated

## Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai)
- [LangChain.js Docs](https://js.langchain.com)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [Supabase Docs](https://supabase.com/docs)

