-- Services & Payments Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  details_md TEXT,
  price_from_cents INT,
  tier TEXT CHECK (tier IN ('starter', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  intent_id TEXT,
  type TEXT CHECK (type IN ('deposit', 'retainer', 'invoice')) NOT NULL,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT,
  related_service UUID REFERENCES public.services(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services (public read active services)
CREATE POLICY "services_public_read_active"
  ON public.services
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "services_authenticated_read_all"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "services_admin_write"
  ON public.services
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "services_admin_update"
  ON public.services
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for payments (users read own, admin reads all)
CREATE POLICY "payments_users_read_own"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = client_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "payments_admin_insert"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.uid() = client_id);

CREATE POLICY "payments_admin_update"
  ON public.payments
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for performance
CREATE INDEX idx_services_slug ON public.services(slug);
CREATE INDEX idx_services_is_active ON public.services(is_active);
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_payments_intent_id ON public.payments(intent_id);
CREATE INDEX idx_payments_type ON public.payments(type);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

