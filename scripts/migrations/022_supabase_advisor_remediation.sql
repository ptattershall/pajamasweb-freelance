-- 022: Supabase advisor remediation (security + performance)
-- Targets:
-- - function_search_path_mutable
-- - permissive invitation update policy
-- - exposed security definer RPC execution
-- - broad anon select grants causing GraphQL public exposure
-- - unindexed foreign keys
-- - RLS initplan warnings on key policies

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Harden trigger functions: fixed search_path
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_invoices_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_contracts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_deliverables_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_milestones_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_client_assignments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_rotation_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2) Lock down security definer event trigger helper
-- ---------------------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- ---------------------------------------------------------------------------
-- 3) Replace permissive invitation UPDATE policy
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can accept invitation with valid token" ON public.invitations;
DROP POLICY IF EXISTS "Owner can update invitations" ON public.invitations;

CREATE POLICY "invitations_update_policy"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) IN ('OWNER', 'MANAGER')
    OR (
      token IS NOT NULL
      AND status = 'PENDING'
      AND accepted_by IS NULL
      AND accepted_at IS NULL
    )
  )
  WITH CHECK (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) IN ('OWNER', 'MANAGER')
    OR (
      token IS NOT NULL
      AND status = 'ACCEPTED'
      AND accepted_by = (SELECT auth.uid())
      AND accepted_at IS NOT NULL
    )
  );

-- ---------------------------------------------------------------------------
-- 4) Reduce GraphQL public exposure by removing anon SELECT grants
-- ---------------------------------------------------------------------------

REVOKE SELECT ON TABLE public.booking_history FROM anon;
REVOKE SELECT ON TABLE public.bookings FROM anon;
REVOKE SELECT ON TABLE public.client_assignments FROM anon;
REVOKE SELECT ON TABLE public.contracts FROM anon;
REVOKE SELECT ON TABLE public.deliverables FROM anon;
REVOKE SELECT ON TABLE public.invitations FROM anon;
REVOKE SELECT ON TABLE public.invoices FROM anon;
REVOKE SELECT ON TABLE public.milestone_notifications FROM anon;
REVOKE SELECT ON TABLE public.milestone_updates FROM anon;
REVOKE SELECT ON TABLE public.profiles FROM anon;
REVOKE SELECT ON TABLE public.project_milestones FROM anon;
REVOKE SELECT ON TABLE public.rotation_members FROM anon;
REVOKE SELECT ON TABLE public.rotation_state FROM anon;
REVOKE SELECT ON TABLE public.subscriptions FROM anon;

-- ---------------------------------------------------------------------------
-- 5) Performance: add missing FK indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_invitations_accepted_by
  ON public.invitations (accepted_by);

CREATE INDEX IF NOT EXISTS idx_rotation_state_last_assigned_member_id
  ON public.rotation_state (last_assigned_member_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_related_service
  ON public.subscriptions (related_service);

-- ---------------------------------------------------------------------------
-- 6) Performance: initplan-friendly auth.uid() in key policies
-- ---------------------------------------------------------------------------

ALTER POLICY "users_read_own_booking_history"
  ON public.booking_history
  USING (
    booking_id IN (
      SELECT b.id
      FROM public.bookings b
      WHERE (
        b.client_id = (SELECT auth.uid())
        OR (
          SELECT p.role
          FROM public.profiles p
          WHERE p.user_id = (SELECT auth.uid())
        ) IN ('OWNER', 'MANAGER')
      )
    )
  );

ALTER POLICY "Users can view own profile"
  ON public.profiles
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY "Users can update own profile"
  ON public.profiles
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY "Clients can view own bookings"
  ON public.bookings
  USING (client_id = (SELECT auth.uid()));

ALTER POLICY "users_create_own_bookings"
  ON public.bookings
  WITH CHECK (client_id = (SELECT auth.uid()));

ALTER POLICY "users_read_own_bookings"
  ON public.bookings
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) IN ('OWNER', 'MANAGER')
  );

ALTER POLICY "users_delete_own_bookings"
  ON public.bookings
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) IN ('OWNER', 'MANAGER')
  );

ALTER POLICY "users_update_own_bookings"
  ON public.bookings
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) IN ('OWNER', 'MANAGER')
  )
  WITH CHECK (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) IN ('OWNER', 'MANAGER')
  );

COMMIT;
