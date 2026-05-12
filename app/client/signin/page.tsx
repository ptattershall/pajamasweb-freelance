import { redirect } from 'next/navigation'
import { isSafeRedirect } from '@/lib/auth-routing'

interface ClientSignInRedirectPageProps {
  searchParams: Promise<{
    message?: string
    redirect?: string
  }>
}

export default async function ClientSignInRedirectPage({
  searchParams,
}: ClientSignInRedirectPageProps) {
  const params = await searchParams
  const nextParams = new URLSearchParams()

  if (params.message) {
    nextParams.set('message', params.message)
  }

  if (isSafeRedirect(params.redirect ?? null)) {
    nextParams.set('redirect', params.redirect)
  }

  const queryString = nextParams.toString()
  redirect(queryString ? `/auth/signin?${queryString}` : '/auth/signin')
}
