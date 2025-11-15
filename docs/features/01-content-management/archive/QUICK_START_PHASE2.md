# Phase 2 Quick Start Guide

## 3 Simple Steps to Get Phase 2 Working

### Step 1: Create Database Tables (5 minutes)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of:
   ```
   docs/database/01-content-metadata-schema.sql
   ```
5. Click **Run**
6. You should see: "Success. No rows returned"

### Step 2: Sync Your Content (2 minutes)

Run this command in your terminal:

```bash
npx ts-node scripts/sync-metadata.ts
```

You should see output like:
```
🔄 Starting metadata sync...

📝 Syncing blog posts...
  ✓ Synced: Getting Started with Web Design
  ✓ Synced: Performance Optimization Tips
✅ Synced 2 blog posts

📊 Syncing case studies...
  ✓ Synced: E-commerce Redesign
✅ Synced 1 case studies

✨ Metadata sync completed successfully!
```

### Step 3: Test It Out (1 minute)

1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/search
3. Try searching for "web" or "design"
4. Try filtering by tags

## What You Can Do Now

### Search Page
- Visit `/search` to search blog posts and case studies
- Search by keywords
- Filter by tags
- Filter by content type

### Search API
Use the API directly:

```bash
# Search by query
curl "http://localhost:3000/api/search?q=web"

# Filter by tag
curl "http://localhost:3000/api/search?tag=web-design"

# Filter by type
curl "http://localhost:3000/api/search?type=blog"
```

## Troubleshooting

### "Cannot find module" error
```bash
npm install -D ts-node
```

### Sync script fails
- Check `.env.local` has both variables
- Verify Supabase project is active
- Check database tables were created

### Search returns no results
- Run sync script again
- Check Supabase tables have data
- Verify RLS policies are enabled

## Next: Add More Content

To add new blog posts or case studies:

1. Create MDX file in `content/blog/` or `content/case-studies/`
2. Add frontmatter with metadata
3. Run sync script: `npx ts-node scripts/sync-metadata.ts`
4. Search will automatically find it

## Full Documentation

For detailed information, see:
- `docs/PHASE2_SETUP.md` - Complete setup guide
- `docs/PHASE2_SUMMARY.md` - What was built
- `docs/features/01-content-management/IMPLEMENTATION_PROGRESS.md` - Progress tracking

