# Next Steps for Phase 3 & Beyond

## Immediate Priority: Phase 3 Continuation

### 1. Supabase Storage Setup (1-2 days)

**Tasks:**

- [ ] Create Supabase Storage bucket for hero images
- [ ] Set up RLS policies for image access
- [ ] Create API endpoint for image upload (`/api/images/upload`)
- [ ] Implement image deletion endpoint

**Files to Create:**

- `app/api/images/upload/route.ts`
- `app/api/images/delete/route.ts`
- `lib/storage.ts` - Storage utility functions

### 2. Image Upload Component (1-2 days)

**Tasks:**

- [ ] Implement drag-and-drop file upload
- [ ] Add file validation (size, type)
- [ ] Create image preview
- [ ] Add upload progress indicator
- [ ] Handle upload errors gracefully

**Files to Update:**

- `app/admin/images/page.tsx` - Add upload logic

### 3. Image Association (1-2 days)

**Tasks:**

- [ ] Create database table for image metadata
- [ ] Link images to blog posts
- [ ] Link images to case studies
- [ ] Update blog/case study detail pages to display images
- [ ] Add image selection UI in admin

### 4. Authentication (1 day)

**Critical before deployment!**

**Tasks:**

- [ ] Implement admin route protection
- [ ] Add login page at `/admin/login`
- [ ] Use Supabase Auth or Next.js middleware
- [ ] Add logout functionality

**Files to Create:**

- `app/admin/login/page.tsx`
- `middleware.ts` - Route protection

## Phase 3 Completion Checklist

- [ ] Image upload working
- [ ] Images display on blog/case study pages
- [ ] Image management UI functional
- [ ] Admin routes protected
- [ ] All tests passing
- [ ] Build succeeds

## Phase 4: Vector Embeddings (3-4 days)

After Phase 3 is complete:

- [ ] Install pgvector in Supabase
- [ ] Generate embeddings for content
- [ ] Build similarity search
- [ ] Create "Related Posts" component
- [ ] Create "Related Case Studies" component

## Quick Commands

```bash
# Add more shadcn components
npx shadcn@latest add textarea select checkbox tabs

# Run development server
npm run dev

# Build for production
npm run build

# Sync metadata to Supabase
npx ts-node scripts/sync-metadata.ts
```

## Documentation References

- `docs/PHASE3_SETUP.md` - Phase 3 setup guide
- `docs/SHADCN_SETUP.md` - shadcn/ui reference
- `docs/PROJECT_STRUCTURE.md` - Project layout
- `docs/features/01-content-management/feature.md` - Feature requirements
- `docs/DEVELOPMENT_ROADMAP.md` - Overall roadmap

## Testing

After each phase:

1. Run `npm run build` to check for errors
2. Test all admin pages at `/admin/*`
3. Verify content displays correctly
4. Check responsive design on mobile

## Deployment Checklist

Before going live:

- [ ] Authentication implemented
- [ ] Environment variables configured
- [ ] Supabase RLS policies set
- [ ] Images optimized
- [ ] Performance targets met (LCP < 2.5s)
- [ ] All tests passing
- [ ] Security audit completed
