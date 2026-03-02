# Phase 2: Structured Data - Technical Details

**Purpose:** Detailed technical documentation of JSON-LD implementation.

## Architecture Overview

### Schema Generation Layer
**File:** `lib/json-ld-schemas.ts`

Functions:
- `generateOrganizationSchema()` - Organization metadata
- `generateArticleSchema()` - Blog/case study articles
- `generateServiceSchema()` - Service offerings
- `generateBreadcrumbSchema()` - Navigation hierarchy
- `generateFAQSchema()` - Frequently asked questions
- `generatePersonSchema()` - Author information
- `generateLocalBusinessSchema()` - Physical location

### Rendering Layer
**File:** `components/JsonLdScript.tsx`

Components:
- `JsonLdScript` - Single schema renderer
- `MultipleJsonLdScripts` - Multiple schemas renderer

Uses `dangerouslySetInnerHTML` to inject JSON-LD into document head.

## Integration Points

### Root Layout
**File:** `app/layout.tsx`

```typescript
import { generateOrganizationSchema } from '@/lib/json-ld-schemas'
import { JsonLdScript } from '@/components/JsonLdScript'

// In component:
const organizationSchema = generateOrganizationSchema()
<JsonLdScript schema={organizationSchema} />
```

### Blog Pages
**Files:** `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`

Schemas:
- BreadcrumbList (listing page)
- Article, BreadcrumbList, Person (detail page)

### Case Studies
**Files:** `app/case-studies/page.tsx`, `app/case-studies/[slug]/page.tsx`

Schemas:
- BreadcrumbList (listing page)
- Article, BreadcrumbList (detail page)

### Services
**Files:** `app/services/page.tsx`, `app/services/[slug]/page.tsx`

Schemas:
- BreadcrumbList (listing page)
- Service, BreadcrumbList, FAQPage (detail page)

## Schema Specifications

### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PJais.ai",
  "url": "https://pjais.ai",
  "logo": "https://pjais.ai/logo.png",
  "description": "Professional web design, development, and AI-powered services",
  "sameAs": ["https://twitter.com/pjaisai", "https://linkedin.com/company/pjais-ai"],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "contact@pjais.ai"
  }
}
```

### Article Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article Title",
  "description": "Article summary",
  "image": "https://pjais.ai/image.jpg",
  "datePublished": "2025-11-14",
  "dateModified": "2025-11-14",
  "author": {
    "@type": "Organization",
    "name": "PJais.ai"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PJais.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://pjais.ai/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://pjais.ai/blog/post-slug"
  }
}
```

### Service Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "description": "Service description",
  "provider": {
    "@type": "Organization",
    "name": "PJais.ai"
  },
  "url": "https://pjais.ai/services/slug",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "1000"
  }
}
```

### BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pjais.ai"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://pjais.ai/blog"
    }
  ]
}
```

### FAQ Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

## Performance Considerations

- **Rendering:** Schemas rendered at build time (static)
- **Size:** ~1-2KB per page (minimal impact)
- **Caching:** Cached with page content
- **SEO:** No negative impact on Core Web Vitals

## Browser Support

- ✅ All modern browsers
- ✅ Search engine crawlers
- ✅ Social media crawlers
- ✅ Rich result parsers

## Validation

- Schema.org validator: https://validator.schema.org/
- Google Rich Results Test: https://search.google.com/test/rich-results
- JSON-LD validator: https://jsonlint.com/

## Future Enhancements

- [ ] Add Event schema for webinars
- [ ] Add Product schema for offerings
- [ ] Add Review schema for testimonials
- [ ] Add VideoObject schema for videos
- [ ] Add AggregateRating schema

