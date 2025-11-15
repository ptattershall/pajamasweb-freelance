/**
 * Reset Password API Route
 */

import { updatePassword } from '@/lib/auth-service'
import { resetPasswordSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const validation = resetPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { password } = validation.data

    // Update password
    await updatePassword(password)

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset password' },
      { status: 400 }
    )
  }
}

