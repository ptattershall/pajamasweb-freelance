'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createRetainerCheckout } from '@/app/actions/checkout'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

interface ServiceData {
  title: string
  summary: string
  price_from_cents: number
}

function SubscriptionCheckoutContent() {
  const searchParams = useSearchParams()
  const serviceSlug = searchParams.get('service')
  const userEmail = searchParams.get('email')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<ServiceData | null>(null)
  const [email, setEmail] = useState(userEmail || '')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!serviceSlug) {
      setError('No service specified')
      setLoading(false)
      return
    }
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${serviceSlug}`)
        if (!res.ok) throw new Error('Service not found')
        const data = await res.json()
        setService(data)
      } catch {
        setError('Service not found')
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [serviceSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !serviceSlug) return
    setSubmitting(true)
    setError(null)
    try {
      await createRetainerCheckout({
        serviceSlug,
        userEmail: email,
        userId: `anonymous-${Date.now()}`,
        userName: name || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error && !service) {
    return (
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <h1 className="mb-4 text-2xl font-bold text-red-900">Error</h1>
            <p className="mb-6 text-red-700">{error}</p>
            <Link
              href="/services"
              className="inline-block rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-700"
            >
              Back to Services
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={serviceSlug ? `/services/${serviceSlug}` : '/services'}
          className="mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service
        </Link>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-slate-900">
                Subscribe to Retainer
              </h1>
              {service && (
                <p className="text-slate-600">{service.title}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {service && (
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-2 font-semibold text-slate-900">{service.title}</h3>
                  <p className="mb-3 text-sm text-slate-600">{service.summary}</p>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-slate-600">Monthly</span>
                    <span className="text-xl font-bold text-slate-900">
                      ${(service.price_from_cents / 100).toFixed(2)}/mo
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redirecting to checkout...
                  </span>
                ) : (
                  'Continue to Stripe Checkout'
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500">
              <span className="flex items-center gap-2">Secure checkout</span>
              <span className="flex items-center gap-2">Powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto flex items-center justify-center px-4 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        </main>
      }
    >
      <SubscriptionCheckoutContent />
    </Suspense>
  )
}
