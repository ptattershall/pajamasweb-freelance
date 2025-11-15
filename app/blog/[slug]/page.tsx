import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/content'
import { getBlogPostImages, supabase, BlogPostImage } from '@/lib/supabase'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { RelatedBlogPosts } from '@/components/RelatedBlogPosts'
import { ContentNavigation } from '@/components/ContentNavigation'
import { FloatingChatButton } from '@/components/FloatingChatButton'
import { JsonLdScript, MultipleJsonLdScripts } from '@/components/JsonLdScript'
import { generateArticleSchema, generateBreadcrumbSchema, generatePersonSchema } from '@/lib/json-ld-schemas'
import type { Metadata } from 'next'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const params = await props.params
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    return {}
  }

  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/og/blog?slug=${params.slug}&title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.summary)}`

  return {
    title: `${post.title} | PJais.ai`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${params.slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt,
      authors: ['PJais.ai'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImageUrl],
    },
  }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Fetch associated images
  let images: BlogPostImage[] = []
  try {
    images = await getBlogPostImages(params.slug)
  } catch (error) {
    console.error('Error fetching blog post images:', error)
  }

  // Find hero image
  const heroImage = images?.find((img: any) => img.is_hero)

  // Fetch embedding for related posts
  let embedding: number[] | undefined
  try {
    const { data } = await supabase
      .from('blog_posts_meta')
      .select('embedding')
      .eq('slug', params.slug)
      .single()

    const blogPostMeta = data as { embedding?: number[] } | null
    if (blogPostMeta?.embedding) {
      embedding = blogPostMeta.embedding
    }
  } catch (error) {
    console.error('Error fetching blog post embedding:', error)
  }

  // Generate JSON-LD schemas
  const articleSchema = generateArticleSchema({
    title: post.title,
    summary: post.summary,
    publishedAt: post.publishedAt,
    slug: params.slug,
    heroImage: heroImage?.images?.url,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` },
    { name: 'Blog', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog` },
    { name: post.title, url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${params.slug}` },
  ])

  const personSchema = generatePersonSchema({
    name: 'PJais.ai',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  })

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <MultipleJsonLdScripts schemas={[articleSchema, breadcrumbSchema, personSchema]} />
      <ContentNavigation backLink={{ href: '/blog', label: 'Back to Blog' }} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* JSON-LD schemas are rendered in head via MultipleJsonLdScripts */}

        {/* Header */}
        <header className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {post.formattedDate}
            </time>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
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

          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {post.summary}
          </p>
        </header>

        {/* Hero Image */}
        {heroImage && heroImage.images && (
          <div className="mb-12 overflow-hidden rounded-lg">
            <OptimizedImage
              src={heroImage.images.url}
              alt={heroImage.images.filename}
              width={800}
              height={400}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
            />
          </div>
        )}

        {/* Content */}
        <article className="prose prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg prose-h6:text-base dark:prose-headings:text-white dark:prose-invert max-w-none">
          <MDXRemote source={post.content} />
        </article>

        {/* Related Posts */}
        {embedding && (
          <RelatedBlogPosts
            currentSlug={params.slug}
            embedding={embedding}
            limit={3}
          />
        )}
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}

