-- Create bookings table for Cal.com integration
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  external_id TEXT UNIQUE, -- Cal.com event ID
  provider TEXT NOT NULL DEFAULT 'calcom', -- 'calcom' | 'gcal'
  attendee_email TEXT NOT NULL,
  attendee_name TEXT,
  status TEXT DEFAULT 'confirmed', -- 'confirmed' | 'cancelled' | 'rescheduled'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_provider CHECK (provider IN ('calcom', 'gcal')),
  CONSTRAINT valid_status CHECK (status IN ('confirmed', 'cancelled', 'rescheduled'))
);

-- Create booking_history table for audit trail
CREATE TABLE IF NOT EXISTS booking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created' | 'updated' | 'cancelled' | 'rescheduled'
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_external_id ON bookings(external_id);
CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON bookings(starts_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id ON booking_history(booking_id);

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own bookings
CREATE POLICY "users_read_own_bookings" ON bookings
  FOR SELECT USING (auth.uid() = client_id OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policy: Users can create bookings for themselves
CREATE POLICY "users_create_own_bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- RLS Policy: Users can update their own bookings
CREATE POLICY "users_update_own_bookings" ON bookings
  FOR UPDATE USING (auth.uid() = client_id OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policy: Users can delete their own bookings
CREATE POLICY "users_delete_own_bookings" ON bookings
  FOR DELETE USING (auth.uid() = client_id OR auth.jwt() ->> 'role' = 'admin');

-- Enable RLS on booking_history table
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read history of their own bookings
CREATE POLICY "users_read_own_booking_history" ON booking_history
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE client_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
    )
  );

