# Phase 2: Structured Data Validation Guide

**Purpose:** Validate JSON-LD schemas are correctly implemented and recognized by search engines.

## Validation Tools

### 1. Google Rich Results Test
**URL:** https://search.google.com/test/rich-results

**Steps:**
1. Enter your site URL
2. Wait for crawl to complete
3. Check "Detected items" section
4. Verify all schema types are listed:
   - Organization
   - BreadcrumbList
   - Article (blog/case studies)
   - Service (service pages)
   - FAQPage (service pages)

**Expected Results:**
- ✅ No errors
- ✅ All schemas detected
- ✅ Rich results eligible

### 2. Schema.org Validator
**URL:** https://validator.schema.org/

**Steps:**
1. Enter your site URL
2. Review validation results
3. Check for errors (red) or warnings (yellow)
4. Fix any issues

**Common Issues:**
- Missing required properties
- Invalid date formats
- Incorrect URL formats
- Missing context

### 3. Structured Data Testing Tool
**URL:** https://developers.google.com/search/docs/guides/search-console

**Steps:**
1. Go to Google Search Console
2. Select property
3. Go to Enhancements → Rich Results
4. Check for detected schemas
5. Monitor for errors

## Local Testing

### Browser DevTools
```bash
1. npm run dev
2. Open http://localhost:3000/blog/[post-slug]
3. Press F12 to open DevTools
4. Go to Elements tab
5. Search for "application/ld+json"
6. Verify JSON structure
```

### Validate JSON
```bash
# Copy JSON from DevTools
# Paste into https://jsonlint.com/
# Verify valid JSON syntax
```

### Test Each Page Type

**Blog Post Page:**
- [ ] Organization schema present
- [ ] Article schema present
- [ ] BreadcrumbList schema present
- [ ] Person schema present
- [ ] All required fields populated

**Case Study Page:**
- [ ] Organization schema present
- [ ] Article schema present
- [ ] BreadcrumbList schema present
- [ ] All required fields populated

**Service Page:**
- [ ] Organization schema present
- [ ] Service schema present
- [ ] BreadcrumbList schema present
- [ ] FAQPage schema present
- [ ] Pricing information included

**Listing Pages:**
- [ ] Organization schema present
- [ ] BreadcrumbList schema present

## Acceptance Criteria Checklist

- [ ] All schemas validate without errors
- [ ] Organization schema on all pages
- [ ] Article schemas on blog/case study pages
- [ ] Service schemas on service pages
- [ ] BreadcrumbList schemas on all pages
- [ ] FAQ schemas on service pages
- [ ] Person schema on blog posts
- [ ] Google Rich Results Test shows no errors
- [ ] Schema.org validator shows no errors
- [ ] Rich results appear in Google Search Console

## Monitoring

### Google Search Console
1. Monitor "Rich Results" report
2. Check for new errors
3. Verify impressions increase
4. Track click-through rate

### Analytics
1. Track organic traffic
2. Monitor bounce rate
3. Check average session duration
4. Measure conversion rate

## Troubleshooting

**Issue:** Schemas not detected
- **Solution:** Clear cache, rebuild, check DevTools

**Issue:** Validation errors
- **Solution:** Check required fields, verify URLs

**Issue:** Rich results not showing
- **Solution:** Wait 2-4 weeks for Google to reindex

## Next Steps

1. ✅ Validate all schemas
2. ✅ Fix any errors
3. ✅ Submit sitemap to Google Search Console
4. ✅ Monitor rich results report
5. ✅ Proceed to Phase 3

## Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Central Blog](https://developers.google.com/search/blog)
- [JSON-LD Best Practices](https://json-ld.org/)

