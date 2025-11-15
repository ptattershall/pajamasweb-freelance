/**
 * JSON-LD Schema Generation Utilities
 * Generates structured data for SEO and rich results
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Organization Schema
 * Describes the organization/business
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PJais.ai',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    description: 'Professional web design, development, and AI-powered services',
    sameAs: [
      'https://twitter.com/pjaisai',
      'https://linkedin.com/company/pjais-ai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@pjais.ai',
    },
  }
}

/**
 * Article Schema for Blog Posts
 */
export function generateArticleSchema(post: {
  title: string
  summary: string
  publishedAt: string
  slug: string
  heroImage?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.heroImage ? `${APP_URL}${post.heroImage}` : `${APP_URL}/api/og/blog?slug=${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'PJais.ai',
      url: APP_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PJais.ai',
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${APP_URL}/blog/${post.slug}`,
    },
  }
}

/**
 * Service Schema for Service Pages
 */
export function generateServiceSchema(service: {
  title: string
  summary?: string
  slug: string
  price_from_cents?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary || service.title,
    provider: {
      '@type': 'Organization',
      name: 'PJais.ai',
      url: APP_URL,
    },
    url: `${APP_URL}/services/${service.slug}`,
    ...(service.price_from_cents && {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: (service.price_from_cents / 100).toString(),
      },
    }),
  }
}

/**
 * BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * FAQ Schema for Service Pages
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Person Schema for Author
 */
export function generatePersonSchema(author: { name: string; url?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    ...(author.url && { url: author.url }),
  }
}

/**
 * LocalBusiness Schema (if applicable)
 */
export function generateLocalBusinessSchema(business: {
  name: string
  address?: string
  phone?: string
  email?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: APP_URL,
    ...(business.address && { address: business.address }),
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
  }
}

