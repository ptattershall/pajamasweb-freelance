export const revalidate = 86400 // Revalidate every 24 hours

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const robots = `# Robots.txt for PajamasWeb
# Generated dynamically for SEO optimization

# Allow all bots to crawl the site
User-agent: *
Allow: /

# Disallow admin and private routes
Disallow: /admin/
Disallow: /portal/
Disallow: /api/
Disallow: /test-security/

# Disallow checkout and auth pages
Disallow: /checkout/
Disallow: /signin/
Disallow: /signup/
Disallow: /forgot-password/
Disallow: /reset-password/

# Crawl delay (optional - adjust based on server capacity)
Crawl-delay: 1

# Request rate (optional)
Request-rate: 1/1s

# Sitemap location
Sitemap: ${baseUrl}/api/sitemap

# Google-specific rules
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing-specific rules
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /
`

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

