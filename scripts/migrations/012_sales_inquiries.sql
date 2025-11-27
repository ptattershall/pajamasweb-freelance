-- Sales Inquiries Table for Sales Funnel
-- Run this SQL in your Supabase SQL Editor

-- Create sales_inquiries table
CREATE TABLE IF NOT EXISTS public.sales_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,

  -- Services of Interest (stored as array of text)
  services TEXT[] NOT NULL,

  -- Project Details
  project_description TEXT,
  timeline TEXT,
  budget_range TEXT,

  -- Additional Info
  additional_notes TEXT,

  -- Meeting Booking
  meeting_booked BOOLEAN DEFAULT FALSE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,

  -- Status Tracking
  status TEXT CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CLOSED_WON', 'CLOSED_LOST')) DEFAULT 'NEW',

  -- Metadata
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Admin Notes
  admin_notes TEXT
);

-- Enable RLS on sales_inquiries
ALTER TABLE public.sales_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous users to insert (for the public sales funnel)
CREATE POLICY "Anyone can submit sales inquiry"
  ON public.sales_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policy: OWNER can view all sales inquiries
CREATE POLICY "Owner can view all sales inquiries"
  ON public.sales_inquiries FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- RLS Policy: OWNER can update all sales inquiries
CREATE POLICY "Owner can update all sales inquiries"
  ON public.sales_inquiries FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_inquiries_status ON public.sales_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_sales_inquiries_created_at ON public.sales_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_inquiries_email ON public.sales_inquiries(email);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sales_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_inquiries_updated_at_trigger
BEFORE UPDATE ON public.sales_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_sales_inquiries_updated_at();
