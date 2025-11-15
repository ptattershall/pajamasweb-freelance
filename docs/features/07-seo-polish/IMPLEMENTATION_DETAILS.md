# Phase 1: Implementation Details

## Architecture Overview

### OG Image Generation Flow

```
Page Load
  ↓
Metadata Generated (with OG image URL)
  ↓
Social Media Crawler Requests OG Image
  ↓
API Route (/api/og/[type])
  ↓
Generate Image (Satori/ImageResponse)
  ↓
Apply Cache Headers
  ↓
Return PNG Image
  ↓
Social Media Shows Preview
```

## API Routes

### Default Route: `/api/og`
- **Purpose**: Home page and generic pages
- **Parameters**: `title`, `description` (optional)
- **Gradient**: Purple (#667eea → #764ba2)
- **Cache**: 1h browser, 24h CDN

### Blog Route: `/api/og/blog`
- **Purpose**: Blog post OG images
- **Parameters**: `slug`, `title`, `description`
- **Gradient**: Purple (#667eea → #764ba2)
- **Cache**: 1h browser, 24h CDN

### Case Study Route: `/api/og/case-study`
- **Purpose**: Case study OG images
- **Parameters**: `slug`, `title`, `description`
- **Gradient**: Pink (#f093fb → #f5576c)
- **Cache**: 1h browser, 24h CDN

### Service Route: `/api/og/service`
- **Purpose**: Service page OG images
- **Parameters**: `title`, `description`
- **Gradient**: Cyan (#4facfe → #00f2fe)
- **Cache**: 1h browser, 24h CDN

### Fallback Route: `/api/og/fallback`
- **Purpose**: Error handling
- **Parameters**: None
- **Gradient**: Purple (#667eea → #764ba2)
- **Cache**: 1h browser, 24h CDN

## Utility Functions

### `lib/og-cache.ts`

**`getOGImageCacheHeaders()`**
- Returns cache control headers
- Browser: 1 hour
- CDN: 24 hours
- Stale-while-revalidate: 7 days

**`optimizeOGTitle(title: string)`**
- Truncates to 60 characters
- Sanitizes HTML
- Removes entities

**`optimizeOGDescription(description: string)`**
- Truncates to 160 characters
- Sanitizes HTML
- Removes entities

**`sanitizeOGText(text: string)`**
- Removes HTML tags
- Decodes entities
- Trims whitespace

### `lib/og-utils.ts`

**URL Generation Functions**
- `generateBlogOGImageUrl(slug, title, summary)`
- `generateCaseStudyOGImageUrl(slug, title, problem)`
- `generateServiceOGImageUrl(title, description)`
- `generateDefaultOGImageUrl(title, description)`
- `getFallbackOGImageUrl()`
- `generateOGMetadata(title, description, imageUrl)`

## Metadata Structure

### Root Layout (`app/layout.tsx`)
```typescript
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: 'https://pjais.ai',
  siteName: 'PJais.ai',
  title: 'PJais.ai - AI-Powered Web Design & Development',
  description: '...',
  images: [{
    url: '/api/og',
    width: 1200,
    height: 630,
    alt: 'PJais.ai'
  }]
},
twitter: {
  card: 'summary_large_image',
  creator: '@pjaisai',
  title: '...',
  description: '...',
  images: ['/api/og']
}
```

### Page Metadata
Each page includes:
- `openGraph.title` - Page title
- `openGraph.description` - Page description
- `openGraph.images[0].url` - Dynamic OG image URL
- `twitter.title` - Twitter title
- `twitter.description` - Twitter description
- `twitter.images[0]` - Dynamic OG image URL

## Image Dimensions

- **Width**: 1200px
- **Height**: 630px
- **Format**: PNG
- **Aspect Ratio**: 16:9 (standard for social media)

## Text Optimization

### Title Optimization
- Maximum: 60 characters
- Truncates with ellipsis if longer
- Sanitizes HTML tags
- Decodes HTML entities

### Description Optimization
- Maximum: 160 characters
- Truncates with ellipsis if longer
- Sanitizes HTML tags
- Decodes HTML entities

## Caching Strategy

### Browser Cache
- Duration: 1 hour
- Header: `Cache-Control: public, max-age=3600`

### CDN Cache
- Duration: 24 hours
- Header: `Cache-Control: public, s-maxage=86400`

### Stale-While-Revalidate
- Duration: 7 days
- Header: `Cache-Control: stale-while-revalidate=604800`

## Error Handling

1. **Missing Parameters**: Returns default image
2. **Generation Failure**: Returns fallback image
3. **Invalid Content**: Returns generic image
4. **Timeout**: Returns cached version or fallback

## URL Encoding

All parameters are URL-encoded:
```typescript
const url = `/api/og/blog?slug=${slug}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;
```

This ensures special characters don't break the URL.

