'use client'

import { useState } from 'react'
import { createDepositCheckout, createRetainerCheckout } from '@/app/actions/checkout'
import { useRouter } from 'next/navigation'
import { Service } from '@/lib/supabase'

export default function ServiceCheckoutButtons({ service }: { service: Service }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const handleCheckout = async (type: 'deposit' | 'retainer') => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get user ID from session or use anonymous
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

  if (!showForm) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={() => setShowForm(true)}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Pay Deposit
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="flex-1 rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
          disabled={loading}
        >
          Subscribe to Retainer
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8">
      <h3 className="mb-6 text-2xl font-bold text-slate-900">Get Started</h3>

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
          onClick={() => handleCheckout('deposit')}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay Deposit'}
        </button>
        <button
          onClick={() => handleCheckout('retainer')}
          className="flex-1 rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Subscribe'}
        </button>
        <button
          onClick={() => {
            setShowForm(false)
            setError(null)
          }}
          className="flex-1 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

