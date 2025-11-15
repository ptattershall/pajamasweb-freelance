/**
 * Embeddings Service
 * Generates vector embeddings for content using OpenAI API
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSION = 1536

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set. Embeddings will not be generated.')
}

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

/**
 * Generate embedding for a text string using OpenAI API
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: OPENAI_MODEL,
        encoding_format: 'float',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    return {
      embedding: data.data[0].embedding,
      tokens: data.usage.total_tokens,
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: texts,
        model: OPENAI_MODEL,
        encoding_format: 'float',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    return data.data.map((item: any) => ({
      embedding: item.embedding,
      tokens: data.usage.total_tokens,
    }))
  } catch (error) {
    console.error('Error generating embeddings:', error)
    throw error
  }
}

/**
 * Prepare content for embedding by combining relevant fields
 */
export function prepareContentForEmbedding(content: {
  title: string
  summary?: string
  problem?: string
  results?: string
  content?: string
}): string {
  const parts = [
    content.title,
    content.summary || content.problem,
    content.results,
    content.content ? content.content.substring(0, 500) : '', // First 500 chars of content
  ]
    .filter(Boolean)
    .join('\n\n')

  return parts
}

