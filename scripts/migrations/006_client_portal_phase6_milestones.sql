-- Client Portal Phase 6: Project Milestones & Status
-- Run this SQL in your Supabase SQL Editor

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')) DEFAULT 'pending',
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create milestone_updates table for tracking changes
CREATE TABLE IF NOT EXISTS public.milestone_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for milestones
CREATE POLICY "Clients can view own milestones"
  ON public.project_milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Owner can view all milestones"
  ON public.project_milestones FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- RLS Policies for milestone_updates
CREATE POLICY "Clients can view own milestone updates"
  ON public.milestone_updates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_milestones
      WHERE id = milestone_id AND client_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_milestones_client_id ON public.project_milestones(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON public.project_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_milestone_updates_milestone_id ON public.milestone_updates(milestone_id);

-- Create triggers
CREATE OR REPLACE FUNCTION update_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestones_updated_at_trigger
BEFORE UPDATE ON public.project_milestones
FOR EACH ROW
EXECUTE FUNCTION update_milestones_updated_at();

