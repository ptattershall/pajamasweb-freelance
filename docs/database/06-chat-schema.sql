-- AI Chat Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Create embeddings table for RAG
CREATE TABLE IF NOT EXISTS public.embeddings (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  source TEXT,
  type TEXT CHECK (type IN ('service', 'faq', 'blog', 'case_study')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw ON public.embeddings 
  USING hnsw (embedding vector_cosine_ops);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_results JSONB,
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create chat audit log for moderation
CREATE TABLE IF NOT EXISTS public.chat_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_message TEXT,
  ai_response TEXT,
  tool_calls JSONB,
  confidence_score FLOAT,
  flagged BOOLEAN DEFAULT false,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create escalations table
CREATE TABLE IF NOT EXISTS public.escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'assigned', 'resolved')) DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for embeddings (public read)
CREATE POLICY "embeddings_public_read"
  ON public.embeddings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for chat_sessions (users read own)
CREATE POLICY "chat_sessions_users_read_own"
  ON public.chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "chat_sessions_users_insert"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_messages (users read own session messages)
CREATE POLICY "chat_messages_users_read_own"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "chat_messages_users_insert"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_embeddings_type ON public.embeddings(type);
CREATE INDEX idx_embeddings_source ON public.embeddings(source);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_audit_log_user_id ON public.chat_audit_log(user_id);
CREATE INDEX idx_chat_audit_log_flagged ON public.chat_audit_log(flagged);
CREATE INDEX idx_escalations_user_id ON public.escalations(user_id);
CREATE INDEX idx_escalations_status ON public.escalations(status);

