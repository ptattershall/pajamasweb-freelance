/**
 * Generate Embeddings Script
 * 
 * This script generates embeddings for all blog posts and case studies
 * and stores them in Supabase.
 * 
 * Run with: npx ts-node scripts/generate-embeddings.ts
 * 
 * Prerequisites:
 * - OPENAI_API_KEY environment variable must be set
 * - pgvector extension must be enabled in Supabase
 * - Vector search functions must be created (see docs/database/04-vector-search-functions.sql)
 */

import { getAllBlogPosts, getAllCaseStudies } from '@/lib/content'
import {
  updateBlogPostEmbedding,
  updateCaseStudyEmbedding,
} from '@/lib/supabase'
import {
  generateEmbedding,
  prepareContentForEmbedding,
} from '@/lib/embeddings'

const BATCH_DELAY = 500 // ms between API calls to avoid rate limiting

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateBlogPostEmbeddings() {
  console.log('📝 Generating embeddings for blog posts...')
  const posts = getAllBlogPosts()

  for (const post of posts) {
    try {
      console.log(`  Processing: ${post.title}`)
      
      const contentForEmbedding = prepareContentForEmbedding({
        title: post.title,
        summary: post.summary,
        content: post.content,
      })

      const { embedding } = await generateEmbedding(contentForEmbedding)
      await updateBlogPostEmbedding(post.slug, embedding)
      
      console.log(`  ✅ Embedded: ${post.slug}`)
      await sleep(BATCH_DELAY)
    } catch (error) {
      console.error(`  ❌ Error embedding ${post.slug}:`, error)
    }
  }

  console.log(`✅ Completed ${posts.length} blog post embeddings\n`)
}

async function generateCaseStudyEmbeddings() {
  console.log('📚 Generating embeddings for case studies...')
  const studies = getAllCaseStudies()

  for (const study of studies) {
    try {
      console.log(`  Processing: ${study.title}`)
      
      const contentForEmbedding = prepareContentForEmbedding({
        title: study.title,
        problem: study.problem,
        results: study.results,
        content: study.content,
      })

      const { embedding } = await generateEmbedding(contentForEmbedding)
      await updateCaseStudyEmbedding(study.slug, embedding)
      
      console.log(`  ✅ Embedded: ${study.slug}`)
      await sleep(BATCH_DELAY)
    } catch (error) {
      console.error(`  ❌ Error embedding ${study.slug}:`, error)
    }
  }

  console.log(`✅ Completed ${studies.length} case study embeddings\n`)
}

async function main() {
  console.log('🚀 Starting embedding generation...\n')

  try {
    await generateBlogPostEmbeddings()
    await generateCaseStudyEmbeddings()
    console.log('✨ All embeddings generated successfully!')
  } catch (error) {
    console.error('❌ Error during embedding generation:', error)
    process.exit(1)
  }
}

main()

