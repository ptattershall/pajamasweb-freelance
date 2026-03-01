import { NextRequest, NextResponse } from 'next/server'
import { blogPostUpdateSchema } from '@/lib/validation-schemas'
import { updateBlogPost, deleteBlogPost, getBlogPostForEdit } from '@/lib/blog-service'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const post = await getBlogPostForEdit(slug)

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const body = await request.json()
    const validatedData = blogPostUpdateSchema.parse(body)

    await updateBlogPost(slug, validatedData)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { errors: unknown[] }).errors },
        { status: 400 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to update blog post'
    console.error('Failed to update blog post:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    await deleteBlogPost(slug)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
