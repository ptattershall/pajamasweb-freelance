/**
 * Moderation Service
 *
 * Handles message moderation, user behavior tracking, and abuse detection
 */

import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(): ReturnType<typeof createClient> {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(url, key);
  }
  return supabase;
}

export interface ModerationFlag {
  id: string;
  message_id: string;
  session_id: string;
  flag_type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolved: boolean;
  created_at: string;
}

export interface UserBehavior {
  userId: string;
  messageCount: number;
  flagCount: number;
  averageConfidence: number;
  lastMessageTime: string;
  riskScore: number;
}

/**
 * Flag a message for moderation
 */
export async function flagMessage(
  messageId: string,
  sessionId: string,
  flagType: string,
  severity: 'low' | 'medium' | 'high' = 'medium',
  description?: string
): Promise<ModerationFlag> {
  const { data, error } = await (getSupabaseClient() as any)
    .from('moderation_flags')
    .insert({
      message_id: messageId,
      session_id: sessionId,
      flag_type: flagType,
      severity,
      description,
      resolved: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error flagging message:', error);
    throw error;
  }

  return data;
}

/**
 * Get flags for a message
 */
export async function getMessageFlags(messageId: string): Promise<ModerationFlag[]> {
  const { data, error } = await (getSupabaseClient() as any)
    .from('moderation_flags')
    .select('*')
    .eq('message_id', messageId);

  if (error) {
    console.error('Error fetching message flags:', error);
    throw error;
  }

  return data || [];
}

/**
 * Resolve a moderation flag
 */
export async function resolveFlag(
  flagId: string,
  resolutionNotes?: string
): Promise<ModerationFlag> {
  const { data, error } = await (getSupabaseClient() as any)
    .from('moderation_flags')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes,
    })
    .eq('id', flagId)
    .select()
    .single();

  if (error) {
    console.error('Error resolving flag:', error);
    throw error;
  }

  return data;
}

/**
 * Get unresolved flags
 */
export async function getUnresolvedFlags(
  limit: number = 50
): Promise<ModerationFlag[]> {
  const { data, error } = await (getSupabaseClient() as any)
    .from('moderation_flags')
    .select('*')
    .eq('resolved', false)
    .order('severity', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching unresolved flags:', error);
    throw error;
  }

  return data || [];
}

/**
 * Calculate user risk score
 */
export async function calculateUserRiskScore(userId: string): Promise<number> {
  // Get user's recent messages
  const { data: messages, error: messagesError } = await (getSupabaseClient() as any)
    .from('chat_messages')
    .select('id, session_id')
    .eq('role', 'user')
    .limit(100);

  if (messagesError) {
    console.error('Error fetching user messages:', messagesError);
    return 0;
  }

  // Get flags for user's messages
  const messageIds = (messages as any[])?.map((m) => m.id) || [];
  if (messageIds.length === 0) return 0;

  const { data: flags, error: flagsError } = await (getSupabaseClient() as any)
    .from('moderation_flags')
    .select('severity')
    .in('message_id', messageIds);

  if (flagsError) {
    console.error('Error fetching flags:', flagsError);
    return 0;
  }

  // Calculate risk score
  let riskScore = 0;
  (flags || []).forEach((flag: any) => {
    if (flag.severity === 'high') riskScore += 30;
    else if (flag.severity === 'medium') riskScore += 15;
    else riskScore += 5;
  });

  // Normalize to 0-100
  return Math.min(100, riskScore);
}

/**
 * Check if user should be rate limited
 */
export async function shouldRateLimit(userId: string): Promise<boolean> {
  const riskScore = await calculateUserRiskScore(userId);

  // Rate limit if risk score is high
  if (riskScore > 70) return true;

  // Check message frequency
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await (getSupabaseClient() as any)
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Error checking message frequency:', error);
    return false;
  }

  // Rate limit if more than 50 messages in last hour
  return (count || 0) > 50;
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(): Promise<{
  totalFlags: number;
  unresolvedFlags: number;
  flagsByType: Record<string, number>;
  flagsBySeverity: Record<string, number>;
}> {
  const { data, error } = await (getSupabaseClient() as any)
    .from('moderation_flags')
    .select('flag_type, severity, resolved');

  if (error) {
    console.error('Error fetching moderation stats:', error);
    throw error;
  }

  const flags = (data as any[]) || [];
  const unresolvedFlags = flags.filter((f) => !f.resolved).length;

  // Count by type
  const flagsByType: Record<string, number> = {};
  flags.forEach((f) => {
    flagsByType[f.flag_type] = (flagsByType[f.flag_type] || 0) + 1;
  });

  // Count by severity
  const flagsBySeverity: Record<string, number> = {};
  flags.forEach((f) => {
    flagsBySeverity[f.severity] = (flagsBySeverity[f.severity] || 0) + 1;
  });

  return {
    totalFlags: flags.length,
    unresolvedFlags,
    flagsByType,
    flagsBySeverity,
  };
}

/**
 * Detect abuse patterns
 */
export function detectAbusePattern(
  messageCount: number,
  flagCount: number,
  timeWindowMinutes: number = 60
): boolean {
  // If more than 30% of messages are flagged, it's likely abuse
  if (messageCount > 0 && flagCount / messageCount > 0.3) {
    return true;
  }

  // If more than 10 flags in 1 hour, it's likely abuse
  if (timeWindowMinutes === 60 && flagCount > 10) {
    return true;
  }

  return false;
}

