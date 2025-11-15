/**
 * Chat Conversation Detail Page
 * 
 * Displays a full conversation thread with all messages
 */

'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, MessageSquare, Loader2, Download, FileText, Calendar, Package } from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface RelatedItem {
  type: 'invoice' | 'booking' | 'deliverable'
  id: string
  title: string
  reference: string
}

interface ConversationData {
  session: {
    id: string
    title: string
    created_at: string
    updated_at: string
  }
  messages: ChatMessage[]
}

export default function ChatConversationPage({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = useState<ConversationData | null>(null)
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/portal/chat-history/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch conversation')
        }
        const data = await response.json()
        setConversation(data)

        // Fetch related items
        const itemsResponse = await fetch(`/api/portal/chat-history/${params.id}/related-items`)
        if (itemsResponse.ok) {
          const items = await itemsResponse.json()
          setRelatedItems(items)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversation')
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true)
    try {
      const response = await fetch(`/api/portal/chat-history/${params.id}/export?format=${format}`)
      if (!response.ok) {
        throw new Error('Failed to export conversation')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.split('filename="')[1]?.split('"')[0] || `conversation.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export conversation')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="text-center py-12">
        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-gray-600">{error || 'Conversation not found'}</p>
        <Link href="/portal/chat-history" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Chat History
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/portal/chat-history"
          className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Chat History
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{conversation.session.title}</h1>
            <p className="text-gray-500 text-sm mt-2">
              Started {formatDate(conversation.session.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Download size={18} />
              JSON
            </button>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedItems.map((item) => {
              const icon =
                item.type === 'invoice' ? (
                  <FileText size={18} />
                ) : item.type === 'booking' ? (
                  <Calendar size={18} />
                ) : (
                  <Package size={18} />
                )

              const href =
                item.type === 'invoice'
                  ? `/portal/invoices/${item.id}`
                  : item.type === 'booking'
                    ? `/portal/bookings/${item.id}`
                    : `/portal/deliverables/${item.id}`

              return (
                <Link key={`${item.type}-${item.id}`} href={href}>
                  <div className="p-3 bg-white rounded border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 flex-shrink-0 mt-1">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.reference}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No messages in this conversation</p>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                  >
                    {message.role === 'user' ? 'You' : 'AI'}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(message.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

