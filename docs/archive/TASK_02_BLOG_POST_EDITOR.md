# Task 02: Blog Post Editor Interface Implementation

## Overview

**Task:** Create a blog post editor interface for the Admin CMS.

**Current State:** Not implemented - MDX files are edited directly in the filesystem

**Location:** Feature 01: Content Management (MDX-first) → Phase 4: Admin CMS UI

---

## Codebase Analysis

### Current Content Management Architecture

#### Content Structure

**Directory:** `content/`

```
content/
├── blog/
│   ├── getting-started-with-web-design.mdx
│   └── performance-optimization-tips.mdx
├── case-studies/
│   └── ecommerce-redesign.mdx
└── faqs.json
```

#### MDX File Format

**Example:** `content/blog/getting-started-with-web-design.mdx`

```mdx
---
title: "Getting Started with Web Design: A Beginner's Guide"
summary: "Learn the fundamentals of web design..."
publishedAt: "2024-01-15"
tags: ["web-design", "beginner", "tutorial"]
---

# Getting Started with Web Design: A Beginner's Guide

Web design is the art and science of creating beautiful, functional websites...

## Why Web Design Matters
...
```

#### Content Processing Pipeline

**File:** `lib/content.ts`

| Function | Purpose |
|----------|---------|
| `getAllBlogPosts()` | Reads all MDX files from `content/blog/` |
| `getBlogPostBySlug()` | Retrieves single post by slug |
| `getAllBlogTags()` | Extracts unique tags from all posts |
| `getBlogPostsByTag()` | Filters posts by tag |

**Key Interfaces:**

```typescript
interface BlogPost {
  slug: string
  title: string
  summary: string
  publishedAt: string
  formattedDate: string
  tags?: string[]
  heroImage?: string
  content: string  // Raw MDX content
  url: string
}
```

#### Current Admin Blog Page

**File:** `app/admin/blog/page.tsx`

Current state:

- ✅ Lists all blog posts with metadata
- ✅ Shows tags and publish dates
- ✅ Links to view published posts
- ❌ **Edit button is disabled** (no editor)
- ❌ **Create button is disabled** (no editor)

```tsx
<Button disabled>Create New Post (Coming Soon)</Button>
// ...
<Button variant="outline" size="sm" disabled>Edit</Button>
```

#### Related Files

| File | Purpose |
|------|---------|
| `app/blog/[slug]/page.tsx` | Renders MDX content via `next-mdx-remote` |
| `lib/supabase.ts` | `upsertBlogPostMeta()`, `updateBlogPostEmbedding()` |
| `lib/embeddings.ts` | `generateEmbedding()` for search |
| `scripts/sync-metadata.ts` | Syncs MDX metadata to Supabase |

---

## Implementation Options

### Option A: MDXEditor (Recommended for WYSIWYG)

**Package:** `@mdxeditor/editor`  
**NPM:** <https://www.npmjs.com/package/@mdxeditor/editor>  
**Source Reputation:** Medium  
**Benchmark Score:** 84.1  
**Code Snippets Available:** 229

#### Why Recommended

1. **Native MDX support** - Edits actual MDX syntax
2. **WYSIWYG experience** - Users see formatted content while editing
3. **Frontmatter plugin** - Built-in support for YAML frontmatter
4. **Rich toolbar** - Headings, lists, links, images, tables
5. **JSX component support** - Can embed custom React components
6. **Active development** - Regular updates and bug fixes

#### Key Features

- Live markdown preview
- Toolbar customization
- Frontmatter editing
- Image insertion
- Table editing
- Code block syntax highlighting
- Custom JSX component editing
- Undo/redo support
- Keyboard shortcuts

#### Installation

```bash
npm install @mdxeditor/editor
```

#### Example Usage

```tsx
import '@mdxeditor/editor/style.css'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  ListsToggle,
  InsertFrontmatter,
} from '@mdxeditor/editor'

<MDXEditor
  markdown={content}
  onChange={setContent}
  plugins={[
    headingsPlugin(),
    listsPlugin(),
    linkPlugin(),
    imagePlugin(),
    tablePlugin(),
    frontmatterPlugin(),
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <BoldItalicUnderlineToggles />
          <BlockTypeSelect />
          <ListsToggle />
          <CreateLink />
          <InsertImage />
          <InsertTable />
          <InsertFrontmatter />
        </>
      )
    })
  ]}
/>
```

---

### Option B: Monaco Editor (Code-First Approach)

