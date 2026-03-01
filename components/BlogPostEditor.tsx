'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { blogPostSchema, type BlogPostInput } from '@/lib/validation-schemas'
import { ForwardRefEditor } from './ForwardRefEditor'
import type { MDXEditorMethods } from '@mdxeditor/editor'

interface BlogPostEditorProps {
  initialData?: Partial<BlogPostInput>
  mode: 'create' | 'edit'
  slug?: string
}

export function BlogPostEditor({ initialData, mode, slug }: BlogPostEditorProps) {
  const router = useRouter()
  const editorRef = useRef<MDXEditorMethods>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      publishedAt: initialData?.publishedAt || new Date().toISOString().split('T')[0],
      tags: initialData?.tags || [],
      heroImage: initialData?.heroImage || '',
      content: initialData?.content || '# Your Blog Post\n\nStart writing your content here...',
    },
  })

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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    setValue('tags', tags)
  }

  const onSubmit = async (data: BlogPostInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const content = editorRef.current?.getMarkdown() || data.content
    const submitData = { ...data, content }

    try {
      const url =
        mode === 'create'
          ? '/api/admin/blog-posts'
          : `/api/admin/blog-posts/${slug}`

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save blog post')
      }

      setSuccess(mode === 'create' ? 'Blog post created successfully!' : 'Blog post updated successfully!')
      
      setTimeout(() => {
        router.push('/admin/blog')
        router.refresh()
      }, 1000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter post title"
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="url-friendly-slug"
                disabled={mode === 'edit'}
                aria-describedby={errors.slug ? 'slug-error' : undefined}
              />
              {errors.slug && (
                <p id="slug-error" className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                URL: /blog/{watch('slug') || 'your-slug'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              placeholder="Brief description for SEO and previews (20-500 characters)"
              rows={3}
              aria-describedby={errors.summary ? 'summary-error' : undefined}
            />
            {errors.summary && (
              <p id="summary-error" className="text-sm text-destructive">
                {errors.summary.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags * (comma-separated)</Label>
              <Input
                id="tags"
                defaultValue={initialData?.tags?.join(', ')}
                onChange={handleTagsChange}
                placeholder="web-design, tutorial, nextjs"
                aria-describedby={errors.tags ? 'tags-error' : undefined}
              />
              {errors.tags && (
                <p id="tags-error" className="text-sm text-destructive">
                  {errors.tags.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publish Date *</Label>
              <Input
                id="publishedAt"
                type="date"
                {...register('publishedAt')}
                aria-describedby={errors.publishedAt ? 'publishedAt-error' : undefined}
              />
              {errors.publishedAt && (
                <p id="publishedAt-error" className="text-sm text-destructive">
                  {errors.publishedAt.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImage">Hero Image URL (optional)</Label>
            <Input
              id="heroImage"
              {...register('heroImage')}
              placeholder="https://example.com/image.jpg"
              aria-describedby={errors.heroImage ? 'heroImage-error' : undefined}
            />
            {errors.heroImage && (
              <p id="heroImage-error" className="text-sm text-destructive">
                {errors.heroImage.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <ForwardRefEditor
              ref={editorRef}
              markdown={initialData?.content || '# Your Blog Post\n\nStart writing your content here...'}
              onChange={(value) => setValue('content', value)}
            />
          </div>
          {errors.content && (
            <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/blog')}
        >
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const previewSlug = watch('slug')
              if (previewSlug) {
                window.open(`/blog/${previewSlug}`, '_blank')
              }
            }}
            disabled={!watch('slug') || mode === 'create'}
          >
            Preview
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Post'
                : 'Update Post'}
          </Button>
        </div>
      </div>
    </form>
  )
}
