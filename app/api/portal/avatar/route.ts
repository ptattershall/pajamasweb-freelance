/**
 * Avatar Upload API Route
 */

import { getAuthenticatedUser, uploadAvatar, deleteAvatar, updateUserProfile, createServerSupabaseClient } from '@/lib/auth-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const userId = user.id

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Get current avatar URL to delete old one
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single()

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      try {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath) {
          await deleteAvatar(`avatars/${oldPath}`)
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error)
        // Continue even if deletion fails
      }
    }

    // Upload new avatar
    const { url } = await uploadAvatar(userId, file)

    // Update profile with new avatar URL
    await updateUserProfile(userId, { avatar_url: url })

    return NextResponse.json(
      { success: true, avatar_url: url },
      { status: 200 }
    )
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user from session
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const userId = user.id

    // Get current avatar URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single()

    if (!profile?.avatar_url) {
      return NextResponse.json(
        { error: 'No avatar to delete' },
        { status: 404 }
      )
    }

    // Delete avatar from storage
    const filePath = profile.avatar_url.split('/').pop()
    if (filePath) {
      await deleteAvatar(`avatars/${filePath}`)
    }

    // Update profile to remove avatar URL
    await updateUserProfile(userId, { avatar_url: null })

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete avatar' },
      { status: 500 }
    )
  }
}

