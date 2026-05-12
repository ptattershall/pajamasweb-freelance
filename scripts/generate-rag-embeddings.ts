/**
 * Generate RAG Embeddings Script
 * 
 * This script generates embeddings for:
 * - Services (from Supabase)
 * - FAQs (from content/faqs.json)
 * - Blog posts (from content/blog/)
 * - Case studies (from content/case-studies/)
 * 
 * Run with: npx ts-node scripts/generate-rag-embeddings.ts
 */

import fs from 'fs'
import path from 'path'
import { generateEmbedding, prepareContentForEmbedding } from '../lib/embeddings'
import { batchStoreEmbeddings, clearEmbeddingsByType } from '../lib/rag-service'
import { getServices } from '../lib/supabase-server'
import { getAllBlogPosts, getAllCaseStudies } from '../lib/content'

const BATCH_SIZE = 10
const DELAY_MS = 500 // Delay between batches to avoid rate limiting

type EmbeddingItem = {
  content: string
  embedding: number[]
  type: 'service' | 'faq' | 'blog' | 'case_study'
  source: string
  metadata?: Record<string, unknown>
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateServiceEmbeddings() {
  console.log('📚 Generating service embeddings...')
  
  try {
    const services = await getServices(true)
    
    if (services.length === 0) {
      console.log('⚠️  No services found')
      return
    }

    // Clear existing service embeddings
    await clearEmbeddingsByType('service')
    console.log(`🗑️  Cleared existing service embeddings`)

    const items: EmbeddingItem[] = []
    for (const service of services) {
      const content = prepareContentForEmbedding({
        title: service.title,
        summary: service.summary,
        content: service.details_md,
      })

      const { embedding } = await generateEmbedding(content)

      items.push({
        content,
        embedding,
        type: 'service' as const,
        source: service.slug,
        metadata: {
          title: service.title,
          slug: service.slug,
          price: service.price_from_cents,
          tier: service.tier,
        },
      })

      if (items.length >= BATCH_SIZE) {
        await batchStoreEmbeddings(items)
        console.log(`✅ Stored ${items.length} service embeddings`)
        items.length = 0
        await delay(DELAY_MS)
      }
    }

    if (items.length > 0) {
      await batchStoreEmbeddings(items)
      console.log(`✅ Stored ${items.length} service embeddings`)
    }
  } catch (error) {
    console.error('❌ Error generating service embeddings:', error)
  }
}

async function generateFAQEmbeddings() {
  console.log('📚 Generating FAQ embeddings...')
  
  try {
    const faqPath = path.join(process.cwd(), 'content', 'faqs.json')
    const faqContent = fs.readFileSync(faqPath, 'utf-8')
    const faqs = JSON.parse(faqContent)

    // Clear existing FAQ embeddings
    await clearEmbeddingsByType('faq')
    console.log(`🗑️  Cleared existing FAQ embeddings`)

    const items: EmbeddingItem[] = []
    for (const faq of faqs) {
      const content = `Q: ${faq.question}\nA: ${faq.answer}`
      const { embedding } = await generateEmbedding(content)

      items.push({
        content,
        embedding,
        type: 'faq' as const,
        source: faq.id,
        metadata: {
          question: faq.question,
          category: faq.category,
        },
      })

      if (items.length >= BATCH_SIZE) {
        await batchStoreEmbeddings(items)
        console.log(`✅ Stored ${items.length} FAQ embeddings`)
        items.length = 0
        await delay(DELAY_MS)
      }
    }

    if (items.length > 0) {
      await batchStoreEmbeddings(items)
      console.log(`✅ Stored ${items.length} FAQ embeddings`)
    }
  } catch (error) {
    console.error('❌ Error generating FAQ embeddings:', error)
  }
}

async function generateBlogEmbeddings() {
  console.log('📚 Generating blog post embeddings...')
  
  try {
    const posts = getAllBlogPosts()

    if (posts.length === 0) {
      console.log('⚠️  No blog posts found')
      return
    }

    // Clear existing blog embeddings
    await clearEmbeddingsByType('blog')
    console.log(`🗑️  Cleared existing blog embeddings`)

    const items: EmbeddingItem[] = []
    for (const post of posts) {
      const content = prepareContentForEmbedding({
        title: post.title,
        summary: post.summary,
        content: post.content,
      })

      const { embedding } = await generateEmbedding(content)

      items.push({
        content,
        embedding,
        type: 'blog' as const,
        source: post.slug,
        metadata: {
          title: post.title,
          slug: post.slug,
          tags: post.tags,
          publishedAt: post.publishedAt,
        },
      })

      if (items.length >= BATCH_SIZE) {
        await batchStoreEmbeddings(items)
        console.log(`✅ Stored ${items.length} blog embeddings`)
        items.length = 0
        await delay(DELAY_MS)
      }
    }

    if (items.length > 0) {
      await batchStoreEmbeddings(items)
      console.log(`✅ Stored ${items.length} blog embeddings`)
    }
  } catch (error) {
    console.error('❌ Error generating blog embeddings:', error)
  }
}

async function generateCaseStudyEmbeddings() {
  console.log('📚 Generating case study embeddings...')
  
  try {
    const studies = getAllCaseStudies()

    if (studies.length === 0) {
      console.log('⚠️  No case studies found')
      return
    }

    // Clear existing case study embeddings
    await clearEmbeddingsByType('case_study')
    console.log(`🗑️  Cleared existing case study embeddings`)

    const items: EmbeddingItem[] = []
    for (const study of studies) {
      const content = prepareContentForEmbedding({
        title: study.title,
        problem: study.problem,
        results: study.results,
        content: study.content,
      })

      const { embedding } = await generateEmbedding(content)

      items.push({
        content,
        embedding,
        type: 'case_study' as const,
        source: study.slug,
        metadata: {
          title: study.title,
          slug: study.slug,
          clientName: study.clientName,
          tags: study.tags,
          publishedAt: study.publishedAt,
        },
      })

      if (items.length >= BATCH_SIZE) {
        await batchStoreEmbeddings(items)
        console.log(`✅ Stored ${items.length} case study embeddings`)
        items.length = 0
        await delay(DELAY_MS)
      }
    }

    if (items.length > 0) {
      await batchStoreEmbeddings(items)
      console.log(`✅ Stored ${items.length} case study embeddings`)
    }
  } catch (error) {
    console.error('❌ Error generating case study embeddings:', error)
  }
}

async function main() {
  console.log('🚀 Starting RAG embedding generation...\n')

  try {
    await generateServiceEmbeddings()
    await generateFAQEmbeddings()
    await generateBlogEmbeddings()
    await generateCaseStudyEmbeddings()

    console.log('\n✅ All embeddings generated successfully!')
  } catch (error) {
    console.error('❌ Error during embedding generation:', error)
    process.exit(1)
  }
}

main()

