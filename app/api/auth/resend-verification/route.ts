/**
 * Resend Verification Email API Route
 */

import { resendVerificationEmail } from '@/lib/auth-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Resend verification email
    await resendVerificationEmail(email)

    return NextResponse.json(
      { success: true, message: 'Verification email sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resend verification email' },
      { status: 400 }
    )
  }
}

