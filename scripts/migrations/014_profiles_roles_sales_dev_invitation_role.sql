-- Role-based auth: extend profiles.role to SALES and DEV, add invitation role
-- Run this in Supabase SQL Editor after 002 and 009.

-- 1. Extend profiles.role to allow SALES and DEV
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('OWNER', 'CLIENT', 'SALES', 'DEV'));

-- 2. Add role to invitations so admin can invite as CLIENT, SALES, or DEV
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('CLIENT', 'SALES', 'DEV')) DEFAULT 'CLIENT';

CREATE INDEX IF NOT EXISTS idx_invitations_role ON public.invitations(role);
