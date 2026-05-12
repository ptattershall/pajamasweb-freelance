/**
 * Sync script to mirror MDX metadata to Supabase
 * 
 * This script runs automatically before builds (via prebuild npm hook)
 * to ensure Supabase metadata stays in sync with local MDX files.
 * 
 * Run manually with: npx tsx scripts/sync-metadata.ts
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
import { getAllBlogPosts, getAllCaseStudies } from '../lib/content'
import {
  assertMetadataTablesAvailable,
  MetadataSyncError,
  serializeSupabaseError,
  upsertBlogPostMeta,
  upsertCaseStudyMeta,
} from '../lib/supabase-server'
import type { BlogPostMeta, CaseStudyMeta } from '../lib/supabase'

type SyncResult = {
  syncedCount: number
  errors: string[]
}

function checkEnvironmentVariables(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️  Supabase environment variables not found.')
    console.warn('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
    console.warn('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓ Set' : '✗ Missing')
    console.warn('   Skipping metadata sync. MDX content will still be served locally.')
    return false
  }

  return true
}

function logSyncError(
  contentType: 'blog post' | 'case study',
  context: { slug: string; title: string },
  error: unknown
) {
  const normalized = serializeSupabaseError(error)
  const table =
    error instanceof MetadataSyncError
      ? error.table
      : contentType === 'blog post'
        ? 'blog_posts_meta'
        : 'case_studies_meta'

  console.error(`   ✗ ${context.title}`)
  console.error(`     type: ${contentType}`)
  console.error(`     table: ${table}`)
  console.error(`     slug: ${context.slug}`)

  if (normalized.code) {
    console.error(`     code: ${normalized.code}`)
  }

  console.error(`     message: ${normalized.message}`)

  if (normalized.details) {
    console.error(`     details: ${normalized.details}`)
  }

  if (normalized.hint) {
    console.error(`     hint: ${normalized.hint}`)
  }

  if (normalized.raw && (normalized.message === '{}' || (!normalized.code && !normalized.details && !normalized.hint))) {
    console.error(`     raw: ${normalized.raw}`)
  }
}

async function runPreflightChecks() {
  console.log('\n🔍 Running metadata sync preflight...')
  await assertMetadataTablesAvailable()
  console.log('   ✓ Verified access to blog_posts_meta')
  console.log('   ✓ Verified access to case_studies_meta')
}

async function syncBlogPosts(): Promise<SyncResult> {
  console.log('\n📝 Syncing blog posts...')
  const blogPosts = getAllBlogPosts()

  if (blogPosts.length === 0) {
    console.log('   No blog posts found in content/blog/')
    return { syncedCount: 0, errors: [] }
  }

  let syncedCount = 0
  const errors: string[] = []

  for (const post of blogPosts) {
    try {
      const meta: BlogPostMeta = {
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        tags: post.tags,
        published_at: post.publishedAt,
      }

      await upsertBlogPostMeta(meta)
      console.log(`   ✓ ${post.title}`)
      syncedCount++
    } catch (error) {
      const { message } = serializeSupabaseError(error)
      errors.push(`${post.slug}: ${message}`)
      logSyncError('blog post', { slug: post.slug, title: post.title }, error)
    }
  }

  if (errors.length > 0) {
    console.warn(`   ⚠️  ${errors.length} blog post(s) failed to sync`)
  }

  return { syncedCount, errors }
}

async function syncCaseStudies(): Promise<SyncResult> {
  console.log('\n📊 Syncing case studies...')
  const caseStudies = getAllCaseStudies()

  if (caseStudies.length === 0) {
    console.log('   No case studies found in content/case-studies/')
    return { syncedCount: 0, errors: [] }
  }

  let syncedCount = 0
  const errors: string[] = []

  for (const study of caseStudies) {
    try {
      const meta: CaseStudyMeta = {
        slug: study.slug,
        title: study.title,
        client_name: study.clientName,
        problem: study.problem,
        results: study.results,
        tags: study.tags,
        published_at: study.publishedAt,
      }

      await upsertCaseStudyMeta(meta)
      console.log(`   ✓ ${study.title}`)
      syncedCount++
    } catch (error) {
      const { message } = serializeSupabaseError(error)
      errors.push(`${study.slug}: ${message}`)
      logSyncError('case study', { slug: study.slug, title: study.title }, error)
    }
  }

  if (errors.length > 0) {
    console.warn(`   ⚠️  ${errors.length} case study/studies failed to sync`)
  }

  return { syncedCount, errors }
}

async function syncMetadata() {
  console.log('🔄 MDX Metadata Sync')
  console.log('='.repeat(40))

  if (!checkEnvironmentVariables()) {
    console.log('\n⏭️  Sync skipped (no Supabase credentials)')
    process.exit(0)
  }

  try {
    await runPreflightChecks()
    const blogResult = await syncBlogPosts()
    const caseStudyResult = await syncCaseStudies()
    const failureCount = blogResult.errors.length + caseStudyResult.errors.length

    if (failureCount > 0) {
      throw new Error(
        `Metadata sync failed for ${failureCount} item(s). Check the detailed logs above for table, slug, code, and message.`
      )
    }

    console.log('\n' + '='.repeat(40))
    console.log(
      `✅ Sync complete: ${blogResult.syncedCount} blog posts, ${caseStudyResult.syncedCount} case studies`
    )
  } catch (error) {
    const normalized = serializeSupabaseError(error)
    console.error('\n❌ Fatal error during sync')
    console.error(`   message: ${normalized.message}`)

    if (normalized.code) {
      console.error(`   code: ${normalized.code}`)
    }

    if (normalized.details) {
      console.error(`   details: ${normalized.details}`)
    }

    if (normalized.hint) {
      console.error(`   hint: ${normalized.hint}`)
    }

    if (normalized.raw && (normalized.message === '{}' || (!normalized.code && !normalized.details && !normalized.hint))) {
      console.error(`   raw: ${normalized.raw}`)
    }

    console.error('   Metadata sync stopped before build to avoid silently stale content metadata.')
    process.exit(1)
  }
}

syncMetadata()

