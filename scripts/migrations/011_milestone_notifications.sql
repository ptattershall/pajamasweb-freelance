-- Client Portal Phase 6: Milestone Notifications
-- Run this SQL in your Supabase SQL Editor

-- Create milestone_notifications table
CREATE TABLE IF NOT EXISTS public.milestone_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('status_change', 'progress_update', 'due_soon', 'overdue')) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.milestone_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Clients can view own notifications"
  ON public.milestone_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Owner can view all notifications"
  ON public.milestone_notifications FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

CREATE POLICY "Clients can update own notifications"
  ON public.milestone_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON public.milestone_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_milestone_id ON public.milestone_notifications(milestone_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.milestone_notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.milestone_notifications(created_at);

