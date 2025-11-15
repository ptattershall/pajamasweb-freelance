/**
 * Chat Analytics API Route
 *
 * Provides analytics data for chat conversations
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

    const supabase = createServerSupabaseClient()

    // Get total conversations
    const { count: totalConversations } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get all sessions with message counts
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    let totalMessages = 0
    let userMessages = 0
    let assistantMessages = 0
    const conversationStats: any[] = []

    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        const { count: messageCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)

        const { count: userCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .eq('role', 'user')

        const { count: assistantCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .eq('role', 'assistant')

        totalMessages += messageCount || 0
        userMessages += userCount || 0
        assistantMessages += assistantCount || 0

        conversationStats.push({
          id: session.id,
          title: session.title,
          message_count: messageCount || 0,
          created_at: session.created_at,
        })
      }
    }

    const averageMessagesPerConversation =
      totalConversations && totalConversations > 0
        ? Math.round(totalMessages / totalConversations)
        : 0

    return NextResponse.json({
      total_conversations: totalConversations || 0,
      total_messages: totalMessages,
      user_messages: userMessages,
      assistant_messages: assistantMessages,
      average_messages_per_conversation: averageMessagesPerConversation,
      conversations: conversationStats,
    })
  } catch (error) {
    console.error('Error fetching chat analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

