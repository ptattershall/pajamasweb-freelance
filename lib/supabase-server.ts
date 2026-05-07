/**
 * Supabase Server-Side Client
 * 
 * Provides server-side Supabase client initialization for API routes and server components.
 * Uses the service role key for elevated permissions.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for server-side operations
 * Uses the service role key for elevated permissions
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * Create a Supabase client for client-side operations
 * Uses the anonymous key for limited permissions
 */
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY for compatibility)'
    )
  }

  return createClient(supabaseUrl, publishableKey)
}

