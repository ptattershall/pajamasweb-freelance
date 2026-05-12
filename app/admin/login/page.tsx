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
  const redirectTarget = isSafeRedirect(params.redirect ?? null)
    ? params.redirect
    : '/admin'

  const nextParams = new URLSearchParams({
    redirect: redirectTarget,
  })

  redirect(`/auth/signin?${nextParams.toString()}`)
}

