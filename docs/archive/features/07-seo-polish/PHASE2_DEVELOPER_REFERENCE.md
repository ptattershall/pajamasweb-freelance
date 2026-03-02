# Phase 2: Developer Reference Card

**Quick reference for implementing or modifying JSON-LD schemas.**

## Import Statements

```typescript
// Schema generation
import { 
  generateOrganizationSchema,
  generateArticleSchema,
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generatePersonSchema,
  generateLocalBusinessSchema
} from '@/lib/json-ld-schemas'

// Components
import { JsonLdScript, MultipleJsonLdScripts } from '@/components/JsonLdScript'
```

## Single Schema Usage

```typescript
// Generate schema
const schema = generateOrganizationSchema()

// Render in component
<JsonLdScript schema={schema} />
```

## Multiple Schemas Usage

```typescript
// Generate multiple schemas
const schemas = [
  generateArticleSchema({ ... }),
  generateBreadcrumbSchema([ ... ]),
  generatePersonSchema({ ... })
]

// Render all schemas
<MultipleJsonLdScripts schemas={schemas} />
```

## Schema Functions

### Organization
```typescript
generateOrganizationSchema()
// Returns: Organization schema with name, URL, logo, contact
```

### Article
```typescript
generateArticleSchema({
  title: string
  summary: string
  publishedAt: string
  slug: string
  heroImage?: string
})
```

### Service
```typescript
generateServiceSchema({
  title: string
  summary?: string
  slug: string
  price_from_cents?: number
})
```

### BreadcrumbList
```typescript
generateBreadcrumbSchema([
  { name: string, url: string },
  { name: string, url: string }
])
```

### FAQ
```typescript
generateFAQSchema([
  { question: string, answer: string },
  { question: string, answer: string }
])
```

### Person
```typescript
generatePersonSchema({
  name: string
  url?: string
})
```

### LocalBusiness
```typescript
generateLocalBusinessSchema({
  name: string
  address?: string
  phone?: string
  email?: string
})
```

## Common Patterns

### Blog Post Page
```typescript
const articleSchema = generateArticleSchema({
  title: post.title,
  summary: post.summary,
  publishedAt: post.publishedAt,
  slug: params.slug,
  heroImage: heroImage?.images?.url
})

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: APP_URL },
  { name: 'Blog', url: `${APP_URL}/blog` },
  { name: post.title, url: `${APP_URL}/blog/${params.slug}` }
])

const personSchema = generatePersonSchema({
  name: 'PJais.ai',
  url: APP_URL
})

return (
  <div>
    <MultipleJsonLdScripts schemas={[articleSchema, breadcrumbSchema, personSchema]} />
    {/* Page content */}
  </div>
)
```

### Service Page
```typescript
const serviceSchema = generateServiceSchema({
  title: service.title,
  summary: service.summary,
  slug: service.slug,
  price_from_cents: service.price_from_cents
})

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: APP_URL },
  { name: 'Services', url: `${APP_URL}/services` },
  { name: service.title, url: `${APP_URL}/services/${params.slug}` }
])

const faqSchema = generateFAQSchema([
  { question: 'Q1?', answer: 'A1' },
  { question: 'Q2?', answer: 'A2' }
])

return (
  <main>
    <MultipleJsonLdScripts schemas={[serviceSchema, breadcrumbSchema, faqSchema]} />
    {/* Page content */}
  </main>
)
```

## Testing

### DevTools
```
1. F12 → Elements
2. Search: "application/ld+json"
3. Verify JSON structure
```

### Validation
- Google: https://search.google.com/test/rich-results
- Schema.org: https://validator.schema.org/
- JSON: https://jsonlint.com/

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Schemas not showing | Clear cache, hard refresh |
| Validation errors | Check required fields |
| Wrong URLs | Verify NEXT_PUBLIC_APP_URL |
| Missing schemas | Check imports and rendering |

## File Locations

- Schemas: `lib/json-ld-schemas.ts`
- Components: `components/JsonLdScript.tsx`
- Root layout: `app/layout.tsx`
- Blog: `app/blog/[slug]/page.tsx`
- Case studies: `app/case-studies/[slug]/page.tsx`
- Services: `app/services/[slug]/page.tsx`

## Resources

- Schema.org: https://schema.org/
- JSON-LD: https://json-ld.org/
- Google Search Central: https://developers.google.com/search
- Next.js Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

