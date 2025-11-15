/**
 * Forgot Password API Route
 */

import { sendPasswordResetEmail } from '@/lib/auth-service'
import { forgotPasswordSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const validation = forgotPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Send password reset email
    await sendPasswordResetEmail(email)

    return NextResponse.json(
      { success: true, message: 'Password reset email sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send reset email' },
      { status: 400 }
    )
  }
}

