'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/lib/content'

interface RelatedBlogPostsProps {
  currentSlug: string
  embedding?: number[]
  limit?: number
}

interface RelatedPost {
  id: string
  slug: string
  title: string
  summary: string
  similarity: number
}

export function RelatedBlogPosts({
  currentSlug,
  embedding,
  limit = 3,
}: RelatedBlogPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!embedding) {
      setLoading(false)
      return
    }

    async function fetchRelatedPosts() {
      try {
        const response = await fetch('/api/related-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embedding,
            currentSlug,
            limit,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch related posts')
        }

        const data = await response.json()
        setRelatedPosts(data.posts || [])
      } catch (err) {
        console.error('Error fetching related posts:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedPosts()
  }, [embedding, currentSlug, limit])

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all"
          >
            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-2">
              {post.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {post.summary}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {Math.round(post.similarity * 100)}% match
              </span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