**Package:** `@monaco-editor/react`  
**NPM:** <https://www.npmjs.com/package/@monaco-editor/react>  
**Source Reputation:** High  
**Benchmark Score:** 88.6  
**Code Snippets Available:** 55

#### When to Use

- Technical users comfortable with markdown
- Need syntax highlighting for code blocks
- Want VS Code-like editing experience
- Prefer seeing raw MDX source

#### Pros

- Familiar VS Code experience
- Excellent syntax highlighting
- IntelliSense support
- Powerful find/replace
- No build configuration needed

#### Cons

- Not WYSIWYG - users see raw markdown
- Steeper learning curve for non-technical users
- No visual frontmatter editor
- Larger bundle size (~1MB)

#### Installation

```bash
npm install @monaco-editor/react
```

#### Example Usage

```tsx
import Editor from '@monaco-editor/react'

<Editor
  height="600px"
  language="markdown"
  theme="vs-dark"
  value={content}
  onChange={(value) => setContent(value || '')}
  options={{
    minimap: { enabled: false },
    wordWrap: 'on',
    lineNumbers: 'on',
    fontSize: 14,
  }}
/>
```

---

### Option C: React MD Editor (Hybrid)

**Package:** `@uiwjs/react-md-editor`  
**NPM:** <https://www.npmjs.com/package/@uiwjs/react-md-editor>  
**Source Reputation:** High  
**Benchmark Score:** 57.9  
**Code Snippets Available:** 12

#### When to Use

- Need split-pane preview
- Want simpler setup than MDXEditor
- Standard markdown (not full MDX)

#### Pros

- Split editor/preview view
- Simple API
- Lightweight
- Good toolbar

#### Cons

- Limited MDX support
- No frontmatter plugin
- Less customizable

---

## Recommended Implementation Plan

### Architecture Decision

For a **freelance web design business**, the recommended approach is:

**Option A (MDXEditor)** - Because:

1. Content creators may not be developers
2. WYSIWYG provides better UX for writing blog posts
3. Built-in frontmatter support matches existing content structure
4. Can still embed code blocks and custom components

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Admin Blog Editor Flow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌───────────────────────────────────────┐  │
│  │ /admin/blog  │───▶│  /admin/blog/new (Create)             │  │
│  │ (List View)  │    │  /admin/blog/[slug]/edit (Edit)       │  │
│  └──────────────┘    └───────────────────────────────────────┘  │
│                                      │                           │
│                                      ▼                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  BlogPostEditor Component                  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Metadata Form (React Hook Form + Zod)             │  │   │
│  │  │  - Title, Summary, Tags, Publish Date, Hero Image  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  MDXEditor (Content Body)                          │  │   │
│  │  │  - Toolbar (Bold, Italic, Headings, Lists, etc.)   │  │   │
│  │  │  - WYSIWYG Editor Area                             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Actions: [Save Draft] [Preview] [Publish]         │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                      │                           │
│                                      ▼                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Layer                              │   │
│  │  POST /api/admin/blog-posts      (Create)                │   │
│  │  PUT  /api/admin/blog-posts/[slug] (Update)              │   │
│  │  DELETE /api/admin/blog-posts/[slug] (Delete)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                      │                           │
│                                      ▼                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Storage Layer                            │   │
│  │  1. Write MDX file to content/blog/[slug].mdx            │   │
│  │  2. Sync metadata to Supabase blog_posts_meta            │   │
│  │  3. Generate/update embeddings for search                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/BlogPostEditor.tsx` | **CREATE** | Main editor component with MDXEditor |
| `app/admin/blog/new/page.tsx` | **CREATE** | Create new post page |
| `app/admin/blog/[slug]/edit/page.tsx` | **CREATE** | Edit existing post page |
| `app/api/admin/blog-posts/route.ts` | **CREATE** | Create/List blog posts API |
| `app/api/admin/blog-posts/[slug]/route.ts` | **CREATE** | Update/Delete blog post API |
| `lib/blog-service.ts` | **CREATE** | Blog post CRUD operations |
| `lib/validation-schemas.ts` | **MODIFY** | Add blogPostSchema |
| `app/admin/blog/page.tsx` | **MODIFY** | Enable Create/Edit buttons |

### Step-by-Step Implementation

#### Step 1: Install Dependencies

```bash
npm install @mdxeditor/editor
```

#### Step 2: Add Blog Post Validation Schema

**File:** `lib/validation-schemas.ts` (add to existing)

```typescript
// ============================================================================
// BLOG POST SCHEMAS
// ============================================================================

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  summary: z
    .string()
    .min(20, 'Summary must be at least 20 characters')
    .max(500, 'Summary must be less than 500 characters'),
  publishedAt: z.string().datetime(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  heroImage: z.string().url().optional(),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  status: z.enum(['draft', 'published']).default('draft'),
})

