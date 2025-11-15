/**
 * Contract Download API Route
 * Generates signed URL for secure file download
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { generateSignedUrl } from '@/lib/storage-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Verify ownership of contract
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('client_id', user.id)
      .single()

    if (fetchError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for the file
    const signedUrlResult = await generateSignedUrl({
      bucket: 'contracts',
      filePath: contract.file_url,
      expiresIn: 3600, // 1 hour
    })

    return NextResponse.json({
      success: true,
      signedUrl: signedUrlResult.signedUrl,
      fileName: contract.title,
      fileType: contract.file_type,
      fileSize: contract.file_size,
      signed: !!contract.signed_at,
    })
  } catch (error) {
    console.error('Error generating download URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}

