-- Rotation: round-robin assignment of new clients to SALES/DEV.
-- Run after 015_client_assignments.sql

CREATE TABLE IF NOT EXISTS public.rotation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('SALES', 'DEV')),
  position INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role_type)
);

CREATE INDEX IF NOT EXISTS idx_rotation_members_role_type ON public.rotation_members(role_type);
CREATE INDEX IF NOT EXISTS idx_rotation_members_active ON public.rotation_members(active);

CREATE TABLE IF NOT EXISTS public.rotation_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type TEXT NOT NULL UNIQUE CHECK (role_type IN ('SALES', 'DEV')),
  last_assigned_member_id UUID REFERENCES public.rotation_members(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed one row per role_type for state
INSERT INTO public.rotation_state (role_type)
VALUES ('SALES'), ('DEV')
ON CONFLICT (role_type) DO NOTHING;

ALTER TABLE public.rotation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotation_state ENABLE ROW LEVEL SECURITY;

-- Only OWNER can manage rotation
CREATE POLICY "Owner can manage rotation_members"
  ON public.rotation_members FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER')
  WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER');

CREATE POLICY "Owner can manage rotation_state"
  ON public.rotation_state FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER')
  WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER');

-- Contractors can read their own membership (optional)
CREATE POLICY "Members can select own rotation_members"
  ON public.rotation_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION update_rotation_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rotation_members_updated_at_trigger
  BEFORE UPDATE ON public.rotation_members
  FOR EACH ROW
  EXECUTE FUNCTION update_rotation_members_updated_at();
