/**
 * Sign Up API Route
 */

import { signUp } from '@/lib/auth-service'
import { signUpSchema } from '@/lib/validation-schemas'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const validation = signUpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, display_name, company } = validation.data

    // Sign up user
    const result = await signUp({
      email,
      password,
      display_name,
      company,
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign up failed' },
      { status: 400 }
    )
  }
}

