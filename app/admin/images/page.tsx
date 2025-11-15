'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ImageUpload'

export default function ImageManagement() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Image Management</h1>
        <p className="text-muted-foreground mt-2">Upload and manage hero images for blog posts and case studies</p>
      </div>

      {/* Blog Images */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Post Hero Images</CardTitle>
          <CardDescription>Upload hero images for blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload folder="blog" />
        </CardContent>
      </Card>

      {/* Case Study Images */}
      <Card>
        <CardHeader>
          <CardTitle>Case Study Hero Images</CardTitle>
          <CardDescription>Upload hero images for case studies</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload folder="case-studies" />
        </CardContent>
      </Card>
    </div>
  )
}

