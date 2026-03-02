-- Add assigned_user_id to bookings so SALES/DEV can be tied to calendar events.
-- Run after 015_client_assignments.sql and 004 (bookings table).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_assigned_user_id ON public.bookings(assigned_user_id);

-- RLS: allow SALES to select/update only bookings where assigned_user_id = auth.uid()
-- Existing policies: clients see own (client_id), OWNER sees all. Add contractor policies in app layer or here.

-- Policy: SALES can select bookings assigned to them
CREATE POLICY "Sales can select own assigned bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'SALES'
    AND assigned_user_id = auth.uid()
  );

-- Policy: DEV can select bookings assigned to them
CREATE POLICY "Dev can select own assigned bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'DEV'
    AND assigned_user_id = auth.uid()
  );

-- SALES/DEV can update only their assigned bookings
CREATE POLICY "Sales can update own assigned bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'SALES'
    AND assigned_user_id = auth.uid()
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'SALES'
    AND assigned_user_id = auth.uid()
  );

CREATE POLICY "Dev can update own assigned bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'DEV'
    AND assigned_user_id = auth.uid()
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'DEV'
    AND assigned_user_id = auth.uid()
  );

-- SALES/DEV can insert bookings with themselves as assigned_user_id
CREATE POLICY "Sales can insert own assigned bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'SALES'
    AND assigned_user_id = auth.uid()
  );

CREATE POLICY "Dev can insert own assigned bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'DEV'
    AND assigned_user_id = auth.uid()
  );
