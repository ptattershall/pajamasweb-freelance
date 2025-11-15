-- Add notes/agenda field to bookings table
-- This migration adds support for meeting notes and agenda

-- Add notes column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS agenda TEXT;

-- Add comment
COMMENT ON COLUMN bookings.notes IS 'Meeting notes or additional information';
COMMENT ON COLUMN bookings.agenda IS 'Meeting agenda or topics to discuss';

