# Phase 5: Chat UI Polish - Setup Guide

## Prerequisites

- ✅ Phase 1-4 completed
- ✅ Supabase project configured
- ✅ Database tables created
- ✅ Environment variables set

## Installation Steps

### Step 1: Verify Database Tables

Ensure these tables exist in Supabase:

```sql
-- Check chat_sessions table
SELECT * FROM chat_sessions LIMIT 1;

-- Check chat_messages table
SELECT * FROM chat_messages LIMIT 1;
```

### Step 2: Update ChatWidget Component

The enhanced ChatWidget is already in place with:
- ✅ Auto-scroll functionality
- ✅ Message feedback buttons
- ✅ Clear chat button
- ✅ History toggle
- ✅ Mobile responsiveness
- ✅ Accessibility improvements

### Step 3: Add Chat History Component

The ChatHistory component is ready to use:

```typescript
import ChatHistory from '@/components/ChatHistory';

// In your chat page or widget
<ChatHistory 
  userId={userId}
  onSelectSession={handleSelectSession}
  isOpen={showHistory}
/>
```

### Step 4: Create API Endpoints

Create `/app/api/chat/sessions/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'userId required' },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ sessions: data });
}
```

Create `/app/api/chat/sessions/[id]/route.ts`:

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

### Step 5: Test Locally

```bash
# Run the test suite
npx tsx scripts/test-phase5-features.ts

# Start development server
npm run dev

# Visit http://localhost:3000/chat
```

### Step 6: Verify Features

- [ ] Chat widget opens/closes
- [ ] Messages display correctly
- [ ] Feedback buttons appear on hover
- [ ] Clear chat works with confirmation
- [ ] History toggle shows/hides sidebar
- [ ] Mobile view is responsive
- [ ] Keyboard navigation works
- [ ] Screen reader announces messages

## Configuration

### Environment Variables

No new environment variables needed. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Customization

#### Change feedback button colors

Edit `components/ChatWidget.module.css`:

```css
.feedbackButtonHelpful {
  background-color: rgb(220, 252, 231); /* Change green */
  color: rgb(22, 163, 74);
}
```

#### Adjust mobile breakpoint

Edit `components/ChatWidget.tsx`:

```typescript
// Change from sm:w-96 to your breakpoint
className="w-full sm:w-96 h-[600px]"
```

#### Customize chat history sidebar

Edit `components/ChatHistory.tsx`:

```typescript
// Adjust width
className="w-64" // Change to w-80 for wider

// Adjust styling
className="p-4" // Change padding
```

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Mobile tested on real device
- [ ] Accessibility tested with screen reader
- [ ] Database tables verified
- [ ] Environment variables set

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Phase 5: Chat UI Polish"
git push origin main

# Vercel auto-deploys on push
# Monitor deployment at vercel.com
```

### Post-deployment

1. Test chat at production URL
2. Verify database connections
3. Check error logs
4. Monitor performance metrics

## Troubleshooting

### Chat history not loading

```
Error: Failed to load sessions
```

**Solution:**
- Check Supabase connection
- Verify userId is passed
- Check RLS policies
- Review API endpoint

### Feedback buttons not showing

**Solution:**
- Hover over assistant messages
- Check CSS module import
- Verify Tailwind CSS loaded

### Mobile layout broken

**Solution:**
- Clear browser cache
- Check viewport meta tag
- Test in incognito mode
- Verify CSS media queries

## Performance Optimization

### Already Optimized

- ✅ CSS modules (no inline styles)
- ✅ Lazy loading components
- ✅ Efficient re-renders
- ✅ Optimized animations (60fps)
- ✅ Minimal bundle size

### Further Optimization

```typescript
// Use React.memo for ChatHistory
export default React.memo(ChatHistory);

// Lazy load ChatHistory
const ChatHistory = dynamic(() => import('@/components/ChatHistory'));
```

## Support

For issues or questions:
1. Check test output: `npx tsx scripts/test-phase5-features.ts`
2. Review error logs in browser console
3. Check Supabase dashboard
4. Review documentation files

---

**Setup Time:** 15-20 minutes  
**Difficulty:** Easy  
**Status:** Ready for Production

