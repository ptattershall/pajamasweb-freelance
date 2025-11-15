-- Add hosted_invoice_url and invoice_pdf columns to invoices table
-- Run this SQL in your Supabase SQL Editor

-- Add new columns if they don't exist
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT,
ADD COLUMN IF NOT EXISTS invoice_pdf TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.invoices.hosted_invoice_url IS 'Stripe hosted invoice page URL for payment';
COMMENT ON COLUMN public.invoices.invoice_pdf IS 'Stripe invoice PDF download URL';

