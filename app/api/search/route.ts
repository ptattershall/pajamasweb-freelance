import { NextRequest, NextResponse } from 'next/server'
import {
  searchBlogPosts,
  searchCaseStudies,
  getBlogPostsByTag,
  getCaseStudiesByTag,
  BlogPostMeta,
  CaseStudyMeta,
} from '@/lib/supabase'
import { searchQuerySchema } from '@/lib/validation-schemas'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const parsed = searchQuerySchema.safeParse({
      q: searchParams.get('q') || undefined,
      tag: searchParams.get('tag') || undefined,
      type: searchParams.get('type') || undefined,
    })

    if (!parsed.success) {
      const flat = parsed.error.flatten()
      return NextResponse.json(
        { error: 'Validation failed', details: flat },
        { status: 400 }
      )
    }

    const { q: query, tag, type } = parsed.data

    let blogResults: BlogPostMeta[] = []
    let caseStudyResults: CaseStudyMeta[] = []

    if (query) {
      if (type === 'blog' || type === 'all' || !type) {
        blogResults = await searchBlogPosts(query)
      }
      if (type === 'case-studies' || type === 'all' || !type) {
        caseStudyResults = await searchCaseStudies(query)
      }
    }

    if (tag) {
      if (type === 'blog' || type === 'all' || !type) {
        blogResults = await getBlogPostsByTag(tag)
      }
      if (type === 'case-studies' || type === 'all' || !type) {
        caseStudyResults = await getCaseStudiesByTag(tag)
      }
    }

    return NextResponse.json({
      blog: blogResults,
      caseStudies: caseStudyResults,
      total: blogResults.length + caseStudyResults.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

