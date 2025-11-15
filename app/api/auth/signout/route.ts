/**
 * Sign Out API Route
 * 
 * Handles user sign out and clears session cookies
 */

import { signOut } from '@/lib/auth-service'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Sign out from Supabase
    await signOut()

    // Create response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    // Clear the auth token cookie
    response.cookies.delete('auth-token')

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign out failed' },
      { status: 500 }
    )
  }
}

