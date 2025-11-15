'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, MessageCircle, ThumbsUp, ThumbsDown, Trash2, History } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="font-bold">Chat Assistant</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label="Toggle chat history"
            title="Chat history"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleClearChat}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">How can I help you today?</p>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => {
                    handleInputChange({ target: { value: prompt } } as any);
                    setTimeout(() => {
                      handleSubmit({ preventDefault: () => {} } as any);
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
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
              <div className="flex flex-col gap-1">
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {m.content}
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
          ))
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
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