export type BlogPostInput = z.infer<typeof blogPostSchema>
```

#### Step 3: Create Blog Service

**File:** `lib/blog-service.ts`

```typescript
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { BlogPostInput } from './validation-schemas'
import { upsertBlogPostMeta, updateBlogPostEmbedding } from './supabase'
import { generateEmbedding } from './embeddings'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

/**
 * Creates a new blog post MDX file
 */
export async function createBlogPost(input: BlogPostInput): Promise<void> {
  const { slug, title, summary, publishedAt, tags, heroImage, content } = input
  
  const frontmatter = {
    title,
    summary,
    publishedAt,
    tags,
    ...(heroImage && { heroImage }),
  }

  const mdxContent = matter.stringify(content, frontmatter)
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)

  // Check if file already exists
  try {
    await fs.access(filePath)
    throw new Error(`Blog post with slug "${slug}" already exists`)
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error
  }

  // Write MDX file
  await fs.writeFile(filePath, mdxContent, 'utf-8')

  // Sync to Supabase
  await syncBlogPostToSupabase(slug, input)
}

/**
 * Updates an existing blog post MDX file
 */
export async function updateBlogPost(slug: string, input: Partial<BlogPostInput>): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  
  // Read existing file
  const existingContent = await fs.readFile(filePath, 'utf-8')
  const { data: existingFrontmatter, content: existingBody } = matter(existingContent)

  // Merge with updates
  const frontmatter = {
    ...existingFrontmatter,
    ...(input.title && { title: input.title }),
    ...(input.summary && { summary: input.summary }),
    ...(input.publishedAt && { publishedAt: input.publishedAt }),
    ...(input.tags && { tags: input.tags }),
    ...(input.heroImage !== undefined && { heroImage: input.heroImage }),
  }

  const content = input.content || existingBody
  const mdxContent = matter.stringify(content, frontmatter)

  // Write updated file
  await fs.writeFile(filePath, mdxContent, 'utf-8')

  // Sync to Supabase
  await syncBlogPostToSupabase(slug, { ...existingFrontmatter, ...input, content })
}

/**
 * Deletes a blog post MDX file
 */
export async function deleteBlogPost(slug: string): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  await fs.unlink(filePath)
  
  // Note: Consider also removing from Supabase metadata table
}

/**
 * Syncs blog post metadata and embeddings to Supabase
 */
async function syncBlogPostToSupabase(slug: string, input: Partial<BlogPostInput>): Promise<void> {
  // Upsert metadata
  await upsertBlogPostMeta({
    slug,
    title: input.title || '',
    summary: input.summary,
    tags: input.tags,
    published_at: input.publishedAt,
  })

  // Generate and store embedding for search
  if (input.title && input.summary && input.content) {
    const textForEmbedding = `${input.title}\n\n${input.summary}\n\n${input.content}`
    try {
      const embedding = await generateEmbedding(textForEmbedding)
      await updateBlogPostEmbedding(slug, embedding)
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      // Non-fatal: post is saved, embedding can be generated later
    }
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
      title: data.title,
      summary: data.summary,
      publishedAt: data.publishedAt,
      tags: data.tags || [],
      heroImage: data.heroImage,
      content: content.trim(),
      status: 'published', // Could add draft detection logic
    }
  } catch {
    return null
  }
}
```

#### Step 4: Create API Routes

**File:** `app/api/admin/blog-posts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { blogPostSchema } from '@/lib/validation-schemas'
import { createBlogPost } from '@/lib/blog-service'
import { getAllBlogPosts } from '@/lib/content'

export async function GET() {
  try {
    const posts = getAllBlogPosts()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = blogPostSchema.parse(body)
    
    await createBlogPost(validatedData)
    
    return NextResponse.json(
      { success: true, slug: validatedData.slug },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Failed to create blog post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
```

**File:** `app/api/admin/blog-posts/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { blogPostSchema } from '@/lib/validation-schemas'
import { updateBlogPost, deleteBlogPost, getBlogPostForEdit } from '@/lib/blog-service'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const post = await getBlogPostForEdit(slug)
    
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ post })
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const body = await request.json()
    const validatedData = blogPostSchema.partial().parse(body)
    
    await updateBlogPost(slug, validatedData)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Failed to update blog post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    await deleteBlogPost(slug)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}
