'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, MessageCircle, ThumbsUp, ThumbsDown, Trash2, History, Search } from 'lucide-react';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  sessionId?: string;
  onClose?: () => void;
}

interface MessageFeedback {
  messageId: string;
  feedback: 'helpful' | 'unhelpful' | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget({ sessionId, onClose }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<Map<string, MessageFeedback>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages =
    searchQuery.trim() === ''
      ? messages
      : messages.filter((m) =>
          m.content.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${q})`, 'gi');
    const parts = text.split(re);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/50 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Get auth token from localStorage or session
    const getToken = async () => {
      try {
        const response = await fetch('/api/auth/token');
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    };
    getToken();
  }, []);

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'unhelpful') => {
    const newFeedback = new Map(messageFeedback);
    newFeedback.set(messageId, { messageId, feedback });
    setMessageFeedback(newFeedback);

    // Log feedback to analytics
    console.log(`Message ${messageId} marked as ${feedback}`);
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      // Clear messages by reloading
      window.location.reload();
    }
  };

  const suggestedPrompts = [
    'How much does a website cost?',
    'What integrations do you support?',
    'Tell me about your services',
    'How does the process work?',
  ];

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full sm:w-96 h-[600px] max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col mx-4 sm:mx-0">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">Chat Assistant</h2>
          <div className="flex gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((o) => !o);
                  if (searchOpen) setSearchQuery('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSearchOpen((o) => !o);
                    if (searchOpen) setSearchQuery('');
                  }
                }}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-blue-700 rounded transition-colors ${searchOpen ? 'bg-blue-700' : ''}`}
                aria-label="Search in this conversation"
                aria-expanded={searchOpen}
                title="Search in this conversation"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-blue-700 rounded transition-colors"
              aria-label="Toggle chat history"
              title="Chat history"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleClearChat}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-blue-700 rounded transition-colors"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-blue-700 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {searchOpen && messages.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <Search className="w-4 h-4 shrink-0 text-blue-200" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('');
                  setSearchOpen(false);
                }
              }}
              placeholder="Search in this conversation..."
              className="flex-1 min-w-0 rounded px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-500 border-0"
              aria-label="Search messages in this conversation"
              autoFocus
            />
            {searchQuery.trim() && (
              <span className="text-xs text-blue-200 shrink-0">
                {filteredMessages.length} of {messages.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">How can I help you today?</p>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => {
                    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>);
                    setTimeout(() => {
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
                    }, 0);
                  }}
                  className="w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          (() => {
            const list = searchQuery.trim() ? filteredMessages : messages;
            if (searchQuery.trim() && list.length === 0) {
              return (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No messages match &quot;{searchQuery}&quot;
                </p>
              );
            }
            return list.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                <div className="flex flex-col gap-1">
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {searchQuery.trim()
                      ? highlightMatch(m.content, searchQuery)
                      : m.content}
                  </div>
                {m.role === 'assistant' && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleFeedback(m.id, 'helpful')}
                      className={`p-1 rounded text-xs ${
                        messageFeedback.get(m.id)?.feedback === 'helpful'
                          ? 'bg-green-200 text-green-700'
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      aria-label="Mark as helpful"
                      title="Helpful"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(m.id, 'unhelpful')}
                      className={`p-1 rounded text-xs ${
                        messageFeedback.get(m.id)?.feedback === 'unhelpful'
                          ? 'bg-red-200 text-red-700'
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      aria-label="Mark as unhelpful"
                      title="Unhelpful"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
                </div>
              </div>
            ));
          })()
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 p-3 rounded-lg">
              <div className={styles.messageContainer}>
                <div className={styles.loadingDot}></div>
                <div className={styles.loadingDot}></div>
                <div className={styles.loadingDot}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="sm"
          className="min-w-[44px] min-h-[44px] shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

