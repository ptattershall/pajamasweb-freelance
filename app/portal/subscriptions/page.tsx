/**
 * Client Portal Subscriptions Page
 * Lists active and past subscriptions with manage, upgrade/downgrade, and cancel actions
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Repeat,
  RefreshCw,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Subscription {
  id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: string
  amount_cents: number
  currency: string
  interval: 'month' | 'year'
  interval_count: number
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  related_service: string | null
  metadata: { service_name?: string } | null
  created_at: string
}

export default function PortalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/portal/subscriptions')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load subscriptions')
      }
      const data = await res.json()
      setSubscriptions(data.subscriptions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const formatCurrency = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (sub: Subscription) => {
    const status = sub.status
    const canceling = sub.cancel_at_period_end
    if (canceling && (status === 'active' || status === 'trialing')) {
      return <Badge variant="secondary">Canceling at period end</Badge>
    }
    switch (status) {
      case 'active':
      case 'trialing':
        return <Badge className="bg-green-600">Active</Badge>
      case 'past_due':
      case 'unpaid':
        return <Badge variant="destructive">Past due</Badge>
      case 'canceled':
      case 'cancelled':
        return <Badge variant="outline">Canceled</Badge>
      case 'incomplete':
      case 'incomplete_expired':
        return <Badge variant="secondary">Incomplete</Badge>
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const intervalLabel = (interval: string, count: number) => {
    if (count === 1) return interval === 'year' ? 'Yearly' : 'Monthly'
    return `Every ${count} ${interval}s`
  }

  const activeSubscriptions = subscriptions.filter((s) =>
    ['active', 'trialing'].includes(s.status)
  )
  const otherSubscriptions = subscriptions.filter(
    (s) => !['active', 'trialing'].includes(s.status)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Subscriptions</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your retainer subscriptions
          </p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {subscriptions.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Repeat className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No subscriptions yet</h3>
            <p className="mb-6 max-w-sm text-center text-muted-foreground">
              When you subscribe to a retainer from a service, it will appear here.
            </p>
            <Link href="/services">
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Browse services
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {activeSubscriptions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active subscriptions</CardTitle>
            <CardDescription>Manage billing and plan changes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current period end</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">
                        {sub.metadata?.service_name || 'Retainer'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {intervalLabel(sub.interval, sub.interval_count)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(sub.amount_cents, sub.currency)}/
                      {sub.interval === 'year' ? 'yr' : 'mo'}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(sub.current_period_end)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/portal/subscriptions/${sub.stripe_subscription_id}`}
                      >
                        <Button variant="ghost" size="sm">
                          Manage
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {otherSubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past & other subscriptions</CardTitle>
            <CardDescription>Canceled or inactive</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period end</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      {sub.metadata?.service_name || 'Retainer'}{' '}
                      <span className="text-muted-foreground">
                        ({intervalLabel(sub.interval, sub.interval_count)})
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(sub.amount_cents, sub.currency)}/
                      {sub.interval === 'year' ? 'yr' : 'mo'}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub)}</TableCell>
                    <TableCell>{formatDate(sub.current_period_end)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