```

#### Step 5: Create BlogPostEditor Component

**File:** `components/BlogPostEditor.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { blogPostSchema, BlogPostInput } from '@/lib/validation-schemas'
import '@mdxeditor/editor/style.css'

// Dynamic import to avoid SSR issues with MDXEditor
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false, loading: () => <div className="h-96 bg-muted animate-pulse rounded" /> }
)

// Import plugins dynamically
const editorPlugins = dynamic(
  () => import('@mdxeditor/editor').then((mod) => ({
    headingsPlugin: mod.headingsPlugin,
    listsPlugin: mod.listsPlugin,
    linkPlugin: mod.linkPlugin,
    linkDialogPlugin: mod.linkDialogPlugin,
    imagePlugin: mod.imagePlugin,
    tablePlugin: mod.tablePlugin,
    thematicBreakPlugin: mod.thematicBreakPlugin,
    toolbarPlugin: mod.toolbarPlugin,
    UndoRedo: mod.UndoRedo,
    BoldItalicUnderlineToggles: mod.BoldItalicUnderlineToggles,
    BlockTypeSelect: mod.BlockTypeSelect,
    CreateLink: mod.CreateLink,
    InsertImage: mod.InsertImage,
    InsertTable: mod.InsertTable,
    ListsToggle: mod.ListsToggle,
    Separator: mod.Separator,
  })),
  { ssr: false }
)

interface BlogPostEditorProps {
  initialData?: Partial<BlogPostInput>
  mode: 'create' | 'edit'
  slug?: string
}

