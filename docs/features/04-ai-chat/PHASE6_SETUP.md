# Phase 6: Guardrails & Safety - Setup Guide

## Prerequisites

- ✅ Phase 1-5 completed
- ✅ Supabase project configured
- ✅ Database tables created (Phase 1-5)
- ✅ Environment variables set

## Installation Steps

### Step 1: Create Database Tables

Run the migration in Supabase SQL Editor:

```bash
# Copy contents of docs/database/08-safety-schema.sql
# Paste into Supabase SQL Editor
# Execute
```

This creates:
- `escalations` table
- `audit_log` table
- `moderation_flags` table
- RLS policies
- Performance indexes

### Step 2: Verify Database Tables

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('escalations', 'audit_log', 'moderation_flags');

-- Should return 3 rows
```

### Step 3: Test Safety Services

```bash
# Run test suite
npx tsx scripts/test-phase6-safety.ts

# Expected output: 7/7 PASSED
```

### Step 4: Create Escalation API Endpoint

Create `/app/api/chat/escalate/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createEscalation } from '@/lib/escalation-service';

export async function POST(request: NextRequest) {
  const { sessionId, userId, reason, severity } = await request.json();

  if (!sessionId || !userId || !reason) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const escalation = await createEscalation(
      sessionId,
      userId,
      reason,
      severity || 'medium'
    );

    return NextResponse.json({ escalation });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create escalation' },
      { status: 500 }
    );
  }
}
```

### Step 5: Integrate with Chat API

Update `/app/api/chat/route.ts`:

```typescript
import { performSafetyCheck } from '@/lib/safety-service';
import { filterContent } from '@/lib/content-filter';
import { shouldEscalate, createEscalation } from '@/lib/escalation-service';
import { logAudit } from '@/lib/audit-logger';

// In your chat handler:

// 1. Filter content
const filterResult = filterContent(userMessage);
if (filterResult.filtered) {
  await logAudit('content_filtered', 'chat_message', {
    userId,
    details: filterResult.issues,
  });
}

// 2. Check safety
const safetyCheck = performSafetyCheck(
  response,
  confidence,
  toolsUsed
);

// 3. Check escalation
const escalationTrigger = shouldEscalate(
  confidence,
  safetyCheck.issues
);

if (escalationTrigger) {
  await createEscalation(
    sessionId,
    userId,
    escalationTrigger.reason,
    escalationTrigger.severity
  );
}

// 4. Log audit
await logAudit('chat_message', 'chat_message', {
  userId,
  resourceId: messageId,
  details: { confidence, escalated: !!escalationTrigger },
});
```

### Step 6: Test Locally

```bash
# Start development server
npm run dev

# Test chat at http://localhost:3000/chat

# Monitor console for:
# - Safety checks
# - Content filtering
# - Escalations
# - Audit logs
```

### Step 7: Verify Features

- [ ] Safety checks working
- [ ] Content filtering active
- [ ] Escalations created
- [ ] Audit logs recorded
- [ ] No errors in console
- [ ] Database tables populated

## Configuration

### Safety Thresholds

Edit `lib/safety-service.ts`:

```typescript
// Adjust confidence thresholds
if (confidence < 50) { // Change from 50
  shouldEscalate = true;
}
```

### Escalation Triggers

Edit `lib/escalation-service.ts`:

```typescript
// Add custom triggers
if (customCondition) {
  return {
    type: 'custom_trigger',
    severity: 'high',
    reason: 'Custom reason',
  };
}
```

### Content Filter Rules

Edit `lib/content-filter.ts`:

```typescript
// Add custom patterns
const customPatterns = [
  /your-pattern-here/gi,
];
```

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Database tables created
- [ ] API endpoints working
- [ ] Chat API integrated
- [ ] Environment variables set

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Phase 6: Guardrails & Safety"
git push origin main

# Vercel auto-deploys
# Monitor at vercel.com
```

### Post-deployment

1. Test chat at production URL
2. Verify database connections
3. Check error logs
4. Monitor escalations
5. Review audit logs

## Troubleshooting

### Database Connection Error

```
Error: supabaseUrl is required
```

**Solution:**
- Check environment variables
- Verify Supabase project
- Test connection in Supabase dashboard

### Safety Checks Not Working

**Solution:**
- Verify imports in chat API
- Check confidence calculation
- Review test output

### Escalations Not Creating

**Solution:**
- Check database tables exist
- Verify RLS policies
- Review error logs

## Monitoring

### Check Escalations

```sql
SELECT * FROM escalations 
WHERE status = 'open' 
ORDER BY created_at DESC;
```

### Check Audit Logs

```sql
SELECT * FROM audit_log 
WHERE action = 'chat_message' 
ORDER BY created_at DESC 
LIMIT 100;
```

### Check Moderation Flags

```sql
SELECT * FROM moderation_flags 
WHERE resolved = false 
ORDER BY created_at DESC;
```

## Performance Optimization

Already optimized:
- ✅ Efficient queries
- ✅ Indexed tables
- ✅ Minimal overhead (<100ms)
- ✅ Async operations

## Support

For issues:
1. Check test output: `npx tsx scripts/test-phase6-safety.ts`
2. Review error logs
3. Check Supabase dashboard
4. Review documentation

---

**Setup Time:** 20-30 minutes  
**Difficulty:** Medium  
**Status:** Ready for Production

