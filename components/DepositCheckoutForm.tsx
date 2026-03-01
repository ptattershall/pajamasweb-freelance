'use client'

import { useState, FormEvent } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

interface DepositCheckoutFormProps {
  amount: number
  currency?: string
  serviceName?: string
  returnUrl: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function DepositCheckoutForm({
  amount,
  currency = 'usd',
  serviceName,
  returnUrl,
  onSuccess,
  onError,
}: DepositCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message || 'Please check your payment details')
      setIsProcessing(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    })

    if (error) {
      const message = error.message || 'An error occurred during payment'
      setErrorMessage(message)
      onError?.(message)
      setIsProcessing(false)
    } else if (paymentIntent) {
      if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('succeeded')
        onSuccess?.()
      } else if (paymentIntent.status === 'processing') {
        setPaymentStatus('processing')
      } else if (paymentIntent.status === 'requires_action') {
        setPaymentStatus('requires_action')
      }
      setIsProcessing(false)
    }
  }

  if (paymentStatus === 'succeeded') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
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
        <h3 className="mb-2 text-lg font-semibold text-green-900">
          Payment Successful!
        </h3>
        <p className="text-green-700">
          Your payment of {formatAmount(amount)} has been processed.
        </p>
      </div>
    )
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
        <div className="mb-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-blue-900">
          Processing Payment
        </h3>
        <p className="text-blue-700">
          Your payment is being processed. You'll receive a confirmation shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="rounded-lg bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">
            {serviceName ? `Deposit for ${serviceName}` : 'Deposit Payment'}
          </span>
          <span className="text-xl font-bold text-slate-900">
            {formatAmount(amount)}
          </span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : (
          `Pay ${formatAmount(amount)}`
        )}
      </button>

      {/* Security Notice */}
      <p className="text-center text-xs text-slate-500">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}
