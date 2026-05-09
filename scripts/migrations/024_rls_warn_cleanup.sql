-- 024: Final WARN cleanup (multiple permissive + initplan)
--
-- Targets remaining WARNs:
-- - multiple_permissive_policies on bookings/services/rotation_members
-- - auth_rls_initplan on a small set of legacy policies

BEGIN;

-- ---------------------------------------------------------------------------
-- bookings: remove duplicate SELECT policy (multiple permissive)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "users_read_own_bookings" ON public.bookings;

-- ---------------------------------------------------------------------------
-- services: remove duplicate authenticated SELECT policies (multiple permissive)
-- Keep: anon can read active services; authenticated can read active OR admin can read all
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "services_authenticated_read_all" ON public.services;
DROP POLICY IF EXISTS "services_public_read_active" ON public.services;

CREATE POLICY "services_anon_read_active"
  ON public.services
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "services_authenticated_read"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR (((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text)
  );

-- ---------------------------------------------------------------------------
-- rotation_members: replace ALL policy with explicit modify + consolidated SELECT
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Owner can manage rotation_members" ON public.rotation_members;
DROP POLICY IF EXISTS "Members can select own rotation_members" ON public.rotation_members;

CREATE POLICY "rotation_members_authenticated_select"
  ON public.rotation_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

CREATE POLICY "rotation_members_owner_insert"
  ON public.rotation_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

CREATE POLICY "rotation_members_owner_update"
  ON public.rotation_members
  FOR UPDATE
  TO authenticated
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  )
  WITH CHECK (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

CREATE POLICY "rotation_members_owner_delete"
  ON public.rotation_members
  FOR DELETE
  TO authenticated
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- ---------------------------------------------------------------------------
-- Initplan fixes: client_assignments owner policies
-- ---------------------------------------------------------------------------

ALTER POLICY "Owner can insert client_assignments"
  ON public.client_assignments
  WITH CHECK (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

ALTER POLICY "Owner can update client_assignments"
  ON public.client_assignments
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  )
  WITH CHECK (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

ALTER POLICY "Owner can delete client_assignments"
  ON public.client_assignments
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- ---------------------------------------------------------------------------
-- Initplan fixes: invitations owner policies
-- ---------------------------------------------------------------------------

ALTER POLICY "Owner can create invitations"
  ON public.invitations
  WITH CHECK (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

ALTER POLICY "Owner can view all invitations"
  ON public.invitations
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- ---------------------------------------------------------------------------
-- Initplan fixes: milestone_updates + milestone_notifications update
-- ---------------------------------------------------------------------------

ALTER POLICY "Clients can view own milestone updates"
  ON public.milestone_updates
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_milestones pm
      WHERE pm.id = milestone_updates.milestone_id
        AND pm.client_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "Clients can update own notifications"
  ON public.milestone_notifications
  USING (client_id = (SELECT auth.uid()))
  WITH CHECK (client_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- Initplan fixes: rotation_state owner policy
-- ---------------------------------------------------------------------------

ALTER POLICY "Owner can manage rotation_state"
  ON public.rotation_state
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  )
  WITH CHECK (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

COMMIT;

