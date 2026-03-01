import { BlogPostEditor } from '@/components/BlogPostEditor'

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Write and publish a new blog post to your site
        </p>
      </div>
      <BlogPostEditor mode="create" />
    </div>
  )
}
