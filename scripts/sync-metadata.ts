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
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
import { getAllBlogPosts, getAllCaseStudies } from '../lib/content'
import {
  upsertBlogPostMeta,
  upsertCaseStudyMeta,
  BlogPostMeta,
  CaseStudyMeta,
} from '../lib/supabase'

function checkEnvironmentVariables(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase environment variables not found.')
    console.warn('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
    console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing')
    console.warn('   Skipping metadata sync. MDX content will still be served locally.')
    return false
  }

  return true
}

async function syncBlogPosts(): Promise<number> {
  console.log('\n📝 Syncing blog posts...')
  const blogPosts = getAllBlogPosts()

  if (blogPosts.length === 0) {
    console.log('   No blog posts found in content/blog/')
    return 0
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
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${post.slug}: ${message}`)
      console.error(`   ✗ ${post.title}: ${message}`)
    }
  }

  if (errors.length > 0) {
    console.warn(`   ⚠️  ${errors.length} blog post(s) failed to sync`)
  }

  return syncedCount
}

async function syncCaseStudies(): Promise<number> {
  console.log('\n📊 Syncing case studies...')
  const caseStudies = getAllCaseStudies()

  if (caseStudies.length === 0) {
    console.log('   No case studies found in content/case-studies/')
    return 0
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
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${study.slug}: ${message}`)
      console.error(`   ✗ ${study.title}: ${message}`)
    }
  }

  if (errors.length > 0) {
    console.warn(`   ⚠️  ${errors.length} case study/studies failed to sync`)
  }

  return syncedCount
}

async function syncMetadata() {
  console.log('🔄 MDX Metadata Sync')
  console.log('=' .repeat(40))

  if (!checkEnvironmentVariables()) {
    console.log('\n⏭️  Sync skipped (no Supabase credentials)')
    process.exit(0)
  }

  try {
    const blogCount = await syncBlogPosts()
    const caseStudyCount = await syncCaseStudies()

    console.log('\n' + '=' .repeat(40))
    console.log(`✅ Sync complete: ${blogCount} blog posts, ${caseStudyCount} case studies`)
  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error)
    console.error('   Build will continue, but metadata may be out of sync.')
    process.exit(0)
  }
}

syncMetadata()

