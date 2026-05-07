-- 021: RBAC helper-pattern extension for core tables
--
-- Extends the 020 helper-function RLS model to:
-- - contracts
-- - deliverables
-- - bookings
-- - milestone_updates
-- - milestone_notifications
-- - contact_messages
--
-- Requires: 020_rbac_multi_role_rls_blueprint.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- contracts
-- ---------------------------------------------------------------------------

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contracts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contracts', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "contracts_select_policy"
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (public.can_access_client(auth.uid(), client_id));

CREATE POLICY "contracts_insert_policy"
  ON public.contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_client(auth.uid(), client_id)
    AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES', 'DEV', 'DESIGNER'])
  );

CREATE POLICY "contracts_update_policy"
  ON public.contracts
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

CREATE POLICY "contracts_delete_policy"
  ON public.contracts
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

-- ---------------------------------------------------------------------------
-- deliverables
-- ---------------------------------------------------------------------------

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'deliverables'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.deliverables', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "deliverables_select_policy"
  ON public.deliverables
  FOR SELECT
  TO authenticated
  USING (public.can_access_client(auth.uid(), client_id));

CREATE POLICY "deliverables_insert_policy"
  ON public.deliverables
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_client(auth.uid(), client_id)
    AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES', 'DEV', 'DESIGNER'])
  );

CREATE POLICY "deliverables_update_policy"
  ON public.deliverables
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

CREATE POLICY "deliverables_delete_policy"
  ON public.deliverables
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.bookings', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "bookings_select_policy"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    (
      client_id IS NOT NULL
      AND public.can_access_client(auth.uid(), client_id)
    )
    OR (
      client_id IS NULL
      AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
    )
    OR created_by = auth.uid()
    OR assigned_user_id = auth.uid()
  );

CREATE POLICY "bookings_insert_policy"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
    AND (
      client_id IS NULL
      OR public.can_access_client(auth.uid(), client_id)
    )
  );

CREATE POLICY "bookings_update_policy"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    (
      public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
      AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
    )
    OR (
      public.has_any_role(auth.uid(), ARRAY['DEV', 'DESIGNER'])
      AND assigned_user_id = auth.uid()
    )
  )
  WITH CHECK (
    (
      public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
      AND (client_id IS NULL OR public.can_access_client(auth.uid(), client_id))
    )
    OR (
      public.has_any_role(auth.uid(), ARRAY['DEV', 'DESIGNER'])
      AND assigned_user_id = auth.uid()
    )
  );

CREATE POLICY "bookings_delete_policy"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

-- ---------------------------------------------------------------------------
-- milestone_updates
-- ---------------------------------------------------------------------------

ALTER TABLE public.milestone_updates ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'milestone_updates'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.milestone_updates', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "milestone_updates_select_policy"
  ON public.milestone_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_milestones pm
      WHERE pm.id = milestone_updates.milestone_id
        AND public.can_access_client(auth.uid(), pm.client_id)
    )
  );

CREATE POLICY "milestone_updates_insert_policy"
  ON public.milestone_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.project_milestones pm
      WHERE pm.id = milestone_updates.milestone_id
        AND public.can_access_client(auth.uid(), pm.client_id)
        AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES', 'DEV', 'DESIGNER'])
    )
  );

CREATE POLICY "milestone_updates_update_policy"
  ON public.milestone_updates
  FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

CREATE POLICY "milestone_updates_delete_policy"
  ON public.milestone_updates
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

-- ---------------------------------------------------------------------------
-- milestone_notifications
-- ---------------------------------------------------------------------------

ALTER TABLE public.milestone_notifications ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'milestone_notifications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.milestone_notifications', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "milestone_notifications_select_policy"
  ON public.milestone_notifications
  FOR SELECT
  TO authenticated
  USING (public.can_access_client(auth.uid(), client_id));

CREATE POLICY "milestone_notifications_insert_policy"
  ON public.milestone_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_client(auth.uid(), client_id)
    AND public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES', 'DEV', 'DESIGNER'])
  );

CREATE POLICY "milestone_notifications_update_policy"
  ON public.milestone_notifications
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id
    OR public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
  )
  WITH CHECK (
    auth.uid() = client_id
    OR public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
  );

CREATE POLICY "milestone_notifications_delete_policy"
  ON public.milestone_notifications
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _p RECORD;
BEGIN
  FOR _p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contact_messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contact_messages', _p.policyname);
  END LOOP;
END $$;

CREATE POLICY "contact_messages_insert_policy"
  ON public.contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "contact_messages_select_policy"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES'])
    OR user_id = auth.uid()
    OR related_client_id = auth.uid()
  );

CREATE POLICY "contact_messages_update_policy"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES']))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER', 'SALES']));

CREATE POLICY "contact_messages_delete_policy"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['OWNER', 'MANAGER']));

COMMIT;

