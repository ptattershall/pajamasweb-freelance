-- Phase 6: Safety & Guardrails - Database Schema
-- Tables for escalations, audit logging, and moderation

-- Escalations table
CREATE TABLE IF NOT EXISTS public.escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT CHECK (status IN ('success', 'failure', 'warning')) DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Moderation flags table
CREATE TABLE IF NOT EXISTS public.moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escalations
CREATE POLICY "Users can view their own escalations"
  ON public.escalations FOR SELECT
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Admins can view all escalations"
  ON public.escalations FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for audit_log (read-only for users)
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for moderation_flags
CREATE POLICY "Users can view flags on their messages"
  ON public.moderation_flags FOR SELECT
  USING (session_id IN (
    SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_escalations_session_id ON public.escalations(session_id);
CREATE INDEX idx_escalations_user_id ON public.escalations(user_id);
CREATE INDEX idx_escalations_status ON public.escalations(status);
CREATE INDEX idx_escalations_created_at ON public.escalations(created_at DESC);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

CREATE INDEX idx_moderation_flags_message_id ON public.moderation_flags(message_id);
CREATE INDEX idx_moderation_flags_session_id ON public.moderation_flags(session_id);
CREATE INDEX idx_moderation_flags_flag_type ON public.moderation_flags(flag_type);
CREATE INDEX idx_moderation_flags_resolved ON public.moderation_flags(resolved);

