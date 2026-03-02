'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export function FloatingChatButton() {
  return (
    <Link
      href="/chat"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Open AI Chat"
      title="Open AI Chat"
    >
      <MessageCircle size={24} />
    </Link>
  )
}

