/**
 * Admin Contact Messages List API
 *
 * GET /api/admin/contact-messages?status=new|read|replied|archived|all&limit=50
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { contactMessageStatusEnum } from '@/lib/validation-schemas'

const listQuerySchema = z.object({
  status: z.enum([...contactMessageStatusEnum.options, 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const parsed = listQuerySchema.safeParse({
      status: request.nextUrl.searchParams.get('status'),
      limit: request.nextUrl.searchParams.get('limit'),
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { status, limit } = parsed.data

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching contact messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('Unhandled error in GET /api/admin/contact-messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
