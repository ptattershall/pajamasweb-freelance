import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/content'
import { JsonLdScript } from '@/components/JsonLdScript'
import { generateBreadcrumbSchema } from '@/lib/json-ld-schemas'
import { ContentNavigation } from '@/components/ContentNavigation'
import { FloatingChatButton } from '@/components/FloatingChatButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | PJais.ai',
  description: 'Read our latest articles about web design, development, and digital strategy.',
  openGraph: {
    title: 'Blog | PJais.ai',
    description: 'Read our latest articles about web design, development, and digital strategy.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/thumbnail.png`,
        width: 1200,
        height: 630,
        alt: 'PJais.ai Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | PJais.ai',
    description: 'Read our latest articles about web design, development, and digital strategy.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/thumbnail.png`],
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` },
    { name: 'Blog', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog` },
  ])

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <JsonLdScript schema={breadcrumbSchema} />
      <ContentNavigation />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Insights and articles about web design, development, and digital strategy.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border-b border-gray-200 pb-8 dark:border-gray-800 last:border-b-0"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {post.formattedDate}
                  </time>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-black dark:text-white">
                  <Link
                    href={post.url}
                    className="hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    {post.title}
                  </Link>
                </h2>

                <p className="text-gray-600 dark:text-gray-400">
                  {post.summary}
                </p>

                <Link
                  href={post.url}
                  className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}

