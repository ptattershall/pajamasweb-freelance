'use client'

import { useState } from 'react'
import { createDepositCheckout, createRetainerCheckout } from '@/app/actions/checkout'
import Link from 'next/link'
import { Service } from '@/lib/supabase'

interface ServiceCheckoutButtonsProps {
  service: Service
  showEmbeddedCheckout?: boolean
}

export default function ServiceCheckoutButtons({ 
  service, 
  showEmbeddedCheckout = true 
}: ServiceCheckoutButtonsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [checkoutType, setCheckoutType] = useState<'deposit' | 'retainer' | null>(null)

  const handleCheckout = async (type: 'deposit' | 'retainer') => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = 'anonymous-' + Date.now()

      if (type === 'deposit') {
        await createDepositCheckout({
          serviceSlug: service.slug,
          userEmail: email,
          userId,
        })
      } else {
        await createRetainerCheckout({
          serviceSlug: service.slug,
          userEmail: email,
          userId,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setLoading(false)
    }
  }

  const handleShowForm = (type: 'deposit' | 'retainer') => {
    setCheckoutType(type)
    setShowForm(true)
  }

  if (!showForm) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {showEmbeddedCheckout ? (
            <Link
              href={`/checkout/deposit?service=${service.slug}`}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Pay Deposit
            </Link>
          ) : (
            <button
              onClick={() => handleShowForm('deposit')}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              Pay Deposit
            </button>
          )}
          {showEmbeddedCheckout ? (
            <Link
              href={`/checkout/subscription?service=${service.slug}`}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border-2 border-blue-600 px-6 py-3 text-center font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Subscribe to Retainer
            </Link>
          ) : (
            <button
              onClick={() => handleShowForm('retainer')}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
              disabled={loading}
            >
              Subscribe to Retainer
            </button>
          )}
        </div>
        {showEmbeddedCheckout && (
          <p className="text-center text-xs text-slate-500">
            Or{' '}
            <button
              onClick={() => handleShowForm('deposit')}
              className="text-blue-600 underline hover:text-blue-700"
            >
              use Stripe checkout
            </button>{' '}
            for a hosted payment page
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8">
      <h3 className="mb-6 text-2xl font-bold text-slate-900">
        {checkoutType === 'deposit' ? 'Pay Deposit' : 'Subscribe to Retainer'}
      </h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
<button
        onClick={() => handleCheckout(checkoutType || 'deposit')}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : checkoutType === 'deposit' ? 'Pay Deposit' : 'Subscribe'}
        </button>
        <button
          onClick={() => {
            setShowForm(false)
            setCheckoutType(null)
            setError(null)
          }}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

