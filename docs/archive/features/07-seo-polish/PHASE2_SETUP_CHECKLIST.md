# Phase 2: Structured Data Setup Checklist

**Purpose:** Verify Phase 2 implementation is working correctly.

## Pre-Deployment Checklist

### Code Quality
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] All imports resolved
- [x] Components properly typed
- [x] Schemas properly formatted

### Implementation Verification
- [x] `lib/json-ld-schemas.ts` created
- [x] `components/JsonLdScript.tsx` created
- [x] Organization schema in root layout
- [x] Article schemas in blog pages
- [x] Service schemas in service pages
- [x] BreadcrumbList schemas on all pages
- [x] FAQ schemas on service pages
- [x] Person schemas on blog posts

### Files Modified
- [x] `app/layout.tsx`
- [x] `app/blog/page.tsx`
- [x] `app/blog/[slug]/page.tsx`
- [x] `app/case-studies/page.tsx`
- [x] `app/case-studies/[slug]/page.tsx`
- [x] `app/services/page.tsx`
- [x] `app/services/[slug]/page.tsx`

## Local Testing

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Verify Schemas in Browser
1. Open http://localhost:3000
2. Press F12 to open DevTools
3. Go to Elements tab
4. Search for "application/ld+json"
5. Verify JSON structure is valid

### Step 3: Test Each Page Type

**Blog Listing Page:**
- [ ] Visit http://localhost:3000/blog
- [ ] Verify BreadcrumbList schema present
- [ ] Verify Organization schema present

**Blog Post Page:**
- [ ] Visit http://localhost:3000/blog/[post-slug]
- [ ] Verify Article schema present
- [ ] Verify BreadcrumbList schema present
- [ ] Verify Person schema present

**Case Studies Listing:**
- [ ] Visit http://localhost:3000/case-studies
- [ ] Verify BreadcrumbList schema present
- [ ] Verify Organization schema present

**Case Study Page:**
- [ ] Visit http://localhost:3000/case-studies/[slug]
- [ ] Verify Article schema present
- [ ] Verify BreadcrumbList schema present

**Services Listing:**
- [ ] Visit http://localhost:3000/services
- [ ] Verify BreadcrumbList schema present
- [ ] Verify Organization schema present

**Service Page:**
- [ ] Visit http://localhost:3000/services/[slug]
- [ ] Verify Service schema present
- [ ] Verify BreadcrumbList schema present
- [ ] Verify FAQPage schema present

## Validation Testing

### Google Rich Results Test
- [ ] Visit https://search.google.com/test/rich-results
- [ ] Enter your site URL
- [ ] Wait for crawl to complete
- [ ] Verify all schemas detected
- [ ] Check for any errors

### Schema.org Validator
- [ ] Visit https://validator.schema.org/
- [ ] Enter your site URL
- [ ] Review validation results
- [ ] Fix any errors or warnings

### JSON Validation
- [ ] Copy JSON from DevTools
- [ ] Paste into https://jsonlint.com/
- [ ] Verify valid JSON syntax

## Production Deployment

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Schemas validated
- [ ] Documentation complete

### Deployment
- [ ] Build: `npm run build`
- [ ] Deploy to production
- [ ] Verify schemas on production
- [ ] Monitor Google Search Console

### Post-Deployment
- [ ] Monitor rich results report
- [ ] Check for new errors
- [ ] Track organic traffic
- [ ] Monitor CTR changes

## Troubleshooting

**Issue:** Schemas not showing in DevTools
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Rebuild: `npm run build`

**Issue:** Validation errors
- Check required fields
- Verify URL formats
- Use Schema.org documentation

**Issue:** Rich results not appearing
- Wait 2-4 weeks for Google reindex
- Submit sitemap to Search Console
- Check Search Console for errors

## Success Criteria

- ✅ All schemas validate without errors
- ✅ Schemas appear in DevTools
- ✅ Google Rich Results Test shows no errors
- ✅ Schema.org validator shows no errors
- ✅ No TypeScript or ESLint errors
- ✅ Production deployment successful

## Next Steps

1. Complete this checklist
2. Deploy to production
3. Monitor Google Search Console
4. Proceed to Phase 3: Sitemap & Robots

## Support

For issues or questions:
1. Check `PHASE2_VALIDATION_GUIDE.md`
2. Review `PHASE2_IMPLEMENTATION.md`
3. Consult Schema.org documentation
4. Check Google Search Central

