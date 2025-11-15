import { NextRequest, NextResponse } from 'next/server'
import {
  searchBlogPosts,
  searchCaseStudies,
  getBlogPostsByTag,
  getCaseStudiesByTag,
  BlogPostMeta,
  CaseStudyMeta,
} from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const tag = searchParams.get('tag')
    const type = searchParams.get('type') // 'blog', 'case-studies', or 'all'

    if (!query && !tag) {
      return NextResponse.json(
        { error: 'Query or tag parameter is required' },
        { status: 400 }
      )
    }

    let blogResults: BlogPostMeta[] = []
    let caseStudyResults: CaseStudyMeta[] = []

    // Search by query
    if (query) {
      if (type === 'blog' || type === 'all' || !type) {
        blogResults = await searchBlogPosts(query)
      }
      if (type === 'case-studies' || type === 'all' || !type) {
        caseStudyResults = await searchCaseStudies(query)
      }
    }

    // Filter by tag
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

