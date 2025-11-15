'use client';

import { useState, useEffect } from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
import type { ChatSession } from '@/lib/chat-history';

interface ChatHistoryProps {
  userId?: string;
  onSelectSession?: (sessionId: string) => void;
  isOpen: boolean;
}

export default function ChatHistory({ userId, onSelectSession, isOpen }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadSessions();
    }
  }, [isOpen, userId]);

  const loadSessions = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/sessions?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to load sessions');

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this chat? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete session');

      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete chat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 rounded-l-lg overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Chat History</h3>
        <p className="text-xs text-gray-500 mt-1">Your recent conversations</p>
      </div>

      {loading && (
        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="p-4 text-center text-sm text-gray-500">
          No chat history yet. Start a new conversation!
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-3 hover:bg-gray-50 transition-colors group"
          >
            <button
              type="button"
              onClick={() => onSelectSession?.(session.id)}
              className="w-full text-left flex items-start gap-2 mb-2"
              title={session.title}
            >
              <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {session.message_count || 0} messages
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDeleteSession(session.id)}
              className="w-full text-left text-xs text-gray-500 hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
              aria-label="Delete chat"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={loadSessions}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

