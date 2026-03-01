-- Allow guest subscriptions: client_id may be null when user checked out without an account
-- Date: 2026-03-01

ALTER TABLE subscriptions
  ALTER COLUMN client_id DROP NOT NULL;

COMMENT ON COLUMN subscriptions.client_id IS 'Auth user ID when known; null for guest checkout until account is linked';
