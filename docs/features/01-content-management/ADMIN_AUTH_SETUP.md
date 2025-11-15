# Admin Authentication Setup Guide

## Overview

This guide walks through setting up authentication for the admin dashboard using Supabase Auth.

## Current Status

- ✅ Login page created at `/admin/login`
- ✅ Middleware for route protection created
- ⏳ Supabase Auth integration pending

## Step 1: Enable Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Ensure **Email** provider is enabled
4. Configure email settings if needed

## Step 2: Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Invite user**
3. Enter admin email address
4. Supabase will send an invitation email
5. Admin completes signup process

## Step 3: Implement Auth in Code

Update `lib/supabase.ts` with auth functions:

```typescript
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

## Step 4: Update Login Page

Replace the placeholder in `app/admin/login/page.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    const { session } = await signInWithEmail(email, password)
    
    // Set auth cookie
    document.cookie = `auth-token=${session.access_token}; path=/`
    
    // Redirect to admin
    router.push(redirect)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed')
  } finally {
    setLoading(false)
  }
}
```

## Step 5: Update Middleware

Update `middleware.ts` to validate tokens:

```typescript
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || ''
)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jwtVerify(token, secret)
    } catch (err) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}
```

## Step 6: Add Logout

Create logout endpoint at `app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}
```

## Step 7: Test Authentication

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Should redirect to `/admin/login`
4. Enter admin credentials
5. Should redirect to dashboard

## Environment Variables

Add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

## Security Considerations

- ✅ Passwords never stored in code
- ✅ JWT tokens validated server-side
- ✅ Protected routes require authentication
- ✅ Tokens stored in secure HTTP-only cookies
- ⏳ Add rate limiting to login endpoint
- ⏳ Add CSRF protection

## Next Steps

1. Implement Supabase Auth integration
2. Add logout functionality
3. Add password reset flow
4. Add user management
5. Add role-based access control

See `docs/NEXT_STEPS.md` for more details.

