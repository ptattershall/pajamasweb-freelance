/**
 * Escalation Service
 * 
 * Handles escalation logic, human handoff, and priority routing
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Escalation {
  id: string;
  session_id: string;
  user_id: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface EscalationTrigger {
  type: string;
  confidence: number;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Determine if escalation is needed
 */
export function shouldEscalate(
  confidence: number,
  issues: string[],
  userFrustration: number = 0
): EscalationTrigger | null {
  // Trigger 1: Very low confidence
  if (confidence < 40) {
    return {
      type: 'low_confidence',
      confidence,
      reason: 'Response confidence below threshold',
      severity: 'high',
    };
  }

  // Trigger 2: Multiple issues
  if (issues.length >= 3) {
    return {
      type: 'multiple_issues',
      confidence,
      reason: `Multiple safety issues detected: ${issues.join(', ')}`,
      severity: 'medium',
    };
  }

  // Trigger 3: User frustration
  if (userFrustration > 0.7) {
    return {
      type: 'user_frustration',
      confidence: userFrustration,
      reason: 'High user frustration detected',
      severity: 'high',
    };
  }

  // Trigger 4: Sensitive topic with low confidence
  if (issues.includes('Response contains sensitive topics') && confidence < 75) {
    return {
      type: 'sensitive_topic',
      confidence,
      reason: 'Sensitive topic with insufficient confidence',
      severity: 'critical',
    };
  }

  return null;
}

/**
 * Create an escalation
 */
export async function createEscalation(
  sessionId: string,
  userId: string,
  reason: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  notes?: string
): Promise<Escalation> {
  const { data, error } = await supabase
    .from('escalations')
    .insert({
      session_id: sessionId,
      user_id: userId,
      reason,
      severity,
      notes,
      status: 'open',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating escalation:', error);
    throw error;
  }

  return data;
}

/**
 * Get escalations for a session
 */
export async function getSessionEscalations(
  sessionId: string
): Promise<Escalation[]> {
  const { data, error } = await supabase
    .from('escalations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching escalations:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get open escalations for a user
 */
export async function getUserOpenEscalations(userId: string): Promise<Escalation[]> {
  const { data, error } = await supabase
    .from('escalations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open')
    .order('severity', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching user escalations:', error);
    throw error;
  }

  return data || [];
}

/**
 * Update escalation status
 */
export async function updateEscalationStatus(
  escalationId: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
  notes?: string
): Promise<Escalation> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (notes) {
    updateData.notes = notes;
  }

  if (status === 'resolved' || status === 'closed') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('escalations')
    .update(updateData)
    .eq('id', escalationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating escalation:', error);
    throw error;
  }

  return data;
}

/**
 * Assign escalation to a team member
 */
export async function assignEscalation(
  escalationId: string,
  assignedToUserId: string
): Promise<Escalation> {
  const { data, error } = await supabase
    .from('escalations')
    .update({
      assigned_to: assignedToUserId,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', escalationId)
    .select()
    .single();

  if (error) {
    console.error('Error assigning escalation:', error);
    throw error;
  }

  return data;
}

/**
 * Get escalation statistics
 */
export async function getEscalationStats(): Promise<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  avgResolutionTime: number;
}> {
  const { data, error } = await supabase
    .from('escalations')
    .select('status, created_at, resolved_at');

  if (error) {
    console.error('Error fetching escalation stats:', error);
    throw error;
  }

  const escalations = data || [];
  const open = escalations.filter((e) => e.status === 'open').length;
  const inProgress = escalations.filter((e) => e.status === 'in_progress').length;
  const resolved = escalations.filter((e) => e.status === 'resolved').length;

  // Calculate average resolution time
  const resolvedEscalations = escalations.filter(
    (e) => e.resolved_at && e.created_at
  );
  const avgResolutionTime =
    resolvedEscalations.length > 0
      ? resolvedEscalations.reduce((sum, e) => {
          const created = new Date(e.created_at).getTime();
          const resolved = new Date(e.resolved_at).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedEscalations.length
      : 0;

  return {
    total: escalations.length,
    open,
    inProgress,
    resolved,
    avgResolutionTime: Math.round(avgResolutionTime / 1000 / 60), // Convert to minutes
  };
}

