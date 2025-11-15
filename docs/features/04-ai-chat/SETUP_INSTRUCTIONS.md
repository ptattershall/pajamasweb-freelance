# AI Chat Feature - Setup Instructions

## Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase project
- OpenAI API key
- Upstash Redis account

## Step 1: Database Setup

### 1.1 Create Tables in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `docs/database/06-chat-schema.sql`
6. Paste into the SQL editor
7. Click **Run**

Expected output: All tables created successfully

### 1.2 Verify Tables

In Supabase, go to **Table Editor** and verify:
- ✅ `embeddings` table exists
- ✅ `chat_sessions` table exists
- ✅ `chat_messages` table exists
- ✅ `chat_audit_log` table exists
- ✅ `escalations` table exists

## Step 2: Environment Variables

### 2.1 Get Your Credentials

**OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Click **API keys**
3. Create new secret key
4. Copy the key

**Supabase:**
1. Go to Supabase Dashboard
2. Click **Settings** → **API**
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

**Upstash Redis:**
1. Go to [Upstash Console](https://console.upstash.com)
2. Create new Redis database
3. Go to **Details**
4. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2.2 Update .env.local

Create or update `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

## Step 3: Dependencies

Dependencies are already installed. Verify:

```bash
npm list ai @ai-sdk/openai langchain @upstash/ratelimit
```

Should show:
- ✅ ai@latest
- ✅ @ai-sdk/openai@latest
- ✅ langchain@latest
- ✅ @upstash/ratelimit@latest
- ✅ @upstash/redis@latest

## Step 4: Test Locally

### 4.1 Start Dev Server

```bash
npm run dev
```

Expected output:
```
> ready - started server on 0.0.0.0:3000
```

### 4.2 Test Chat Page

1. Open browser to `http://localhost:3000/chat`
2. You should see:
   - ✅ Chat page with title and description
   - ✅ Chat widget button in bottom right
   - ✅ Click button to open chat

### 4.3 Test Chat Widget

1. Click the chat widget button
2. You should see:
   - ✅ Chat window opens
   - ✅ Suggested prompts appear
   - ✅ Input field is active

### 4.4 Test Message Sending

1. Click a suggested prompt (e.g., "How much does a website cost?")
2. You should see:
   - ✅ Message appears in chat
   - ✅ Loading indicator shows
   - ✅ AI response streams in
   - ✅ Message appears in chat

### 4.5 Test Rate Limiting

1. Send 11 messages quickly
2. You should see:
   - ✅ 11th message returns 429 error
   - ✅ Rate limit message appears

## Step 5: Verify Audit Logging

### 5.1 Check Audit Logs

1. Go to Supabase Dashboard
2. Go to **Table Editor**
3. Select `chat_audit_log`
4. You should see:
   - ✅ Rows for each message sent
   - ✅ User ID recorded
   - ✅ Message content logged
   - ✅ Timestamp recorded

## Step 6: Production Deployment

### 6.1 Build for Production

```bash
npm run build
```

Expected output:
```
> next build
✓ Compiled successfully
```

### 6.2 Set Production Environment Variables

In your deployment platform (Vercel, etc.):
1. Add all `.env.local` variables
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
3. Ensure `UPSTASH_REDIS_REST_TOKEN` is set

### 6.3 Deploy

```bash
npm run start
```

Or use your deployment platform's deploy button.

## Troubleshooting

### Chat page shows 404
- Verify `app/chat/page.tsx` exists
- Run `npm run build` to check for errors

### Chat widget doesn't open
- Check browser console for errors
- Verify JavaScript is enabled
- Clear browser cache

### Messages don't send
- Check OpenAI API key is valid
- Check Supabase connection
- Check browser console for errors
- Verify rate limit not exceeded

### Rate limiting not working
- Verify Upstash Redis credentials
- Check Redis connection in Upstash console
- Verify `UPSTASH_REDIS_REST_URL` and token are set

### Database errors
- Verify SQL migration was run
- Check RLS policies in Supabase
- Verify user is authenticated

## Next Steps

After Phase 1 is working:

1. **Phase 2:** Implement RAG with embeddings
2. **Phase 3:** Add pricing estimator tool
3. **Phase 4:** Add client-specific tools
4. **Phase 5:** Polish UI and UX
5. **Phase 6:** Add guardrails and safety

See `QUICK_START.md` for Phase 2 implementation guide.

