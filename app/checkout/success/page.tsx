'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, AlertCircle, Download, ArrowLeft, Loader2 } from 'lucide-react'

interface PaymentDetails {
  id: string
  status: string
  amount: number
  currency: string
  created: number
  receiptEmail: string | null
  description: string | null
  metadata: {
    serviceName?: string
    serviceId?: string
    type?: string
  }
  paymentMethod: {
    type?: string
  } | null
  dbPayment: {
    id: string
    status: string
    createdAt: string
  } | null
}

type PaymentStatus = 'loading' | 'succeeded' | 'processing' | 'failed' | 'error'

function formatCurrency(cents: number, currency: string = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusIcon({ status }: { status: PaymentStatus }) {
  switch (status) {
    case 'succeeded':
      return (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      )
    case 'processing':
      return (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Clock className="h-10 w-10 text-blue-600" />
        </div>
      )
    case 'failed':
      return (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
      )
    case 'error':
      return (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-10 w-10 text-amber-600" />
        </div>
      )
    default:
      return (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Loader2 className="h-10 w-10 animate-spin text-slate-600" />
        </div>
      )
  }
}

function StatusContent({
  status,
  paymentDetails,
  errorMessage,
  paymentType,
}: {
  status: PaymentStatus
  paymentDetails: PaymentDetails | null
  errorMessage: string | null
  paymentType: string
}) {
  const statusConfig = {
    succeeded: {
      title: paymentType === 'subscription' ? 'Subscription Active!' : 'Payment Successful!',
      description:
        paymentType === 'subscription'
          ? 'Your retainer subscription is now active. You will be charged according to your plan until you cancel.'
          : `Thank you for your ${paymentType === 'deposit' ? 'deposit' : 'payment'}. Your transaction has been processed successfully.`,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      titleColor: 'text-green-900',
      textColor: 'text-green-700',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      buttonBorder: 'border-green-600 text-green-600 hover:bg-green-50',
    },
    processing: {
      title: 'Payment Processing',
      description: "Your payment is being processed. We'll send you a confirmation email once it's complete.",
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      buttonBorder: 'border-blue-600 text-blue-600 hover:bg-blue-50',
    },
    failed: {
      title: 'Payment Failed',
      description: 'We were unable to process your payment. Please try again or use a different payment method.',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      buttonBorder: 'border-red-600 text-red-600 hover:bg-red-50',
    },
    error: {
      title: 'Something Went Wrong',
      description: errorMessage || 'We encountered an issue while verifying your payment.',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-700',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      buttonBorder: 'border-amber-600 text-amber-600 hover:bg-amber-50',
    },
    loading: {
      title: 'Verifying Payment...',
      description: 'Please wait while we confirm your payment.',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      titleColor: 'text-slate-900',
      textColor: 'text-slate-600',
      buttonBg: 'bg-slate-600 hover:bg-slate-700',
      buttonBorder: 'border-slate-600 text-slate-600 hover:bg-slate-50',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-8`}>
      <div className="flex flex-col items-center text-center">
        <StatusIcon status={status} />

        <h1 className={`mt-6 text-3xl font-bold ${config.titleColor}`}>
          {config.title}
        </h1>

        <p className={`mt-3 max-w-md ${config.textColor}`}>
          {config.description}
        </p>

        {status === 'succeeded' && paymentDetails && (
          <>
            <div className="mt-8 w-full max-w-sm space-y-4 rounded-lg bg-white p-6 text-left shadow-sm">
              <h3 className="font-semibold text-slate-900">Payment Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                  </span>
                </div>

                {paymentDetails.metadata?.serviceName && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-600">Service</span>
                    <span className="text-slate-900">{paymentDetails.metadata.serviceName}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Date</span>
                  <span className="text-slate-900">{formatDate(paymentDetails.created)}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Reference</span>
                  <span className="font-mono text-xs text-slate-900">
                    {paymentDetails.id.slice(0, 24)}...
                  </span>
                </div>

                {paymentDetails.receiptEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Receipt sent to</span>
                    <span className="text-slate-900">{paymentDetails.receiptEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-sm text-slate-600">
              A confirmation email has been sent to your email address.
            </p>
          </>
        )}

        {status === 'processing' && paymentDetails && (
          <div className="mt-8 w-full max-w-sm rounded-lg bg-white p-6 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">
                  Processing {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                </p>
                <p className="text-sm text-slate-600">
                  Reference: {paymentDetails.id.slice(0, 20)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/checkout/deposit${paymentDetails?.metadata?.serviceId ? `?service=${paymentDetails.metadata.serviceId}` : ''}`}
              className={`inline-flex items-center justify-center gap-2 rounded-lg ${config.buttonBg} px-6 py-3 font-semibold text-white transition-colors`}
            >
              Try Again
            </Link>
            <Link
              href="/services"
              className={`inline-flex items-center justify-center gap-2 rounded-lg border ${config.buttonBorder} px-6 py-3 font-semibold transition-colors`}
            >
              Back to Services
            </Link>
          </div>
        )}

        {(status === 'succeeded' || status === 'processing') && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row flex-wrap">
            {paymentType === 'subscription' && (
              <Link
                href="/portal/subscriptions"
                className={`inline-flex items-center justify-center gap-2 rounded-lg ${config.buttonBg} px-6 py-3 font-semibold text-white transition-colors`}
              >
                Manage subscription
              </Link>
            )}
            <Link
              href="/services"
              className={`inline-flex items-center justify-center gap-2 rounded-lg ${paymentType === 'subscription' ? 'border ' + config.buttonBorder : config.buttonBg + ' text-white'} px-6 py-3 font-semibold transition-colors`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>
            <Link
              href="/"
              className={`inline-flex items-center justify-center gap-2 rounded-lg border ${config.buttonBorder} px-6 py-3 font-semibold transition-colors`}
            >
              Go Home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/services"
              className={`inline-flex items-center justify-center gap-2 rounded-lg ${config.buttonBg} px-6 py-3 font-semibold text-white transition-colors`}
            >
              Back to Services
            </Link>
            <Link
              href="/"
              className={`inline-flex items-center justify-center gap-2 rounded-lg border ${config.buttonBorder} px-6 py-3 font-semibold transition-colors`}
            >
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  
  const paymentIntentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')
  const sessionId = searchParams.get('session_id')
  const paymentType = searchParams.get('type') || 'deposit'

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (redirectStatus === 'failed') {
        setPaymentStatus('failed')
        setErrorMessage('Your payment could not be processed.')
        return
      }

      if (paymentIntentId) {
        try {
          const response = await fetch(`/api/stripe/retrieve-payment-intent?payment_intent=${paymentIntentId}`)
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to retrieve payment details')
          }

          const data = await response.json()
          setPaymentDetails(data)

          switch (data.status) {
            case 'succeeded':
              setPaymentStatus('succeeded')
              break
            case 'processing':
              setPaymentStatus('processing')
              break
            case 'requires_payment_method':
            case 'requires_confirmation':
            case 'requires_action':
            case 'canceled':
              setPaymentStatus('failed')
              break
            default:
              setPaymentStatus('error')
              setErrorMessage(`Unexpected payment status: ${data.status}`)
          }
        } catch (err) {
          console.error('Error fetching payment details:', err)
          setPaymentStatus('error')
          setErrorMessage(err instanceof Error ? err.message : 'Failed to verify payment')
        }
        return
      }

      if (sessionId) {
        try {
          const { retrieveCheckoutSession } = await import('@/app/actions/checkout')
          const session = await retrieveCheckoutSession(sessionId)
          
          setPaymentDetails({
            id: session.id,
            status: session.payment_status || 'unknown',
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            created: Math.floor(Date.now() / 1000),
            receiptEmail: session.customer_email,
            description: null,
            metadata: {
              serviceName: session.metadata?.serviceName,
              serviceId: session.metadata?.serviceId,
              type: session.metadata?.type,
            },
            paymentMethod: null,
            dbPayment: null,
          })

          if (session.payment_status === 'paid') {
            setPaymentStatus('succeeded')
          } else if (session.payment_status === 'unpaid') {
            setPaymentStatus('failed')
          } else {
            setPaymentStatus('processing')
          }
        } catch (err) {
          console.error('Error fetching session details:', err)
          setPaymentStatus('error')
          setErrorMessage(err instanceof Error ? err.message : 'Failed to verify payment')
        }
        return
      }

      setPaymentStatus('succeeded')
    }

    fetchPaymentDetails()
  }, [paymentIntentId, sessionId, redirectStatus])

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-lg">
          <StatusContent
            status={paymentStatus}
            paymentDetails={paymentDetails}
            errorMessage={errorMessage}
            paymentType={paymentType}
          />

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secure Payment
            </div>
            <div className="flex items-center gap-2">
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
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto flex items-center justify-center px-4 py-16">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-slate-600">Verifying your payment...</p>
            </div>
          </div>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
