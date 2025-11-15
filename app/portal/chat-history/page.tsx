/**
 * Client Portal Chat History Page
 */

'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Search } from 'lucide-react'
import Link from 'next/link'

interface ChatConversation {
  id: string
  title: string
  preview: string
  message_count: number
  last_message_at: string
}

export default function ChatHistoryPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`/api/portal/chat-history?search=${searchQuery}`)
        if (response.ok) {
          const data = await response.json()
          setConversations(data)
        }
      } catch (error) {
        console.error('Error fetching chat history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [searchQuery])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Chat History</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading chat history...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No conversations found</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/portal/chat-history/${conversation.id}`}
            >
              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{conversation.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{conversation.preview}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{conversation.message_count} messages</span>
                      <span>{formatDate(conversation.last_message_at)}</span>
                    </div>
                  </div>
                  <MessageSquare size={20} className="text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

