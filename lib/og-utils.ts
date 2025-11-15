/**
 * OpenGraph Image Generation Utilities
 * Provides helper functions for generating OG image URLs
 */

export interface OGImageOptions {
  title: string;
  description?: string;
  type?: 'blog' | 'case-study' | 'service' | 'default';
  slug?: string;
}

/**
 * Generate OG image URL for blog posts
 */
export function generateBlogOGImageUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/og/blog?slug=${slug}`;
}

/**
 * Generate OG image URL for case studies
 */
export function generateCaseStudyOGImageUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/og/case-study?slug=${slug}`;
}

/**
 * Generate OG image URL for services
 */
export function generateServiceOGImageUrl(
  title: string,
  description?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  params.append('title', title);
  if (description) {
    params.append('description', description);
  }
  return `${baseUrl}/api/og/service?${params.toString()}`;
}

/**
 * Generate default OG image URL
 */
export function generateDefaultOGImageUrl(
  title?: string,
  description?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  if (title) {
    params.append('title', title);
  }
  if (description) {
    params.append('description', description);
  }
  return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * Get fallback OG image URL (static thumbnail)
 */
export function getFallbackOGImageUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/thumbnail.png`;
}

/**
 * Get fallback OG image URL (generated fallback)
 */
export function getFallbackGeneratedOGImageUrl(
  title?: string,
  description?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  if (title) {
    params.append('title', title);
  }
  if (description) {
    params.append('description', description);
  }
  return `${baseUrl}/api/og/fallback?${params.toString()}`;
}

/**
 * Generate complete OG metadata object
 */
export function generateOGMetadata(options: OGImageOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let imageUrl: string;

  switch (options.type) {
    case 'blog':
      imageUrl = options.slug
        ? generateBlogOGImageUrl(options.slug)
        : generateDefaultOGImageUrl(options.title, options.description);
      break;
    case 'case-study':
      imageUrl = options.slug
        ? generateCaseStudyOGImageUrl(options.slug)
        : generateDefaultOGImageUrl(options.title, options.description);
      break;
    case 'service':
      imageUrl = generateServiceOGImageUrl(options.title, options.description);
      break;
    default:
      imageUrl = generateDefaultOGImageUrl(options.title, options.description);
  }

  return {
    openGraph: {
      title: options.title,
      description: options.description || '',
      type: 'website' as const,
      url: baseUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: options.title,
      description: options.description || '',
      images: [imageUrl],
    },
  };
}

