import { NextRequest, NextResponse } from 'next/server'
import { deleteImage } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json(
        { error: 'No path provided' },
        { status: 400 }
      )
    }

    // Validate path format to prevent directory traversal
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      )
    }

    await deleteImage(path)

    return NextResponse.json(
      { success: true, message: 'Image deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}

