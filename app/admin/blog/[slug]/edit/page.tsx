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
          Update &ldquo;{post.title}&rdquo;
        </p>
      </div>
      <BlogPostEditor mode="edit" slug={slug} initialData={post} />
    </div>
  )
}
