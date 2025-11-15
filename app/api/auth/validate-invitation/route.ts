/**
 * Validate Invitation API Route
 * 
 * GET /api/auth/validate-invitation?token=xxx
 * 
 * Validates an invitation token and returns the invitation details.
 * This is a public endpoint (no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateInvitation } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    const validation = await validateInvitation(token)

    if (!validation.valid || !validation.invitation) {
      return NextResponse.json(
        { error: validation.error || 'Invalid invitation' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        valid: true,
        email: validation.invitation.email,
        expiresAt: validation.invitation.expires_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Validate invitation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to validate invitation' },
      { status: 500 }
    )
  }
}

