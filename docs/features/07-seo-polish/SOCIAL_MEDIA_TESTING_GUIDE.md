# Social Media Preview Testing Guide

## Overview
This guide explains how to test OpenGraph (OG) images and Twitter cards across different social media platforms.

## Testing Tools

### 1. Twitter Card Validator
- **URL**: https://cards-dev.twitter.com/validator
- **Steps**:
  1. Enter your page URL
  2. Click "Preview card"
  3. Verify the image, title, and description display correctly
  4. Check that the card type is "summary_large_image"

### 2. Facebook Sharing Debugger
- **URL**: https://developers.facebook.com/tools/debug/sharing/
- **Steps**:
  1. Enter your page URL
  2. Click "Debug"
  3. Review the scraped information
  4. Check OG image, title, and description
  5. Click "Scrape Again" to refresh cache

### 3. LinkedIn Post Inspector
- **URL**: https://www.linkedin.com/post-inspector/inspect/
- **Steps**:
  1. Enter your page URL
  2. Review the preview
  3. Verify image, title, and description

### 4. Open Graph Debugger
- **URL**: https://www.opengraphcheck.com/
- **Steps**:
  1. Enter your page URL
  2. View all OG meta tags
  3. Verify image dimensions (1200x630)

## Pages to Test

### Blog Posts
- **URL Pattern**: `/blog/[slug]`
- **Expected OG Image**: Generated via `/api/og/blog?slug=[slug]`
- **Expected Title**: Post title
- **Expected Description**: Post summary

### Case Studies
- **URL Pattern**: `/case-studies/[slug]`
- **Expected OG Image**: Generated via `/api/og/case-study?slug=[slug]`
- **Expected Title**: Case study title
- **Expected Description**: Problem statement

### Services
- **URL Pattern**: `/services/[slug]`
- **Expected OG Image**: Generated via `/api/og/service?title=...&description=...`
- **Expected Title**: Service title
- **Expected Description**: Service summary

### Blog Listing
- **URL**: `/blog`
- **Expected OG Image**: Generated via `/api/og?title=Blog&description=...`

### Case Studies Listing
- **URL**: `/case-studies`
- **Expected OG Image**: Generated via `/api/og?title=Case Studies&description=...`

### Services Listing
- **URL**: `/services`
- **Expected OG Image**: Generated via `/api/og/service?title=Our Services&description=...`

### Home Page
- **URL**: `/`
- **Expected OG Image**: Generated via `/api/og`

## Checklist

- [ ] All blog posts display correct OG images
- [ ] All case studies display correct OG images
- [ ] All services display correct OG images
- [ ] Twitter cards show "summary_large_image" type
- [ ] Facebook previews display correctly
- [ ] LinkedIn previews display correctly
- [ ] OG images are 1200x630 pixels
- [ ] Titles are under 60 characters
- [ ] Descriptions are 150-160 characters
- [ ] No broken image links
- [ ] Fallback images work when generation fails

## Environment Variables Required

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Troubleshooting

### Images Not Showing
1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. Check that the API route is accessible
3. Clear social media cache using debuggers above
4. Verify image dimensions are 1200x630

### Incorrect Titles/Descriptions
1. Check metadata in page files
2. Verify URL parameters are encoded correctly
3. Clear cache and re-test

### API Route Errors
1. Check Next.js build logs
2. Verify `@vercel/og` is installed
3. Test API route directly: `/api/og/blog?slug=test`

