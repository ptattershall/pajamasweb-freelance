/**
 * Admin Deliverable Upload API Route
 * Allows admin to upload deliverables for clients
 */

import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { uploadFile } from '@/lib/storage-service'
import { deliverableUploadSchema } from '@/lib/validation-schemas'
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
    const description = formData.get('description') as string
    const projectId = formData.get('projectId') as string

    // Validate input with Zod
    const validation = deliverableUploadSchema.safeParse({ clientId, title, description, projectId })
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
      bucket: 'deliverables',
      fileName: file.name,
      file,
      contentType: file.type,
    })

    // Create deliverable record in database
    const { data: deliverable, error: dbError } = await supabase
      .from('deliverables')
      .insert({
        client_id: clientId,
        project_id: projectId || null,
        title,
        description: description || null,
        file_url: uploadResult.path,
        file_size: file.size,
        file_type: file.type,
        delivered_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    return NextResponse.json({
      success: true,
      deliverable,
    })
  } catch (error) {
    console.error('Error uploading deliverable:', error)
    return NextResponse.json(
      { error: 'Failed to upload deliverable' },
      { status: 500 }
    )
  }
}

