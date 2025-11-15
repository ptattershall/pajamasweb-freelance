/**
 * RAG Service
 * Handles retrieval of relevant context from embeddings for chat responses
 */

import { supabase } from './supabase'
import { generateEmbedding } from './embeddings'

export interface EmbeddingRecord {
  id: number
  content: string
  embedding: number[]
  metadata: Record<string, any>
  source: string
  type: 'service' | 'faq' | 'blog' | 'case_study'
  created_at: string
  updated_at: string
}

/**
 * Store an embedding in the database
 */
export async function storeEmbedding(
  content: string,
  embedding: number[],
  type: 'service' | 'faq' | 'blog' | 'case_study',
  source: string,
  metadata?: Record<string, any>
) {
  const { data, error } = await supabase
    .from('embeddings')
    .insert({
      content,
      embedding,
      type,
      source,
      metadata: metadata || {},
    })
    .select()

  if (error) {
    console.error('Error storing embedding:', error)
    throw error
  }

  return data[0]
}

/**
 * Retrieve similar embeddings using vector similarity search
 */
export async function retrieveSimilarEmbeddings(
  queryEmbedding: number[],
  limit: number = 5,
  threshold: number = 0.7
): Promise<EmbeddingRecord[]> {
  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding,
    match_count: limit,
    similarity_threshold: threshold,
  })

  if (error) {
    console.error('Error retrieving similar embeddings:', error)
    throw error
  }

  return data || []
}

/**
 * Retrieve context for a user query
 */
export async function retrieveRAGContext(
  userQuery: string,
  limit: number = 5
): Promise<string> {
  try {
    // Generate embedding for the user query
    const { embedding } = await generateEmbedding(userQuery)

    // Retrieve similar embeddings
    const similarEmbeddings = await retrieveSimilarEmbeddings(embedding, limit)

    if (similarEmbeddings.length === 0) {
      return ''
    }

    // Format context from retrieved embeddings
    const context = similarEmbeddings
      .map((record) => {
        const source = record.source ? ` (${record.source})` : ''
        return `${record.content}${source}`
      })
      .join('\n\n---\n\n')

    return context
  } catch (error) {
    console.error('Error retrieving RAG context:', error)
    return ''
  }
}

/**
 * Batch store embeddings
 */
export async function batchStoreEmbeddings(
  items: Array<{
    content: string
    embedding: number[]
    type: 'service' | 'faq' | 'blog' | 'case_study'
    source: string
    metadata?: Record<string, any>
  }>
) {
  const { data, error } = await supabase
    .from('embeddings')
    .insert(items)
    .select()

  if (error) {
    console.error('Error batch storing embeddings:', error)
    throw error
  }

  return data
}

/**
 * Clear embeddings by type
 */
export async function clearEmbeddingsByType(type: 'service' | 'faq' | 'blog' | 'case_study') {
  const { error } = await supabase
    .from('embeddings')
    .delete()
    .eq('type', type)

  if (error) {
    console.error('Error clearing embeddings:', error)
    throw error
  }
}

/**
 * Get all embeddings by type
 */
export async function getEmbeddingsByType(type: 'service' | 'faq' | 'blog' | 'case_study') {
  const { data, error } = await supabase
    .from('embeddings')
    .select('*')
    .eq('type', type)

  if (error) {
    console.error('Error fetching embeddings:', error)
    throw error
  }

  return data || []
}

