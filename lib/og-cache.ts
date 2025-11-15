/**
 * OG Image Caching Strategy
 * Implements caching headers and optimization for OG image generation
 */

export interface CacheConfig {
  maxAge: number; // in seconds
  sMaxAge: number; // in seconds (for CDN)
  staleWhileRevalidate: number; // in seconds
}

/**
 * Default cache configuration for OG images
 * - Browser cache: 1 hour
 * - CDN cache: 24 hours
 * - Stale while revalidate: 7 days
 */
export const DEFAULT_OG_CACHE_CONFIG: CacheConfig = {
  maxAge: 60 * 60, // 1 hour
  sMaxAge: 60 * 60 * 24, // 24 hours
  staleWhileRevalidate: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Generate cache control header for OG images
 */
export function generateCacheControlHeader(config: CacheConfig = DEFAULT_OG_CACHE_CONFIG): string {
  return `public, max-age=${config.maxAge}, s-maxage=${config.sMaxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`;
}

/**
 * Get cache headers for OG image responses
 */
export function getOGImageCacheHeaders(config: CacheConfig = DEFAULT_OG_CACHE_CONFIG) {
  return {
    'Cache-Control': generateCacheControlHeader(config),
    'Content-Type': 'image/png',
    'X-Content-Type-Options': 'nosniff',
  };
}

/**
 * Optimize image generation by limiting text length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sanitize text for OG image generation
 */
export function sanitizeOGText(text: string): string {
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  return sanitized;
}

/**
 * Optimize title for OG image (50-60 characters recommended)
 */
export function optimizeOGTitle(title: string): string {
  const sanitized = sanitizeOGText(title);
  return truncateText(sanitized, 60);
}

/**
 * Optimize description for OG image (150-160 characters recommended)
 */
export function optimizeOGDescription(description: string): string {
  const sanitized = sanitizeOGText(description);
  return truncateText(sanitized, 160);
}

/**
 * Validate OG image dimensions
 */
export function validateOGImageDimensions(width: number, height: number): boolean {
  // OG images should be 1200x630 or similar aspect ratio
  const aspectRatio = width / height;
  const targetRatio = 1200 / 630; // ~1.9
  const tolerance = 0.1;
  return Math.abs(aspectRatio - targetRatio) < tolerance;
}

