import { redirect } from 'next/navigation'
import { isSafeRedirect } from '@/lib/auth-routing'

interface AdminLoginPageProps {
  searchParams: Promise<{
    redirect?: string
  }>
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams
  const redirectParam = params.redirect ?? null
  const redirectTarget = isSafeRedirect(redirectParam)
    ? redirectParam
    : '/admin'

  const nextParams = new URLSearchParams()
  nextParams.set('redirect', redirectTarget)

  redirect(`/auth/signin?${nextParams.toString()}`)
}

