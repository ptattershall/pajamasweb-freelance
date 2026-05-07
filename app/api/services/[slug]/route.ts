import { NextRequest, NextResponse } from 'next/server'
import { getServiceBySlug } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: 'Service slug is required' },
        { status: 400 }
      )
    }

    const service = await getServiceBySlug(slug)

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: service.id,
      slug: service.slug,
      title: service.title,
      summary: service.summary,
      price_from_cents: service.price_from_cents,
      tier: service.tier,
      is_active: service.is_active,
    })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}
