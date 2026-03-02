/**
 * Admin Contract Upload API Route
 * Allows admin to upload contracts for clients
 */

import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { uploadFile } from '@/lib/storage-service'
import { contractUploadSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const supabase = createServerSupabaseClient()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const title = formData.get('title') as string

    // Validate input with Zod
    const validation = contractUploadSchema.safeParse({ clientId, title })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Upload file to storage
    const uploadResult = await uploadFile({
      bucket: 'contracts',
      fileName: file.name,
      file,
      contentType: file.type,
    })

    // Create contract record in database
    const { data: contract, error: dbError } = await supabase
      .from('contracts')
      .insert({
        client_id: clientId,
        title,
        file_url: uploadResult.path,
        file_size: file.size,
        file_type: file.type,
        version: 1,
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    return NextResponse.json({
      success: true,
      contract,
    })
  } catch (error) {
    console.error('Error uploading contract:', error)
    return NextResponse.json(
      { error: 'Failed to upload contract' },
      { status: 500 }
    )
  }
}

