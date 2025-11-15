import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllBlogPosts } from '@/lib/content'
import { format } from 'date-fns'

export default async function BlogManagement() {
  const posts = await getAllBlogPosts()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">Manage your blog posts</p>
        </div>
        <Button disabled>Create New Post (Coming Soon)</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Posts</CardTitle>
          <CardDescription>{posts.length} total posts</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No blog posts found.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{post.summary}</p>
                    <div className="flex gap-2 mt-3">
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
                  <div className="flex gap-2 ml-4">
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
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

