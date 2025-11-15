-- Client Portal Phase 3: Invoices View
-- Run this SQL in your Supabase SQL Editor

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')) DEFAULT 'open',
  description TEXT,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can view their own invoices
CREATE POLICY "Clients can view own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- RLS Policy: OWNER can view all invoices
CREATE POLICY "Owner can view all invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at_trigger
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoices_updated_at();

