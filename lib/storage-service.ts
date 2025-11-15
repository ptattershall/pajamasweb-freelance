/**
 * Storage Service
 * Handles file uploads, downloads, and signed URL generation for Supabase Storage
 */

import { createServerSupabaseClient, createClientSupabaseClient } from './auth-service'

export interface FileUploadOptions {
  bucket: 'deliverables' | 'contracts'
  fileName: string
  file: File | Buffer
  contentType?: string
}

export interface SignedUrlOptions {
  bucket: 'deliverables' | 'contracts'
  filePath: string
  expiresIn?: number // seconds, default 3600 (1 hour)
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: FileUploadOptions) {
  const { bucket, fileName, file, contentType } = options
  const supabase = createServerSupabaseClient()

  // Generate unique file path with timestamp
  const timestamp = Date.now()
  const filePath = `${timestamp}-${fileName}`

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: contentType || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    return {
      success: true,
      path: data.path,
      bucket,
      fileName,
    }
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

/**
 * Generate a signed URL for downloading a file
 * Signed URLs are time-limited and secure
 */
export async function generateSignedUrl(options: SignedUrlOptions) {
  const { bucket, filePath, expiresIn = 3600 } = options
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`)
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      expiresIn,
    }
  } catch (error) {
    console.error('Signed URL generation error:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: 'deliverables' | 'contracts', filePath: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('File deletion error:', error)
    throw error
  }
}

/**
 * Get public URL for a file (for public buckets)
 */
export function getPublicUrl(bucket: 'deliverables' | 'contracts', filePath: string) {
  const supabase = createClientSupabaseClient()

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * List files in a bucket
 */
export async function listFiles(bucket: 'deliverables' | 'contracts', path: string = '') {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)

    if (error) {
      throw new Error(`List failed: ${error.message}`)
    }

    return {
      success: true,
      files: data,
    }
  } catch (error) {
    console.error('File listing error:', error)
    throw error
  }
}

