-- 020: Multi-role RBAC + RLS blueprint
--
-- Purpose
-- - Add MANAGER and DESIGNER roles.
-- - Introduce user_roles for side roles (many-to-many).
-- - Add helper authorization functions for reusable RLS logic.
-- - Apply first-pass RLS policies for:
--   profiles, invoices, payments, subscriptions, project_milestones.
--
-- Notes
-- - This migration preserves compatibility with existing profiles.role by backfilling
--   user_roles and using profile fallback inside helper functions.
-- - Review in staging first; this rewrites policies on key tables.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Expand role constraints for existing tables
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('OWNER', 'CLIENT', 'SALES', 'DEV', 'DESIGNER', 'MANAGER'));

ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_role_check;

ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_role_check
  CHECK (role IN ('CLIENT', 'SALES', 'DEV', 'DESIGNER', 'MANAGER'));

ALTER TABLE public.client_assignments
  DROP CONSTRAINT IF EXISTS client_assignments_role_type_check;

ALTER TABLE public.client_assignments
  ADD CONSTRAINT client_assignments_role_type_check
  CHECK (role_type IN ('SALES', 'DEV', 'DESIGNER'));

-- ---------------------------------------------------------------------------
-- 2) Side-role table: user_roles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'CLIENT', 'SALES', 'DEV', 'DESIGNER', 'MANAGER')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Backfill from profiles.role so existing users retain access.
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, p.role
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner and manager can manage user_roles" ON public.user_roles;
CREATE POLICY "Owner and manager can manage user_roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('OWNER', 'MANAGER')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('OWNER', 'MANAGER')
    )
  );

DROP POLICY IF EXISTS "Users can view own user_roles" ON public.user_roles;
CREATE POLICY "Users can view own user_roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3) Helper functions for RBAC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = ANY(_roles)
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_to_client(_user_id UUID, _client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.client_assignments ca
    WHERE ca.assigned_user_id = _user_id
      AND ca.client_id = _client_id
      AND ca.status = 'ACTIVE'
      AND ca.role_type IN ('SALES', 'DEV', 'DESIGNER')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_client(_user_id UUID, _client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Global operators
    public.has_any_role(_user_id, ARRAY['OWNER', 'MANAGER'])
    -- Client can access their own records
    OR _user_id = _client_id
    -- Assigned team members can access assigned client records
    OR public.is_assigned_to_client(_user_id, _client_id);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_billing(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(_user_id, ARRAY['OWNER', 'MANAGER', 'SALES']);
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_to_client(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_client(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_billing(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4) profiles policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER'])
    OR public.is_assigned_to_client(auth.uid(), user_id)
  );

CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER'])
  );

CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER'])
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER'])
  );

CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER']));

-- ---------------------------------------------------------------------------
-- 5) invoices policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invoices'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.invoices', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "invoices_select_policy"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (public.can_access_client(auth.uid(), client_id));

CREATE POLICY "invoices_insert_policy"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_billing(auth.uid())
    AND public.can_access_client(auth.uid(), client_id)
  );

CREATE POLICY "invoices_update_policy"
  ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (
    public.can_manage_billing(auth.uid())
    AND public.can_access_client(auth.uid(), client_id)
  )
  WITH CHECK (
    public.can_manage_billing(auth.uid())
    AND public.can_access_client(auth.uid(), client_id)
  );

CREATE POLICY "invoices_delete_policy"
  ON public.invoices
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER']));

-- ---------------------------------------------------------------------------
-- 6) payments policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.payments', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "payments_select_policy"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    client_id IS NULL
    AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
    OR (client_id IS NOT NULL AND public.can_access_client(auth.uid(), client_id))
  );

CREATE POLICY "payments_insert_policy"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_billing(auth.uid())
    AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
  );

CREATE POLICY "payments_update_policy"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    public.can_manage_billing(auth.uid())
    AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
  )
  WITH CHECK (
    public.can_manage_billing(auth.uid())
    AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
  );

CREATE POLICY "payments_delete_policy"
  ON public.payments
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER']));

-- ---------------------------------------------------------------------------
-- 7) subscriptions policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscriptions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscriptions', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "subscriptions_select_policy"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (
    (client_id IS NULL AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES']))
    OR (client_id IS NOT NULL AND public.can_access_client(auth.uid(), client_id))
  );

CREATE POLICY "subscriptions_insert_policy"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_billing(auth.uid())
    AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
  );

CREATE POLICY "subscriptions_update_policy"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    public.can_manage_billing(auth.uid())
    AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
  )
  WITH CHECK (
    public.can_manage_billing(auth.uid())
    AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
  );

CREATE POLICY "subscriptions_delete_policy"
  ON public.subscriptions
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER']));

-- ---------------------------------------------------------------------------
-- 8) project_milestones policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'project_milestones'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_milestones', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "project_milestones_select_policy"
  ON public.project_milestones
  FOR SELECT
  TO authenticated
  USING (public.can_access_client(auth.uid(), client_id));

CREATE POLICY "project_milestones_insert_policy"
  ON public.project_milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_client(auth.uid(), client_id)
    AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES', 'DEV', 'DESIGNER'])
  );

CREATE POLICY "project_milestones_update_policy"
  ON public.project_milestones
  FOR UPDATE
  TO authenticated
  USING (
    public.can_access_client(auth.uid(), client_id)
    AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES', 'DEV', 'DESIGNER'])
  )
  WITH CHECK (
    public.can_access_client(auth.uid(), client_id)
    AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES', 'DEV', 'DESIGNER'])
  );

CREATE POLICY "project_milestones_delete_policy"
  ON public.project_milestones
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

COMMIT;

