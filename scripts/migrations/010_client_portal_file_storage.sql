-- Migration: Client Portal File Storage Setup
-- Description: Creates Supabase Storage buckets for deliverables and contracts with RLS policies
-- Phase: 5 - Deliverables & Contracts

-- Create storage bucket for deliverables
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DELIVERABLES BUCKET POLICIES
-- ============================================

-- Policy: Clients can view their own deliverables
CREATE POLICY "Clients can view own deliverables"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deliverables' AND
  (SELECT client_id FROM public.deliverables WHERE file_url LIKE '%' || name) = auth.uid()
);

-- Policy: Owner can view all deliverables
CREATE POLICY "Owner can view all deliverables"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deliverables' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- Policy: Owner can upload deliverables
CREATE POLICY "Owner can upload deliverables"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deliverables' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- Policy: Owner can update deliverables
CREATE POLICY "Owner can update deliverables"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'deliverables' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- Policy: Owner can delete deliverables
CREATE POLICY "Owner can delete deliverables"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'deliverables' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- ============================================
-- CONTRACTS BUCKET POLICIES
-- ============================================

-- Policy: Clients can view their own contracts
CREATE POLICY "Clients can view own contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (SELECT client_id FROM public.contracts WHERE file_url LIKE '%' || name) = auth.uid()
);

-- Policy: Owner can view all contracts
CREATE POLICY "Owner can view all contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- Policy: Owner can upload contracts
CREATE POLICY "Owner can upload contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- Policy: Owner can update contracts
CREATE POLICY "Owner can update contracts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- Policy: Owner can delete contracts
CREATE POLICY "Owner can delete contracts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
);

-- Add comments
COMMENT ON TABLE storage.buckets IS 'Storage buckets for deliverables and contracts with RLS policies';

