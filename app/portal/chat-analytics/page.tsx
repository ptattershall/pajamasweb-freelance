/**
 * Chat Analytics Page
 * 
 * Displays analytics and statistics about chat conversations
 */

'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, BarChart3, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ChatAnalytics {
  total_conversations: number
  total_messages: number
  user_messages: number
  assistant_messages: number
  average_messages_per_conversation: number
  conversations: Array<{
    id: string
    title: string
    message_count: number
    created_at: string
  }>
}

export default function ChatAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/portal/chat-analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-gray-600">{error || 'Failed to load analytics'}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Chat Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Conversations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {analytics.total_conversations}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Messages</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {analytics.total_messages}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Your Messages</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {analytics.user_messages}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">AI Responses</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {analytics.assistant_messages}
          </p>
        </div>
      </div>

      {/* Average Messages */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <p className="text-gray-600 text-sm font-medium">Average Messages per Conversation</p>
        <p className="text-4xl font-bold text-gray-900 mt-2">
          {analytics.average_messages_per_conversation}
        </p>
      </div>

      {/* Top Conversations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Conversations by Message Count</h2>
        <div className="space-y-3">
          {analytics.conversations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No conversations yet</p>
          ) : (
            analytics.conversations
              .sort((a, b) => b.message_count - a.message_count)
              .slice(0, 10)
              .map((conv) => (
                <Link key={conv.id} href={`/portal/chat-history/${conv.id}`}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{conv.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{conv.message_count}</p>
                      <p className="text-xs text-gray-500">messages</p>
                    </div>
                  </div>
                </Link>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

