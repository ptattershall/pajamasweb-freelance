import { NextRequest, NextResponse } from 'next/server'
import { findSimilarBlogPosts } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { embedding, currentSlug, limit = 3 } = await request.json()

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: 'Valid embedding array is required' },
        { status: 400 }
      )
    }

    if (!currentSlug) {
      return NextResponse.json(
        { error: 'Current slug is required' },
        { status: 400 }
      )
    }

    // Find similar blog posts
    const similarPosts = await findSimilarBlogPosts(embedding, limit + 1)

    // Filter out the current post
    const relatedPosts = similarPosts
      .filter((post: any) => post.slug !== currentSlug)
      .slice(0, limit)

    return NextResponse.json({
      posts: relatedPosts,
      count: relatedPosts.length,
    })
  } catch (error) {
    console.error('Error finding related posts:', error)
    return NextResponse.json(
      { error: 'Failed to find related posts' },
      { status: 500 }
    )
  }
}

