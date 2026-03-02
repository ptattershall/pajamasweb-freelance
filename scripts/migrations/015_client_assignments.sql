-- Client assignments: tie clients to SALES/DEV contractors. One active assignment per client per role_type.
-- Run after 014_profiles_roles_sales_dev_invitation_role.sql

CREATE TABLE IF NOT EXISTS public.client_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('SALES', 'DEV')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ENDED')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- At most one ACTIVE assignment per (client_id, role_type)
CREATE UNIQUE INDEX idx_client_assignments_one_active_per_client_role
  ON public.client_assignments (client_id, role_type)
  WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_client_assignments_client_id ON public.client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_assigned_user_id ON public.client_assignments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_status ON public.client_assignments(status);
CREATE INDEX IF NOT EXISTS idx_client_assignments_role_type ON public.client_assignments(role_type);

ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;

-- OWNER: full access
CREATE POLICY "Owner can select all client_assignments"
  ON public.client_assignments FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER');

CREATE POLICY "Owner can insert client_assignments"
  ON public.client_assignments FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER');

CREATE POLICY "Owner can update client_assignments"
  ON public.client_assignments FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER')
  WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER');

CREATE POLICY "Owner can delete client_assignments"
  ON public.client_assignments FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER');

-- SALES: select only own ACTIVE SALES assignments
CREATE POLICY "Sales can select own active assignments"
  ON public.client_assignments FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'SALES'
    AND assigned_user_id = auth.uid()
    AND role_type = 'SALES'
    AND status = 'ACTIVE'
  );

-- DEV: select only own ACTIVE DEV assignments
CREATE POLICY "Dev can select own active assignments"
  ON public.client_assignments FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'DEV'
    AND assigned_user_id = auth.uid()
    AND role_type = 'DEV'
    AND status = 'ACTIVE'
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_client_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_assignments_updated_at_trigger
  BEFORE UPDATE ON public.client_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_assignments_updated_at();
