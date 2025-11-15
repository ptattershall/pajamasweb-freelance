/**
 * Chat Conversation Export API Route
 *
 * Exports a chat conversation in multiple formats (JSON, CSV, PDF)
 */

import { getAuthenticatedUser } from '@/lib/auth-service'
import { createServerSupabaseClient } from '@/lib/supabase-server'
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

    const format = request.nextUrl.searchParams.get('format') || 'json'
    const supabase = createServerSupabaseClient()

    // Fetch the chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
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
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      )
    }

    const filename = `${session.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`

    if (format === 'json') {
      return exportJSON(session, messages || [], filename)
    } else if (format === 'csv') {
      return exportCSV(session, messages || [], filename)
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use json or csv' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error exporting chat conversation:', error)
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    )
  }
}

function exportJSON(session: any, messages: any[], filename: string) {
  const data = {
    session: {
      id: session.id,
      title: session.title,
      created_at: session.created_at,
      updated_at: session.updated_at,
    },
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.created_at,
    })),
    exported_at: new Date().toISOString(),
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}.json"`,
    },
  })
}

function exportCSV(session: any, messages: any[], filename: string) {
  const headers = ['Timestamp', 'Role', 'Message']
  const rows = messages.map((m) => [
    new Date(m.created_at).toLocaleString(),
    m.role,
    `"${m.content.replace(/"/g, '""')}"`,
  ])

  const csv = [
    `Conversation: ${session.title}`,
    `Created: ${new Date(session.created_at).toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  })
}

