-- 023: RLS policy consolidation + initplan fixes
--
-- Goals:
-- - Reduce "multiple permissive policies" warnings by consolidating overlapping policies
-- - Fix remaining "auth_rls_initplan" warnings by using (select auth.*()) patterns
-- - Keep behavior consistent with existing role model (profiles.role)
--
-- Notes:
-- - This migration focuses on the core lint offenders: bookings, client_assignments,
--   contracts, deliverables, invoices, milestone_notifications, profiles,
--   project_milestones, subscriptions, services.
-- - We intentionally do NOT remove INFO-only "unused_index" lints here.

BEGIN;

-- ---------------------------------------------------------------------------
-- Helpers (inline expressions)
-- ---------------------------------------------------------------------------
-- uid := (select auth.uid())
-- role := (select p.role from public.profiles p where p.user_id = uid)

-- ---------------------------------------------------------------------------
-- bookings: consolidate authenticated SELECT/INSERT/UPDATE policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Dev can select own assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sales can select own assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner can view all bookings" ON public.bookings;

CREATE POLICY "bookings_authenticated_select"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR assigned_user_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = ANY (ARRAY['OWNER','MANAGER'])
    OR (
      (
        SELECT p.role
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
      ) = 'DEV'
      AND assigned_user_id = (SELECT auth.uid())
    )
    OR (
      (
        SELECT p.role
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
      ) = 'SALES'
      AND assigned_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Dev can insert own assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sales can insert own assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_create_own_bookings" ON public.bookings;

CREATE POLICY "bookings_authenticated_insert"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Client can create their own booking
    client_id = (SELECT auth.uid())
    OR (
      -- Dev/Sales can create bookings assigned to themselves
      (
        SELECT p.role
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
      ) = ANY (ARRAY['DEV','SALES','OWNER','MANAGER'])
      AND assigned_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Dev can update own assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sales can update own assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_update_own_bookings" ON public.bookings;

CREATE POLICY "bookings_authenticated_update"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR (
      (
        SELECT p.role
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
      ) = ANY (ARRAY['OWNER','MANAGER'])
    )
    OR (
      (
        SELECT p.role
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
      ) = ANY (ARRAY['DEV','SALES'])
      AND assigned_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    client_id = (SELECT auth.uid())
    OR (
      (
        SELECT p.role
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
      ) = ANY (ARRAY['OWNER','MANAGER'])
    )
    OR (
      (
        SELECT p.role
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
      ) = ANY (ARRAY['DEV','SALES'])
      AND assigned_user_id = (SELECT auth.uid())
    )
  );

-- Keep DELETE policy (users_delete_own_bookings) as-is; it is already initplan-safe.

-- ---------------------------------------------------------------------------
-- client_assignments: consolidate authenticated SELECT policies + initplan tweaks
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Dev can select own active assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Sales can select own active assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Owner can select all client_assignments" ON public.client_assignments;

CREATE POLICY "client_assignments_authenticated_select"
  ON public.client_assignments
  FOR SELECT
  TO authenticated
  USING (
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
    OR (
      assigned_user_id = (SELECT auth.uid())
      AND status = 'ACTIVE'
      AND (
        (
          (
            SELECT p.role
            FROM public.profiles p
            WHERE p.user_id = (SELECT auth.uid())
          ) = 'DEV'
          AND role_type = 'DEV'
        )
        OR (
          (
            SELECT p.role
            FROM public.profiles p
            WHERE p.user_id = (SELECT auth.uid())
          ) = 'SALES'
          AND role_type = 'SALES'
        )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- contracts/deliverables/invoices/project_milestones/profiles:
-- consolidate dual SELECT policies into one each + initplan friendly auth.uid()
-- ---------------------------------------------------------------------------

-- contracts
DROP POLICY IF EXISTS "Clients can view own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Owner can view all contracts" ON public.contracts;

CREATE POLICY "contracts_authenticated_select"
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- deliverables
DROP POLICY IF EXISTS "Clients can view own deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Owner can view all deliverables" ON public.deliverables;

CREATE POLICY "deliverables_authenticated_select"
  ON public.deliverables
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- invoices
DROP POLICY IF EXISTS "Clients can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Owner can view all invoices" ON public.invoices;

CREATE POLICY "invoices_authenticated_select"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- project_milestones
DROP POLICY IF EXISTS "Clients can view own milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Owner can view all milestones" ON public.project_milestones;

CREATE POLICY "project_milestones_authenticated_select"
  ON public.project_milestones
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- profiles
DROP POLICY IF EXISTS "Owner can view all profiles" ON public.profiles;
-- Keep "Users can view own profile" in place; add a new consolidated owner+user select policy instead.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "profiles_authenticated_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (
      SELECT p2.role
      FROM public.profiles p2
      WHERE p2.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- ---------------------------------------------------------------------------
-- milestone_notifications: consolidate SELECT policies (keep UPDATE policy)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Clients can view own notifications" ON public.milestone_notifications;
DROP POLICY IF EXISTS "Owner can view all notifications" ON public.milestone_notifications;

CREATE POLICY "milestone_notifications_authenticated_select"
  ON public.milestone_notifications
  FOR SELECT
  TO authenticated
  USING (
    client_id = (SELECT auth.uid())
    OR (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
    ) = 'OWNER'
  );

-- ---------------------------------------------------------------------------
-- subscriptions: eliminate multiple-permissive warnings by using real db role
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

CREATE POLICY "subscriptions_service_role_all"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "subscriptions_authenticated_select"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (client_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- services: initplan fix for auth.jwt() usage + reduce duplicate SELECT where possible
-- ---------------------------------------------------------------------------

-- Make auth.jwt() initplan-friendly
ALTER POLICY "services_authenticated_read_all"
  ON public.services
  USING (((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text);

ALTER POLICY "services_admin_write"
  ON public.services
  WITH CHECK (((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text);

ALTER POLICY "services_admin_update"
  ON public.services
  USING (((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text);

COMMIT;

