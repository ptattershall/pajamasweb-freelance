import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, getImageUrl } from '@/lib/supabase'
import { imageUploadSchema } from '@/lib/validation-schemas'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'blog'

    // Validate folder parameter with Zod
    const folderValidation = imageUploadSchema.safeParse({ folder })
    if (!folderValidation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: folderValidation.error.flatten() },
        { status: 400 }
      )
    }

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Use validated folder value
    const validatedFolder = folderValidation.data.folder

    // Upload file
    const uploadedFile = await uploadImage(file, validatedFolder)
    const publicUrl = await getImageUrl(uploadedFile.path)

    return NextResponse.json(
      {
        success: true,
        file: {
          path: uploadedFile.path,
          url: publicUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

