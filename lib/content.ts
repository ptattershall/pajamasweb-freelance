import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { format, parseISO } from 'date-fns'

export interface BlogPost {
  slug: string
  title: string
  summary: string
  publishedAt: string
  formattedDate: string
  tags?: string[]
  heroImage?: string
  content: string
  url: string
}

export interface CaseStudy {
  slug: string
  title: string
  clientName: string
  problem: string
  results: string
  publishedAt: string
  formattedDate: string
  tags?: string[]
  heroImage?: string
  content: string
  url: string
}

const contentDir = path.join(process.cwd(), 'content')

function getFilesInDirectory(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => file.endsWith('.mdx'))
  } catch {
    return []
  }
}

function parseFile(filePath: string): { data: Record<string, unknown>; content: string } {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  return matter(fileContent)
}

/**
 * Get all blog posts sorted by date (newest first)
 */
export function getAllBlogPosts(): BlogPost[] {
  const blogDir = path.join(contentDir, 'blog')
  const files = getFilesInDirectory(blogDir)

  const posts = files.map((file) => {
    const filePath = path.join(blogDir, file)
    const { data, content } = parseFile(filePath)
    const slug = file.replace('.mdx', '')

    return {
      slug,
      title: data.title as string,
      summary: data.summary as string,
      publishedAt: data.publishedAt as string,
      formattedDate: format(parseISO(data.publishedAt as string), 'MMMM d, yyyy'),
      tags: (data.tags as string[]) || [],
      heroImage: data.heroImage as string | undefined,
      content,
      url: `/blog/${slug}`,
    }
  })

  return posts.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

/**
 * Get all case studies sorted by date (newest first)
 */
export function getAllCaseStudies(): CaseStudy[] {
  const caseStudiesDir = path.join(contentDir, 'case-studies')
  const files = getFilesInDirectory(caseStudiesDir)

  const studies = files.map((file) => {
    const filePath = path.join(caseStudiesDir, file)
    const { data, content } = parseFile(filePath)
    const slug = file.replace('.mdx', '')

    return {
      slug,
      title: data.title as string,
      clientName: data.clientName as string,
      problem: data.problem as string,
      results: data.results as string,
      publishedAt: data.publishedAt as string,
      formattedDate: format(parseISO(data.publishedAt as string), 'MMMM d, yyyy'),
      tags: (data.tags as string[]) || [],
      heroImage: data.heroImage as string | undefined,
      content,
      url: `/case-studies/${slug}`,
    }
  })

  return studies.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

/**
 * Get a blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug)
}

/**
 * Get a case study by slug
 */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getAllCaseStudies().find((study) => study.slug === slug)
}

/**
 * Get blog posts by tag
 */
export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.tags?.includes(tag))
}

/**
 * Get case studies by tag
 */
export function getCaseStudiesByTag(tag: string): CaseStudy[] {
  return getAllCaseStudies().filter((study) => study.tags?.includes(tag))
}

/**
 * Get all unique tags from blog posts
 */
export function getAllBlogTags(): string[] {
  const tags = new Set<string>()
  getAllBlogPosts().forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Get all unique tags from case studies
 */
export function getAllCaseStudyTags(): string[] {
  const tags = new Set<string>()
  getAllCaseStudies().forEach((study) => {
    study.tags?.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Get featured blog posts (first N)
 */
export function getFeaturedBlogPosts(count: number = 3): BlogPost[] {
  return getAllBlogPosts().slice(0, count)
}

/**
 * Get featured case studies (first N)
 */
export function getFeaturedCaseStudies(count: number = 3): CaseStudy[] {
  return getAllCaseStudies().slice(0, count)
}

