import { getAllBlogPosts, getAllCaseStudies } from '@/lib/content'
import { getServices } from '@/lib/supabase'

export const revalidate = 3600 // Revalidate every hour

interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

function generateSitemapXml(entries: SitemapEntry[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return xml
}

export async function GET() {
  try {
    const entries: SitemapEntry[] = []
    const today = new Date().toISOString().split('T')[0]

    // Static pages
    entries.push(
      {
        url: '/',
        lastmod: today,
        changefreq: 'weekly',
        priority: 1.0,
      },
      {
        url: '/blog',
        lastmod: today,
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        url: '/case-studies',
        lastmod: today,
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        url: '/services',
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        url: '/search',
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.7,
      },
      {
        url: '/chat',
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.7,
      },
      {
        url: '/book',
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      }
    )

    // Blog posts
    const blogPosts = getAllBlogPosts()
    blogPosts.forEach((post) => {
      entries.push({
        url: `/blog/${post.slug}`,
        lastmod: post.publishedAt.split('T')[0],
        changefreq: 'monthly',
        priority: 0.8,
      })
    })

    // Case studies
    const caseStudies = getAllCaseStudies()
    caseStudies.forEach((study) => {
      entries.push({
        url: `/case-studies/${study.slug}`,
        lastmod: study.publishedAt.split('T')[0],
        changefreq: 'monthly',
        priority: 0.8,
      })
    })

    // Services
    const services = await getServices(true)
    services.forEach((service) => {
      entries.push({
        url: `/services/${service.slug}`,
        lastmod: service.updated_at?.split('T')[0] || today,
        changefreq: 'weekly',
        priority: 0.8,
      })
    })

    const xml = generateSitemapXml(entries)

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response('Error generating sitemap', { status: 500 })
  }
}

