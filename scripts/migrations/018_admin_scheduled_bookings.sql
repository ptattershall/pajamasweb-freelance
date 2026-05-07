-- 018: Admin-scheduled meetings (Phase 2 of Cal.com retirement)
--
-- Purpose:
-- - Allow OWNER (admin) to schedule meetings on behalf of clients OR for prospects
--   that do not yet have an auth.users record (so client_id must be nullable).
-- - Track which admin created each booking via created_by.
-- - Permit a 'manual' provider value alongside the legacy 'calcom' / 'gcal'.
-- - Add explicit RLS policies so OWNER can INSERT/UPDATE bookings for any user.
--   (Service-role inserts bypass RLS; these policies are defense-in-depth.)
--
-- Run order: after 016_bookings_assigned_user_id.sql.

-- Make client_id nullable so admins can schedule meetings with prospects.
ALTER TABLE public.bookings
  ALTER COLUMN client_id DROP NOT NULL;

-- Drop any existing provider check constraints (names differ across migrations).
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS valid_provider;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_provider_check;

-- Recreate with 'manual' allowed.
ALTER TABLE public.bookings
  ADD CONSTRAINT valid_provider CHECK (provider IN ('calcom', 'gcal', 'manual'));

-- Track which OWNER scheduled the meeting.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON public.bookings(created_by);

-- OWNER can INSERT bookings (e.g. when scheduling on behalf of a client/prospect).
DROP POLICY IF EXISTS "Owner can insert any booking" ON public.bookings;
CREATE POLICY "Owner can insert any booking"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- OWNER can UPDATE any booking.
DROP POLICY IF EXISTS "Owner can update any booking" ON public.bookings;
CREATE POLICY "Owner can update any booking"
  ON public.bookings FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- OWNER can DELETE bookings.
DROP POLICY IF EXISTS "Owner can delete any booking" ON public.bookings;
CREATE POLICY "Owner can delete any booking"
  ON public.bookings FOR DELETE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

COMMENT ON COLUMN public.bookings.created_by IS 'Admin (OWNER) user_id who scheduled this meeting via the admin UI. NULL for legacy/Cal.com bookings.';
COMMENT ON COLUMN public.bookings.client_id IS 'Optional client user_id. NULL for prospects without an account yet.';
