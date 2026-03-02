'use client'

import { ReactNode } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface StripeProviderProps {
  children: ReactNode
  clientSecret: string
  amount?: number
  currency?: string
}

export function StripeProvider({
  children,
  clientSecret,
}: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input:focus': {
          border: '1px solid #2563eb',
          boxShadow: '0 0 0 1px #2563eb',
        },
        '.Label': {
          fontWeight: '500',
          color: '#475569',
          marginBottom: '8px',
        },
        '.Tab': {
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
        },
        '.Tab:hover': {
          border: '1px solid #cbd5e1',
        },
        '.Tab--selected': {
          border: '1px solid #2563eb',
          boxShadow: '0 0 0 1px #2563eb',
        },
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}

interface StripeProviderDeferredProps {
  children: ReactNode
  amount: number
  currency?: string
}

export function StripeProviderDeferred({
  children,
  amount,
  currency = 'usd',
}: StripeProviderDeferredProps) {
  const options = {
    mode: 'payment' as const,
    amount,
    currency,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
