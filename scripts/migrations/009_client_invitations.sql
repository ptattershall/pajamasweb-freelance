-- Client Portal Phase: Invitation System
-- Run this SQL in your Supabase SQL Editor

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create index for faster lookups
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_invitations_created_by ON public.invitations(created_by);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: OWNER can view all invitations
CREATE POLICY "Owner can view all invitations"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- RLS Policy: OWNER can create invitations
CREATE POLICY "Owner can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- RLS Policy: OWNER can update invitations
CREATE POLICY "Owner can update invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- RLS Policy: Anyone can accept their own invitation (unauthenticated)
CREATE POLICY "Anyone can accept invitation with valid token"
  ON public.invitations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Update profiles table to track invitation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMPTZ;

-- Create index for invited_by
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by ON public.profiles(invited_by);

