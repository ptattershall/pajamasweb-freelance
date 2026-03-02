'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { StripeProvider } from '@/components/StripeProvider'
import { DepositCheckoutForm } from '@/components/DepositCheckoutForm'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

interface PaymentIntentData {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  customerId: string
}

interface ServiceData {
  title: string
  summary: string
  price_from_cents: number
}

function DepositCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const serviceSlug = searchParams.get('service')
  const customAmount = searchParams.get('amount')
  const userEmail = searchParams.get('email')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentData | null>(null)
  const [service, setService] = useState<ServiceData | null>(null)
  const [email, setEmail] = useState(userEmail || '')
  const [name, setName] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(!userEmail)

  useEffect(() => {
    if (!serviceSlug && !customAmount) {
      setError('No service or amount specified')
      setLoading(false)
      return
    }

    if (serviceSlug) {
      fetchServiceDetails()
    } else {
      setLoading(false)
    }
  }, [serviceSlug])

  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`/api/services/${serviceSlug}`)
      if (!response.ok) {
        throw new Error('Service not found')
      }
      const data = await response.json()
      setService(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service')
    } finally {
      setLoading(false)
    }
  }

  const createPaymentIntent = async () => {
    if (!email) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = `user-${Date.now()}`
      
      const body: Record<string, unknown> = {
        userId,
        userEmail: email,
        userName: name || undefined,
      }

      if (serviceSlug) {
        body.serviceSlug = serviceSlug
      } else if (customAmount) {
        body.amountCents = parseInt(customAmount, 10)
      }

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment')
      }

      const data = await response.json()
      setPaymentIntent(data)
      setShowEmailForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPaymentIntent()
  }

  const handlePaymentSuccess = () => {
    router.push('/checkout/success?type=deposit')
  }

  const amount = paymentIntent?.amount || 
    (customAmount ? parseInt(customAmount, 10) : service?.price_from_cents) || 0

  if (loading && !paymentIntent) {
    return (
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading checkout...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error && !showEmailForm) {
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
        {/* Back Button */}
        <Link
          href={serviceSlug ? `/services/${serviceSlug}` : '/services'}
          className="mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {serviceSlug ? 'Service' : 'Services'}
        </Link>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-slate-900">
                Complete Your Payment
              </h1>
              {service && (
                <p className="text-slate-600">{service.title}</p>
              )}
            </div>

            {/* Email Form */}
            {showEmailForm && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Service Summary */}
                {service && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h3 className="mb-2 font-semibold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="mb-3 text-sm text-slate-600">
                      {service.summary}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-slate-600">Deposit Amount</span>
                      <span className="text-xl font-bold text-slate-900">
                        ${(service.price_from_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {customAmount && !service && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Payment Amount</span>
                      <span className="text-xl font-bold text-slate-900">
                        ${(parseInt(customAmount, 10) / 100).toFixed(2)}
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
                  <p className="mt-1 text-xs text-slate-500">
                    We'll send your receipt to this email address
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Initializing...
                    </span>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>
              </form>
            )}

            {/* Payment Form */}
            {paymentIntent && !showEmailForm && (
              <StripeProvider
                clientSecret={paymentIntent.clientSecret}
                amount={paymentIntent.amount}
                currency={paymentIntent.currency}
              >
                <DepositCheckoutForm
                  amount={paymentIntent.amount}
                  currency={paymentIntent.currency}
                  serviceName={service?.title}
                  returnUrl={`${window.location.origin}/checkout/success?type=deposit&payment_intent=${paymentIntent.paymentIntentId}`}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setError(err)}
                />
              </StripeProvider>
            )}

            {/* Security Badges */}
            <div className="mt-8 flex items-center justify-center gap-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure Payment
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="h-4 w-4" viewBox="0 0 32 32">
                  <path
                    fill="currentColor"
                    d="M13.227 9.181c0 1.564 1.266 2.831 2.831 2.831 1.564 0 2.831-1.266 2.831-2.831 0-1.564-1.266-2.831-2.831-2.831-1.564 0-2.831 1.266-2.831 2.831zM11.697 18.986c-.398-1.312-.613-2.707-.613-4.154 0-3.225 1.056-6.201 2.839-8.609l-2.839-2.839-2.839 2.839c1.783 2.408 2.839 5.384 2.839 8.609 0 1.447-.215 2.842-.613 4.154h1.226zM16.058 25.65l-2.839 2.839 2.839 2.839 2.839-2.839-2.839-2.839zM20.303 18.986c.398-1.312.613-2.707.613-4.154 0-3.225-1.056-6.201-2.839-8.609l2.839-2.839 2.839 2.839c-1.783 2.408-2.839 5.384-2.839 8.609 0 1.447.215 2.842.613 4.154h-1.226z"
                  />
                </svg>
                Powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DepositCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto flex items-center justify-center px-4 py-16">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading checkout...</p>
            </div>
          </div>
        </main>
      }
    >
      <DepositCheckoutContent />
    </Suspense>
  )
}
