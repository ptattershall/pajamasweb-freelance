/**
 * Chat History Service
 * 
 * Manages chat session persistence and retrieval from Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: Record<string, any>;
  tool_results?: Record<string, any>;
  confidence_score?: number;
  created_at: string;
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  userId: string,
  title: string = 'New Chat'
): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title,
      is_public: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }

  return data;
}

/**
 * Get all chat sessions for a user
 */
export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific chat session with message count
 */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching chat session:', error);
    throw error;
  }

  if (!data) return null;

  // Get message count
  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  return { ...data, message_count: count || 0 };
}

/**
 * Update chat session title
 */
export async function updateChatSessionTitle(
  sessionId: string,
  title: string
): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

/**
 * Save a chat message
 */
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  toolCalls?: Record<string, any>,
  toolResults?: Record<string, any>,
  confidenceScore?: number
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
      tool_calls: toolCalls,
      tool_results: toolResults,
      confidence_score: confidenceScore,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }

  return data;
}

/**
 * Get all messages for a session
 */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }

  return data || [];
}

/**
 * Delete all messages in a session
 */
export async function clearChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error clearing chat session:', error);
    throw error;
  }
}

/**
 * Generate a title from first user message
 */
export function generateSessionTitle(firstMessage: string): string {
  const maxLength = 50;
  const title = firstMessage.substring(0, maxLength).trim();
  return title.length < firstMessage.length ? `${title}...` : title;
}

