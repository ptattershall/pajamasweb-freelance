'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { isSafeRedirect, routeAfterSignIn } from '@/lib/auth-routing'
import type { ProfileRole } from '@/lib/validation-schemas'

const roleValues: ProfileRole[] = ['OWNER', 'CLIENT', 'SALES', 'DEV']

const isProfileRole = (role: unknown): role is ProfileRole => {
  return typeof role === 'string' && roleValues.includes(role as ProfileRole)
}

const buildSigninUrl = (redirectTarget: string | null): string => {
  const params = new URLSearchParams()
  if (isSafeRedirect(redirectTarget)) {
    params.set('redirect', redirectTarget)
  }

  const queryString = params.toString()
  return queryString ? `/auth/signin?${queryString}` : '/auth/signin'
}

const DashboardRedirectContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const resolveDashboard = async () => {
      setError(null)

      try {
        const response = await fetch('/api/portal/profile', {
          cache: 'no-store',
        })

        if (response.status === 401) {
          router.replace(buildSigninUrl(redirectTarget))
          return
        }

        if (!response.ok) {
          throw new Error('We could not find your workspace.')
        }

        const profile: { role?: unknown } = await response.json()
        const role = isProfileRole(profile.role) ? profile.role : null
        const nextRoute = routeAfterSignIn(role, redirectTarget)

        router.replace(nextRoute)
      } catch (err) {
        if (!isMounted) return
        setError(
          err instanceof Error
            ? err.message
            : 'We could not finish preparing your workspace.'
        )
      }
    }

    resolveDashboard()

    return () => {
      isMounted = false
    }
  }, [redirectTarget, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <section
        aria-labelledby="redirect-title"
        aria-describedby="redirect-description"
        className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        </div>

        <div aria-live="polite" aria-busy={!error}>
          <h1 id="redirect-title" className="text-2xl font-semibold">
            Preparing your workspace
          </h1>
          <p
            id="redirect-description"
            className="mt-2 text-sm text-muted-foreground"
          >
            We&apos;re confirming your access and loading the right dashboard.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-6 text-left">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Button
            type="button"
            className="mt-6 w-full"
            onClick={() => router.replace('/auth/signin')}
            aria-label="Return to sign in"
          >
            Return to sign in
          </Button>
        )}
      </section>
    </main>
  )
}

export default function DashboardRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
          <div className="text-center" aria-live="polite" aria-busy="true">
            <Loader2
              className="mx-auto mb-4 h-10 w-10 animate-spin text-primary"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Preparing your workspace...
            </p>
          </div>
        </main>
      }
    >
      <DashboardRedirectContent />
    </Suspense>
  )
}
