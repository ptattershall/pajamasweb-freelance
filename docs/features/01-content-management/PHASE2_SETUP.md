# Phase 2: Supabase Metadata Integration - Setup Guide

## Overview
This guide walks you through setting up the Supabase metadata integration for the Content Management feature.

## Prerequisites
- Supabase project created
- Environment variables set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 1: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `docs/database/01-content-metadata-schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL

This will create:
- `blog_posts_meta` table with blog post metadata
- `case_studies_meta` table with case study metadata
- RLS policies for public read access
- Indexes for optimal query performance

## Step 2: Sync Existing Content

Run the metadata sync script to populate the tables with your existing MDX content:

```bash
npx ts-node scripts/sync-metadata.ts
```

This script will:
- Read all blog posts from `content/blog/`
- Read all case studies from `content/case-studies/`
- Sync metadata to Supabase tables
- Display progress in the console

## Step 3: Test the Implementation

### Test Search API
```bash
curl "http://localhost:3000/api/search?q=web"
```

### Test Search Page
Navigate to `http://localhost:3000/search` and try searching for content.

### Test Tag Filtering
```bash
curl "http://localhost:3000/api/search?tag=web-design"
```

## Features Implemented

### Search Functionality
- Full-text search across blog posts and case studies
- Search by title, summary, problem, and results
- Returns matching content with metadata

### Tag Filtering
- Filter blog posts by tags
- Filter case studies by tags
- Returns all content with matching tags

### API Routes
- `GET /api/search?q=query` - Search by query
- `GET /api/search?tag=tag-name` - Filter by tag
- `GET /api/search?type=blog|case-studies|all` - Filter by content type

### Search Page
- User-friendly search interface at `/search`
- Real-time search results
- Displays blog posts and case studies separately

## Files Created/Modified

### New Files
- `lib/supabase.ts` - Supabase client and database functions
- `scripts/sync-metadata.ts` - Metadata sync script
- `app/api/search/route.ts` - Search API endpoint
- `components/SearchContent.tsx` - Search UI component
- `app/search/page.tsx` - Search page
- `docs/database/01-content-metadata-schema.sql` - Database schema

### Database Tables
- `blog_posts_meta` - Blog post metadata
- `case_studies_meta` - Case study metadata

## Next Steps

### Phase 3: Admin CMS UI
- Create admin dashboard for managing content
- Implement hero image upload
- Integrate Supabase Storage

### Phase 4: Vector Embeddings
- Generate embeddings for content
- Implement similarity search
- Create "Related Posts" recommendations

## Troubleshooting

### Tables not appearing
- Verify SQL was executed successfully
- Check Supabase project is active
- Ensure RLS is enabled

### Search not working
- Verify environment variables are set
- Check Supabase credentials are correct
- Run sync script to populate tables

### Sync script fails
- Ensure TypeScript is installed: `npm install -D typescript ts-node`
- Check file paths are correct
- Verify Supabase credentials in `.env.local`

