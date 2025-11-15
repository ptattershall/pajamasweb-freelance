'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UploadedFile {
  path: string
  url: string
  name: string
  size: number
  type: string
}

interface ImageUploadProps {
  folder?: 'blog' | 'case-studies'
  onUploadSuccess?: (file: UploadedFile) => void
  onUploadError?: (error: string) => void
}

export function ImageUpload({
  folder = 'blog',
  onUploadSuccess,
  onUploadError,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setMessage({
        type: 'success',
        text: `${file.name} uploaded successfully`,
      })

      setUploadedFiles((prev) => [...prev, data.file])
      onUploadSuccess?.(data.file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setMessage({
        type: 'error',
        text: errorMessage,
      })
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleDelete = async (path: string) => {
    try {
      const response = await fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      setUploadedFiles((prev) => prev.filter((f) => f.path !== path))
      setMessage({
        type: 'success',
        text: 'Image deleted successfully',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete image',
      })
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-medium mb-2">Drag and drop your image here</p>
        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={uploading}>
            <span>{uploading ? 'Uploading...' : 'Select Image'}</span>
          </Button>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Uploaded Images</h3>
          {uploadedFiles.map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between p-3 border border-border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.path)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