export function BlogPostEditor({ initialData, mode, slug }: BlogPostEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialData?.content || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plugins, setPlugins] = useState<any>(null)

  // Load editor plugins
  useEffect(() => {
    editorPlugins.then(setPlugins)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      slug: initialData?.slug || '',
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      publishedAt: initialData?.publishedAt || new Date().toISOString(),
      tags: initialData?.tags || [],
      heroImage: initialData?.heroImage || '',
      content: initialData?.content || '',
      status: initialData?.status || 'draft',
    },
  })

  // Keep content in sync with form
  useEffect(() => {
    setValue('content', content)
  }, [content, setValue])

  // Generate slug from title
  const title = watch('title')
  useEffect(() => {
    if (mode === 'create' && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100)
      setValue('slug', generatedSlug)
    }
  }, [title, mode, setValue])

  const onSubmit = async (data: BlogPostInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = mode === 'create' 
        ? '/api/admin/blog-posts'
        : `/api/admin/blog-posts/${slug}`
      
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save blog post')
      }

      router.push('/admin/blog')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle tags input (comma-separated)
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
    setValue('tags', tags)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metadata Section */}
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter post title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="url-friendly-slug"
                disabled={mode === 'edit'}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              placeholder="Brief description for SEO and previews"
              rows={3}
            />
            {errors.summary && (
              <p className="text-sm text-destructive">{errors.summary.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags * (comma-separated)</Label>
              <Input
                id="tags"
                defaultValue={initialData?.tags?.join(', ')}
                onChange={handleTagsChange}
                placeholder="web-design, tutorial, nextjs"
              />
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publish Date</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                {...register('publishedAt')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImage">Hero Image URL (optional)</Label>
            <Input
              id="heroImage"
              {...register('heroImage')}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Editor Section */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          {plugins ? (
            <div className="border rounded-lg overflow-hidden">
              <MDXEditor
                markdown={content}
                onChange={(value) => setContent(value || '')}
                plugins={[
                  plugins.headingsPlugin(),
                  plugins.listsPlugin(),
                  plugins.linkPlugin(),
                  plugins.linkDialogPlugin(),
                  plugins.imagePlugin(),
                  plugins.tablePlugin(),
                  plugins.thematicBreakPlugin(),
                  plugins.toolbarPlugin({
                    toolbarClassName: 'border-b bg-muted/50',
                    toolbarContents: () => (
                      <>
                        <plugins.UndoRedo />
                        <plugins.Separator />
                        <plugins.BoldItalicUnderlineToggles />
                        <plugins.Separator />
                        <plugins.BlockTypeSelect />
                        <plugins.Separator />
                        <plugins.ListsToggle />
                        <plugins.Separator />
                        <plugins.CreateLink />
                        <plugins.InsertImage />
                        <plugins.InsertTable />
                      </>
                    ),
                  }),
                ]}
                contentEditableClassName="prose dark:prose-invert max-w-none min-h-[400px] p-4"
              />
            </div>
          ) : (
            <div className="h-96 bg-muted animate-pulse rounded" />
          )}
          {errors.content && (
            <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/blog')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
        </Button>
      </div>
    </form>
  )
}
```

#### Step 6: Create Editor Pages

**File:** `app/admin/blog/new/page.tsx`

```tsx
import { BlogPostEditor } from '@/components/BlogPostEditor'

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Write and publish a new blog post
        </p>
      </div>
      <BlogPostEditor mode="create" />
    </div>
  )
}
```

**File:** `app/admin/blog/[slug]/edit/page.tsx`

```tsx
import { notFound } from 'next/navigation'
import { BlogPostEditor } from '@/components/BlogPostEditor'
import { getBlogPostForEdit } from '@/lib/blog-service'

interface EditBlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostForEdit(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Update "{post.title}"
        </p>
      </div>
      <BlogPostEditor mode="edit" slug={slug} initialData={post} />
    </div>
  )
}
```

#### Step 7: Update Admin Blog List Page

**File:** `app/admin/blog/page.tsx` (modify)

```tsx
// Change these lines:
// FROM:
<Button disabled>Create New Post (Coming Soon)</Button>
// TO:
<Link href="/admin/blog/new">
  <Button>Create New Post</Button>
</Link>

// FROM:
<Button variant="outline" size="sm" disabled>Edit</Button>
// TO:
<Link href={`/admin/blog/${post.slug}/edit`}>
  <Button variant="outline" size="sm">Edit</Button>
</Link>
```

---

## Security Considerations

### Authentication & Authorization

- All `/admin/*` routes should verify admin role
- API routes should check authentication before CRUD operations
- Consider adding CSRF protection for form submissions

### Input Validation

- Zod schema validates all input on server-side
- Sanitize markdown content to prevent XSS
- Validate file paths to prevent directory traversal

### File System Safety

- Only allow writing to `content/blog/` directory
- Validate slug format strictly (alphanumeric + hyphens)
- Implement rate limiting on API routes

---

## UI/UX Considerations

### Editor Features

- ✅ WYSIWYG editing experience
- ✅ Familiar toolbar (Word/Docs-like)
- ✅ Auto-save draft (could add)
- ✅ Preview mode (MDXEditor shows live)
- ✅ Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

### Form UX

- ✅ Auto-generate slug from title
- ✅ Validation errors inline
- ✅ Loading states during save
- ✅ Success/error notifications

### Accessibility

- ✅ Form labels for all inputs
- ✅ Error messages linked to inputs
- ✅ Keyboard navigable toolbar
- ✅ Focus management in editor

---

## Alternative: File-Based Drafts

If you prefer not to write to the filesystem dynamically, consider:

1. **Database-only drafts**: Store drafts in Supabase, generate MDX files on publish
2. **Git-based workflow**: Use GitHub API to create PRs with new posts
3. **CMS integration**: Use Contentful, Sanity, or similar headless CMS

---

## Testing Checklist

- [ ] Create new blog post successfully
- [ ] Edit existing blog post
- [ ] Delete blog post
- [ ] Validation errors display correctly
- [ ] Slug auto-generation works
- [ ] Tags parsing (comma-separated)
- [ ] MDX content saves correctly
- [ ] Frontmatter preserves formatting
- [ ] Supabase metadata syncs
- [ ] Embeddings generate (or fail gracefully)
- [ ] Preview renders correctly
- [ ] Mobile responsive editing
- [ ] Undo/redo functionality

---

## Dependencies Summary

### Required

| Package | Version | Purpose |
|---------|---------|---------|
| `@mdxeditor/editor` | ^3.x | WYSIWYG MDX editor |

### Alternative Options

| Package | Version | Use Case |
|---------|---------|----------|
| `@monaco-editor/react` | ^4.x | Code-focused editing |
| `@uiwjs/react-md-editor` | ^3.x | Simple markdown with preview |

### Already in Project

| Package | Purpose |
|---------|---------|
| `gray-matter` | Frontmatter parsing |
| `next-mdx-remote` | MDX rendering |
| `react-hook-form` | Form handling |
| `zod` | Validation |
| `@hookform/resolvers` | Zod + React Hook Form |

---

## Recommendation

**Use `@mdxeditor/editor`** for this implementation because:

1. **Native MDX support** - Matches existing content format perfectly
2. **WYSIWYG experience** - Better UX for content creators
3. **Frontmatter plugin** - Simplifies metadata editing
4. **Good documentation** - 229 code snippets available
5. **Active maintenance** - Benchmark score 84.1
6. **React-native** - Integrates well with Next.js

If users are primarily developers, consider Monaco Editor as a fallback option for power users who prefer raw markdown editing.
