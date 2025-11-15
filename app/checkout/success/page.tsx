'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { retrieveCheckoutSession } from '@/app/actions/checkout'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    const fetchSession = async () => {
      try {
        const data = await retrieveCheckoutSession(sessionId)
        setSession(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to retrieve session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
            <p className="text-slate-600">Processing your payment...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-green-900">
            Payment Successful!
          </h1>

          <p className="mb-6 text-green-700">
            Thank you for your payment. Your transaction has been processed.
          </p>

          {session && (
            <div className="mb-6 rounded-lg bg-white p-4 text-left">
              <div className="mb-2 flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-semibold text-slate-900">
                  ${((session.amount_total || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-slate-600">Session ID:</span>
                <span className="font-mono text-sm text-slate-900">
                  {session.id.slice(0, 20)}...
                </span>
              </div>
              {session.customer_email && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="text-slate-900">{session.customer_email}</span>
                </div>
              )}
            </div>
          )}

          <p className="mb-6 text-sm text-slate-600">
            A confirmation email has been sent to your email address.
          </p>

          <Link
            href="/services"
            className="inline-block rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"
          >
            Back to Services
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
