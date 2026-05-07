-- 019: Contact messages inbox (Phase 3 of Cal.com retirement)
--
-- Replaces customer self-booking with a "send a message" flow that admins
-- triage in /admin/messages. Inserts come through the service-role API path,
-- so RLS is locked down to OWNER for read/update/delete and authenticated
-- self-inserts for defense-in-depth.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sender
  name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Message
  subject TEXT,
  body TEXT NOT NULL,

  -- Optional links
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Triage
  status TEXT NOT NULL DEFAULT 'new',
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,

  -- Metadata
  source TEXT DEFAULT 'web',
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_contact_status CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON public.contact_messages(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id
  ON public.contact_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_contact_messages_related_client_id
  ON public.contact_messages(related_client_id);

-- RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can submit a message linked to themselves (or with no user_id).
DROP POLICY IF EXISTS "users_insert_own_messages" ON public.contact_messages;
CREATE POLICY "users_insert_own_messages" ON public.contact_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- OWNER can read all messages.
DROP POLICY IF EXISTS "owner_select_all_messages" ON public.contact_messages;
CREATE POLICY "owner_select_all_messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- OWNER can update (status, admin_notes, replied_by, etc.).
DROP POLICY IF EXISTS "owner_update_all_messages" ON public.contact_messages;
CREATE POLICY "owner_update_all_messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- OWNER can delete (e.g. spam).
DROP POLICY IF EXISTS "owner_delete_all_messages" ON public.contact_messages;
CREATE POLICY "owner_delete_all_messages" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'OWNER'
  );

-- Auto-update updated_at on every UPDATE.
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contact_messages_updated_at_trigger ON public.contact_messages;
CREATE TRIGGER contact_messages_updated_at_trigger
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_contact_messages_updated_at();

COMMENT ON TABLE public.contact_messages IS 'Inbound customer messages from /contact. Triaged by OWNER in /admin/messages.';
COMMENT ON COLUMN public.contact_messages.status IS 'new | read | replied | archived';
COMMENT ON COLUMN public.contact_messages.user_id IS 'Set if the sender was authenticated when submitting; nullable for anonymous prospects.';
