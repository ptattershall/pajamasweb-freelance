-- Client Portal Phase 4: Bookings View
-- Run this SQL in your Supabase SQL Editor

-- Create bookings table (extends existing bookings table from Cal.com integration)
-- ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS notes TEXT;
-- ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS location TEXT;
-- ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- If bookings table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  external_id TEXT UNIQUE,
  provider TEXT NOT NULL DEFAULT 'calcom',
  attendee_email TEXT NOT NULL,
  attendee_name TEXT,
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can view their own bookings
CREATE POLICY "Clients can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- RLS Policy: OWNER can view all bookings
CREATE POLICY "Owner can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON public.bookings(starts_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Create trigger
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at_trigger
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_bookings_updated_at();

