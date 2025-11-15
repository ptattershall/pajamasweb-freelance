import { NextRequest, NextResponse } from 'next/server'
import { findSimilarCaseStudies } from '@/lib/supabase'

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

    // Find similar case studies
    const similarStudies = await findSimilarCaseStudies(embedding, limit + 1)

    // Filter out the current study
    const relatedStudies = similarStudies
      .filter((study: any) => study.slug !== currentSlug)
      .slice(0, limit)

    return NextResponse.json({
      studies: relatedStudies,
      count: relatedStudies.length,
    })
  } catch (error) {
    console.error('Error finding related case studies:', error)
    return NextResponse.json(
      { error: 'Failed to find related case studies' },
      { status: 500 }
    )
  }
}

