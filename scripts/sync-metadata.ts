/**
 * Sync script to mirror MDX metadata to Supabase
 * Run with: npx ts-node scripts/sync-metadata.ts
 */

import { getAllBlogPosts, getAllCaseStudies } from '../lib/content'
import {
  upsertBlogPostMeta,
  upsertCaseStudyMeta,
  BlogPostMeta,
  CaseStudyMeta,
} from '../lib/supabase'

async function syncMetadata() {
  console.log('🔄 Starting metadata sync...')

  try {
    // Sync blog posts
    console.log('\n📝 Syncing blog posts...')
    const blogPosts = getAllBlogPosts()

    for (const post of blogPosts) {
      const meta: BlogPostMeta = {
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        tags: post.tags,
        published_at: post.publishedAt,
      }

      await upsertBlogPostMeta(meta)
      console.log(`  ✓ Synced: ${post.title}`)
    }

    console.log(`✅ Synced ${blogPosts.length} blog posts`)

    // Sync case studies
    console.log('\n📊 Syncing case studies...')
    const caseStudies = getAllCaseStudies()

    for (const study of caseStudies) {
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
      console.log(`  ✓ Synced: ${study.title}`)
    }

    console.log(`✅ Synced ${caseStudies.length} case studies`)

    console.log('\n✨ Metadata sync completed successfully!')
  } catch (error) {
    console.error('❌ Error syncing metadata:', error)
    process.exit(1)
  }
}

syncMetadata()

