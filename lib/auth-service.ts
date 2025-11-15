/**
 * Authentication Service
 * 
 * Handles user authentication, profile management, and session management
 * for the Client Portal feature.
 */

import { createClient } from '@supabase/supabase-js'

export interface UserProfile {
  user_id: string
  role: 'OWNER' | 'CLIENT'
  display_name: string | null
  company: string | null
  avatar_url: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface SignUpData {
  email: string
  password: string
  display_name: string
  company?: string
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Create a Supabase client for server-side operations
 */
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Create a Supabase client for client-side operations
 */
export function createClientSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData) {
  const supabase = createClientSupabaseClient()

  try {
    // Create auth user with email confirmation required
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`,
        data: {
          display_name: data.display_name,
          company: data.company || null,
        },
      },
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user')
    }

    // Create profile (will be created via database trigger or manually)
    // Note: If using Supabase Auth triggers, this might be automatic
    const serverSupabase = createServerSupabaseClient()
    const { error: profileError } = await serverSupabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        display_name: data.display_name,
        company: data.company || null,
        role: 'CLIENT',
        email_verified: false,
      })

    if (profileError) {
      // Profile might already exist from trigger, ignore duplicate errors
      if (!profileError.message.includes('duplicate')) {
        throw new Error(profileError.message)
      }
    }

    return { user: authData.user, success: true }
  } catch (error) {
    throw error
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as UserProfile
}

/**
 * Verify email
 */
export async function verifyEmail(userId: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('profiles')
    .update({ email_verified: true })
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = createClientSupabaseClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClientSupabaseClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  const supabase = createClientSupabaseClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClientSupabaseClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  // Upload file
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new Error(error.message)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(filePath: string) {
  const supabase = createClientSupabaseClient()

  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath])

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

/**
 * Get authenticated user from request cookies (for API routes)
 * This is the secure way to get the current user in API routes
 */
export async function getAuthenticatedUser(request: Request) {
  try {
    // Get the auth token from cookies
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return { user: null, error: 'No session found' }
    }

    // Parse cookies to get auth-token
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const authToken = cookies['auth-token']
    if (!authToken) {
      return { user: null, error: 'No session found' }
    }

    // Create Supabase client and verify the session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error } = await supabase.auth.getUser(authToken)

    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid session' }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: 'Failed to authenticate' }
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  const supabase = createClientSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

/**
 * Generate a secure random token for invitations
 */
export function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Create an invitation for a client
 */
export async function createInvitation(
  email: string,
  createdBy: string,
  expiresInDays: number = 7
) {
  const supabase = createServerSupabaseClient()
  const token = generateInvitationToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  try {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        email,
        token,
        created_by: createdBy,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { invitation: data, token, success: true }
  } catch (error) {
    throw error
  }
}

/**
 * Validate an invitation token
 */
export async function validateInvitation(token: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !data) {
      return { valid: false, error: 'Invitation not found' }
    }

    // Check if invitation is expired
    if (new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'Invitation has expired' }
    }

    // Check if invitation is already accepted
    if (data.status === 'accepted') {
      return { valid: false, error: 'Invitation has already been used' }
    }

    // Check if invitation is expired status
    if (data.status === 'expired') {
      return { valid: false, error: 'Invitation has expired' }
    }

    return { valid: true, invitation: data, error: null }
  } catch (error) {
    return { valid: false, error: 'Failed to validate invitation' }
  }
}

/**
 * Accept an invitation and create a user account
 */
export async function acceptInvitation(
  token: string,
  password: string,
  displayName: string,
  company?: string
) {
  const supabase = createServerSupabaseClient()

  try {
    // Validate invitation first
    const validation = await validateInvitation(token)
    if (!validation.valid || !validation.invitation) {
      throw new Error(validation.error || 'Invalid invitation')
    }

    const invitation = validation.invitation

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user')
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        display_name: displayName,
        company: company || null,
        role: 'CLIENT',
        email_verified: true,
        invited_by: invitation.created_by,
        invitation_accepted_at: new Date().toISOString(),
      })

    if (profileError) {
      throw new Error(profileError.message)
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: authData.user.id,
      })
      .eq('token', token)

    if (updateError) {
      console.error('Failed to update invitation status:', updateError)
    }

    return { user: authData.user, success: true }
  } catch (error) {
    throw error
  }
}

