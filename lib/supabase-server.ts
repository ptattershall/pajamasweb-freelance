/**
 * Supabase Server-Side Client
 *
 * Provides server-side Supabase client initialization for API routes, scripts,
 * and other trusted server contexts that need elevated database access.
 */

import { inspect } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import type { BlogPostMeta, CaseStudyMeta, Service } from './supabase'

type MetadataTableName = 'blog_posts_meta' | 'case_studies_meta'

type ErrorLike = {
  code?: unknown
  message?: unknown
  details?: unknown
  hint?: unknown
}

export interface SerializedSupabaseError {
  code?: string
  message: string
  details?: string | null
  hint?: string | null
  raw?: string
}

export class MetadataSyncError extends Error {
  readonly table: MetadataTableName
  readonly slug?: string
  readonly code?: string
  readonly details?: string | null
  readonly hint?: string | null
  readonly raw?: string

  constructor(action: string, table: MetadataTableName, slug: string | undefined, error: unknown) {
    const normalized = serializeSupabaseError(error)
    const slugSuffix = slug ? ` (${slug})` : ''

    super(`${action} failed for ${table}${slugSuffix}: ${normalized.message}`)

    this.name = 'MetadataSyncError'
    this.table = table
    this.slug = slug
    this.code = normalized.code
    this.details = normalized.details
    this.hint = normalized.hint
    this.raw = normalized.raw
  }
}

let serverSupabaseClient: ReturnType<typeof createServerSupabaseClient> | null = null

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

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function getServerSupabaseClient() {
  if (!serverSupabaseClient) {
    serverSupabaseClient = createServerSupabaseClient()
  }

  return serverSupabaseClient
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

export function serializeSupabaseError(error: unknown): SerializedSupabaseError {
  if (error instanceof MetadataSyncError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      raw: error.raw,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: null,
      hint: null,
      raw: inspect(error, { depth: 5, showHidden: true }),
    }
  }

  if (typeof error === 'object' && error !== null) {
    const {
      code,
      message,
      details,
      hint,
    } = error as ErrorLike

    return {
      code: typeof code === 'string' ? code : undefined,
      message: typeof message === 'string' ? message : inspect(error, { depth: 5, showHidden: true }),
      details: typeof details === 'string' ? details : details == null ? null : inspect(details, { depth: 5, showHidden: true }),
      hint: typeof hint === 'string' ? hint : hint == null ? null : inspect(hint, { depth: 5, showHidden: true }),
      raw: inspect(error, { depth: 5, showHidden: true }),
    }
  }

  return {
    message: String(error),
    details: null,
    hint: null,
    raw: typeof error === 'string' ? error : inspect(error, { depth: 5, showHidden: true }),
  }
}

function createMetadataSyncError(
  action: string,
  table: MetadataTableName,
  slug: string | undefined,
  error: unknown
) {
  return new MetadataSyncError(action, table, slug, error)
}

async function upsertMetadataRow<T extends BlogPostMeta | CaseStudyMeta>(
  table: MetadataTableName,
  payload: T
) {
  const { data, error } = await getServerSupabaseClient()
    .from(table)
    .upsert(payload as never, { onConflict: 'slug' })
    .select()

  if (error) {
    throw createMetadataSyncError('Metadata upsert', table, payload.slug, error)
  }

  return data
}

async function updateMetadataEmbedding(
  table: MetadataTableName,
  slug: string,
  embedding: number[]
) {
  const { data, error } = await getServerSupabaseClient()
    .from(table)
    .update({ embedding } as never)
    .eq('slug', slug)
    .select()

  if (error) {
    throw createMetadataSyncError('Metadata embedding update', table, slug, error)
  }

  return data
}

export async function assertMetadataTablesAvailable() {
  const tables: MetadataTableName[] = ['blog_posts_meta', 'case_studies_meta']

  for (const table of tables) {
    const { error } = await getServerSupabaseClient()
      .from(table)
      .select('slug', { head: true, count: 'exact' })

    if (error) {
      throw createMetadataSyncError('Metadata table preflight check', table, undefined, error)
    }
  }
}

export async function upsertBlogPostMeta(post: BlogPostMeta) {
  return upsertMetadataRow('blog_posts_meta', post)
}

export async function upsertCaseStudyMeta(study: CaseStudyMeta) {
  return upsertMetadataRow('case_studies_meta', study)
}

export async function updateBlogPostEmbedding(slug: string, embedding: number[]) {
  return updateMetadataEmbedding('blog_posts_meta', slug, embedding)
}

export async function updateCaseStudyEmbedding(slug: string, embedding: number[]) {
  return updateMetadataEmbedding('case_studies_meta', slug, embedding)
}

export async function getServices(activeOnly: boolean = true): Promise<Service[]> {
  try {
    let query = getServerSupabaseClient().from('services').select('*')

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data as Service[]) || []
  } catch (error) {
    console.warn('Warning: Error fetching services:', error)
    return []
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const { data, error } = await getServerSupabaseClient()
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }

      throw error
    }

    return data as Service | null
  } catch (error) {
    console.warn('Warning: Error fetching service:', error)
    return null
  }
}

