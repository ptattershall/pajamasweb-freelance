import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllBlogPosts } from '@/lib/content'
import { format } from 'date-fns'

export default async function BlogManagement() {
  const posts = getAllBlogPosts()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">Manage your blog posts</p>
        </div>
        <Link href="/admin/blog/new">
          <Button>Create New Post</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Posts</CardTitle>
          <CardDescription>{posts.length} total posts</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No blog posts found.</p>
              <Link href="/admin/blog/new">
                <Button>Create Your First Post</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {post.summary}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Published: {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/blog/${post.slug}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

