import { NextRequest, NextResponse } from 'next/server'
import { blogPostSchema } from '@/lib/validation-schemas'
import { createBlogPost } from '@/lib/blog-service'
import { getAllBlogPosts } from '@/lib/content'

export async function GET() {
  try {
    const posts = getAllBlogPosts()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = blogPostSchema.parse(body)

    await createBlogPost(validatedData)

    return NextResponse.json(
      { success: true, slug: validatedData.slug },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { errors: unknown[] }).errors },
        { status: 400 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to create blog post'
    console.error('Failed to create blog post:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
