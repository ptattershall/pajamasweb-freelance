# API Reference

## Image Upload API

### Upload Image

**Endpoint:** `POST /api/images/upload`

**Request:**
```
Content-Type: multipart/form-data

file: File (required)
folder: 'blog' | 'case-studies' (optional, default: 'blog')
```

**Response (Success):**
```json
{
  "success": true,
  "file": {
    "path": "blog/1699564800000-image.jpg",
    "url": "https://...",
    "name": "image.jpg",
    "size": 102400,
    "type": "image/jpeg"
  }
}
```

**Response (Error):**
```json
{
  "error": "File size must be less than 5MB"
}
```

**Validation:**
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Folders: blog, case-studies

### Delete Image

**Endpoint:** `POST /api/images/delete`

**Request:**
```json
{
  "path": "blog/1699564800000-image.jpg"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Response (Error):**
```json
{
  "error": "Delete failed"
}
```

## Search API

### Search Content

**Endpoint:** `GET /api/search`

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): 'blog' | 'case-studies' | 'all' (default: 'all')
- `tags` (optional): Comma-separated tags

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "slug": "post-slug",
      "title": "Post Title",
      "summary": "Post summary",
      "type": "blog",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

## Database Functions

### Image Functions

```typescript
// Upload image to storage
uploadImage(file: File, folder: 'blog' | 'case-studies')

// Delete image from storage
deleteImage(path: string)

// Get public URL for image
getImageUrl(path: string)

// List images in folder
listImages(folder?: 'blog' | 'case-studies')

// Insert image metadata
insertImageMetadata(image: ImageMetadata)

// Associate image with blog post
associateImageWithBlogPost(slug: string, imageId: string, isHero?: boolean)

// Associate image with case study
associateImageWithCaseStudy(slug: string, imageId: string, isHero?: boolean)

// Get images for blog post
getBlogPostImages(slug: string)

// Get images for case study
getCaseStudyImages(slug: string)
```

### Content Functions

```typescript
// Get all blog posts
getAllBlogPosts()

// Get blog post by slug
getBlogPostBySlug(slug: string)

// Get all case studies
getAllCaseStudies()

// Get case study by slug
getCaseStudyBySlug(slug: string)

// Search blog posts
searchBlogPosts(query: string)

// Search case studies
searchCaseStudies(query: string)

// Get posts by tag
getBlogPostsByTag(tag: string)

// Get studies by tag
getCaseStudiesByTag(tag: string)
```

## Component Usage

### ImageUpload Component

```tsx
import { ImageUpload } from '@/components/ImageUpload'

export function MyComponent() {
  return (
    <ImageUpload
      folder="blog"
      onUploadSuccess={(file) => console.log('Uploaded:', file)}
      onUploadError={(error) => console.error('Error:', error)}
    />
  )
}
```

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | No file provided | Include file in request |
| 400 | File size too large | Reduce file size to < 5MB |
| 400 | Invalid file type | Use JPEG, PNG, WebP, or GIF |
| 400 | Invalid folder | Use 'blog' or 'case-studies' |
| 500 | Upload failed | Check Supabase connection |
| 500 | Delete failed | Verify file path exists |

