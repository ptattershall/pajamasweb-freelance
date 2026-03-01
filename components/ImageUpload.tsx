'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageCropDialog } from '@/components/ImageCropDialog'

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

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

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

  // Crop dialog state
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF'
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setMessage({ type: 'error', text: validationError })
      return
    }

    // Clear any previous state
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Set up for cropping
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowCropDialog(true)
    setMessage(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
      handleFileSelect(files[0])
    }
  }

  const handleCropComplete = async (croppedFile: File) => {
    setShowCropDialog(false)

    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)

    // Upload the cropped file
    await handleUpload(croppedFile)
  }

  const handleCropCancel = () => {
    setShowCropDialog(false)

    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)
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
    } catch {
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
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
        <p className="text-foreground font-medium mb-2">Drag and drop your image here</p>
        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
        <p className="text-xs text-muted-foreground mb-4">
          Supports JPEG, PNG, WebP, GIF (max 5MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${folder}`}
          aria-label="Select image file"
        />
        <label htmlFor={`file-upload-${folder}`}>
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
              <div className="flex items-center gap-3">
                {/* Thumbnail preview */}
                <div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Replace with icon if image fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <ImageIcon
                    className="hidden h-6 w-6 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.path)}
                aria-label={`Delete ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Crop Dialog */}
      {showCropDialog && previewUrl && selectedFile && (
        <ImageCropDialog
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageSrc={previewUrl}
          fileName={selectedFile.name}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
