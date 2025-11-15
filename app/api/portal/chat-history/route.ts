/**
 * Chat History API Route
 *
 * Fetches chat conversation history for the client portal
 * Integrates with the existing chat system to fetch conversation threads
 */

import { getAuthenticatedUser } from '@/lib/auth-service'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchQuery = request.nextUrl.searchParams.get('search') || ''
    const supabase = createServerSupabaseClient()

    // Fetch all chat sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching chat sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      )
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json([])
    }

    // For each session, get message count and preview
    const conversations = await Promise.all(
      sessions.map(async (session) => {
        // Get message count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)

        // Get first user message for preview
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('session_id', session.id)
          .eq('role', 'user')
          .order('created_at', { ascending: true })
          .limit(1)

        const preview = messages?.[0]?.content || 'No messages'
        const previewText = preview.substring(0, 100) + (preview.length > 100 ? '...' : '')

        return {
          id: session.id,
          title: session.title,
          preview: previewText,
          message_count: count || 0,
          last_message_at: session.updated_at,
        }
      })
    )

    // Filter by search query if provided
    const filtered = searchQuery
      ? conversations.filter(
          (c) =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.preview.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : conversations

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

