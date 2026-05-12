/**
 * Redirect to new auth signin page
 */

import { redirect } from 'next/navigation'
import { isSafeRedirect } from '@/lib/auth-routing'

interface SignInPageProps {
  searchParams: Promise<{
    message?: string
    redirect?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const redirectTarget = params.redirect ?? null
  const nextParams = new URLSearchParams()

  if (params.message) {
    nextParams.set('message', params.message)
  }

  if (isSafeRedirect(redirectTarget)) {
    nextParams.set('redirect', redirectTarget)
  }

  const queryString = nextParams.toString()
  redirect(queryString ? `/auth/signin?${queryString}` : '/auth/signin')
}
