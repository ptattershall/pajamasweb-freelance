/**
 * Blog Service
 * Handles CRUD operations for blog posts (MDX files)
 */

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { BlogPostInput, BlogPostUpdateInput } from './validation-schemas'
import { generateEmbedding, prepareContentForEmbedding } from './embeddings'
import { upsertBlogPostMeta, updateBlogPostEmbedding } from './supabase-server'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

/**
 * Ensures the content directory exists
 */
async function ensureContentDir(): Promise<void> {
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true })
  }
}

/**
 * Creates a new blog post MDX file
 */
export async function createBlogPost(input: BlogPostInput): Promise<void> {
  await ensureContentDir()
  
  const { slug, title, summary, publishedAt, tags, heroImage, content } = input

  const frontmatter: Record<string, unknown> = {
    title,
    summary,
    publishedAt,
    tags,
  }

  if (heroImage) {
    frontmatter.heroImage = heroImage
  }

  const mdxContent = matter.stringify(content, frontmatter)
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)

  try {
    await fs.access(filePath)
    throw new Error(`Blog post with slug "${slug}" already exists`)
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
      throw error
    }
    if (error instanceof Error && error.message.includes('already exists')) {
      throw error
    }
  }

  await fs.writeFile(filePath, mdxContent, 'utf-8')
  await syncBlogPostToSupabase(slug, input)
}

/**
 * Updates an existing blog post MDX file
 */
export async function updateBlogPost(slug: string, input: BlogPostUpdateInput): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)

  const existingContent = await fs.readFile(filePath, 'utf-8')
  const { data: existingFrontmatter, content: existingBody } = matter(existingContent)

  const frontmatter: Record<string, unknown> = {
    title: input.title ?? existingFrontmatter.title,
    summary: input.summary ?? existingFrontmatter.summary,
    publishedAt: input.publishedAt ?? existingFrontmatter.publishedAt,
    tags: input.tags ?? existingFrontmatter.tags,
  }

  const heroImage = input.heroImage ?? existingFrontmatter.heroImage
  if (heroImage) {
    frontmatter.heroImage = heroImage
  }

  const content = input.content ?? existingBody.trim()
  const mdxContent = matter.stringify(content, frontmatter)

  await fs.writeFile(filePath, mdxContent, 'utf-8')

  const fullInput: BlogPostInput = {
    slug,
    title: frontmatter.title as string,
    summary: frontmatter.summary as string,
    publishedAt: frontmatter.publishedAt as string,
    tags: frontmatter.tags as string[],
    heroImage: frontmatter.heroImage as string | undefined,
    content,
  }

  await syncBlogPostToSupabase(slug, fullInput)
}

/**
 * Deletes a blog post MDX file
 */
export async function deleteBlogPost(slug: string): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  await fs.unlink(filePath)
}

/**
 * Syncs blog post metadata and embeddings to Supabase
 */
async function syncBlogPostToSupabase(slug: string, input: BlogPostInput): Promise<void> {
  try {
    await upsertBlogPostMeta({
      slug,
      title: input.title,
      summary: input.summary,
      tags: input.tags,
      published_at: input.publishedAt,
    })

    const textForEmbedding = prepareContentForEmbedding({
      title: input.title,
      summary: input.summary,
      content: input.content,
    })

    try {
      const { embedding } = await generateEmbedding(textForEmbedding)
      await updateBlogPostEmbedding(slug, embedding)
    } catch (embeddingError) {
      console.warn('Failed to generate embedding (non-fatal):', embeddingError)
    }
  } catch (error) {
    console.warn('Failed to sync to Supabase (non-fatal):', error)
  }
}

/**
 * Reads a blog post for editing
 */
export async function getBlogPostForEdit(slug: string): Promise<BlogPostInput | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    return {
      slug,
      title: data.title as string,
      summary: data.summary as string,
      publishedAt: data.publishedAt as string,
      tags: (data.tags as string[]) || [],
      heroImage: (data.heroImage as string) || '',
      content: content.trim(),
    }
  } catch {
    return null
  }
}

/**
 * Checks if a slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
    await fs.access(filePath)
    return false
  } catch {
    return true
  }
}
