/**
 * Chat Related Items API Route
 *
 * Fetches related items (invoices, bookings, deliverables) for a chat conversation
 */

import { getAuthenticatedUser } from '@/lib/auth-service'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { detectRelatedItems } from '@/lib/chat-related-items'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Fetch all messages for this session
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('content')
      .eq('session_id', id)

    if (!messages || messages.length === 0) {
      return NextResponse.json([])
    }

    // Combine all message content
    const allContent = messages.map((m) => m.content).join(' ')

    // Detect related items
    const relatedItems = await detectRelatedItems(user.id, allContent)

    // Remove duplicates
    const uniqueItems = Array.from(
      new Map(relatedItems.map((item) => [`${item.type}-${item.id}`, item])).values()
    )

    return NextResponse.json(uniqueItems)
  } catch (error) {
    console.error('Error fetching related items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related items' },
      { status: 500 }
    )
  }
}

