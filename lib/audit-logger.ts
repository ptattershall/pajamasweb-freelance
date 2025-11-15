/**
 * Audit Logger
 * 
 * Comprehensive audit trail logging for compliance and security
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failure' | 'warning';
  created_at: string;
}

/**
 * Log an audit event
 */
export async function logAudit(
  action: string,
  resourceType: string,
  options?: {
    userId?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failure' | 'warning';
  }
): Promise<AuditLogEntry> {
  const { data, error } = await supabase
    .from('audit_log')
    .insert({
      action,
      resource_type: resourceType,
      user_id: options?.userId,
      resource_id: options?.resourceId,
      details: options?.details,
      ip_address: options?.ipAddress,
      user_agent: options?.userAgent,
      status: options?.status || 'success',
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging audit event:', error);
    throw error;
  }

  return data;
}

/**
 * Log chat message
 */
export async function logChatMessage(
  userId: string,
  sessionId: string,
  messageId: string,
  role: 'user' | 'assistant',
  confidence?: number
): Promise<AuditLogEntry> {
  return logAudit('chat_message', 'chat_message', {
    userId,
    resourceId: messageId,
    details: {
      sessionId,
      role,
      confidence,
    },
  });
}

/**
 * Log escalation
 */
export async function logEscalation(
  userId: string,
  escalationId: string,
  reason: string,
  severity: string
): Promise<AuditLogEntry> {
  return logAudit('escalation_created', 'escalation', {
    userId,
    resourceId: escalationId,
    details: {
      reason,
      severity,
    },
  });
}

/**
 * Log moderation action
 */
export async function logModerationAction(
  userId: string,
  flagId: string,
  action: string,
  details?: Record<string, any>
): Promise<AuditLogEntry> {
  return logAudit('moderation_action', 'moderation_flag', {
    userId,
    resourceId: flagId,
    details: {
      action,
      ...details,
    },
  });
}

/**
 * Log content filter action
 */
export async function logContentFilter(
  userId: string,
  messageId: string,
  filterType: string,
  details?: Record<string, any>
): Promise<AuditLogEntry> {
  return logAudit('content_filtered', 'chat_message', {
    userId,
    resourceId: messageId,
    details: {
      filterType,
      ...details,
    },
    status: 'warning',
  });
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user audit logs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string
): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching resource audit logs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get audit logs by action
 */
export async function getAuditLogsByAction(
  action: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('action', action)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get audit statistics
 */
export async function getAuditStats(
  hoursBack: number = 24
): Promise<{
  totalEvents: number;
  successCount: number;
  failureCount: number;
  warningCount: number;
  eventsByAction: Record<string, number>;
}> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('audit_log')
    .select('action, status')
    .gte('created_at', since);

  if (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }

  const logs = data || [];
  const successCount = logs.filter((l) => l.status === 'success').length;
  const failureCount = logs.filter((l) => l.status === 'failure').length;
  const warningCount = logs.filter((l) => l.status === 'warning').length;

  // Count by action
  const eventsByAction: Record<string, number> = {};
  logs.forEach((l) => {
    eventsByAction[l.action] = (eventsByAction[l.action] || 0) + 1;
  });

  return {
    totalEvents: logs.length,
    successCount,
    failureCount,
    warningCount,
    eventsByAction,
  };
}

/**
 * Export audit logs for compliance
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date
): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }

  return data || [];
}

