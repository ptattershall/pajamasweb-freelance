/**
 * Subscription detail: manage, cancel, change plan
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCw,
  XCircle,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SubscriptionRecord {
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
  metadata: { service_name?: string } | null
}

interface PriceOption {
  id: string
  unit_amount: number
  currency: string
  recurring: { interval: string; interval_count: number } | null
}

export default function PortalSubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [stripeData, setStripeData] = useState<{
    cancel_at_period_end: boolean
    current_period_end: number
    current_period_start: number
  } | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [prices, setPrices] = useState<PriceOption[]>([])
  const [currentPriceId, setCurrentPriceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true)
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null)

  const resolveParams = useCallback(async () => {
    const p = await params
    setId(p.id)
  }, [params])

  useEffect(() => {
    resolveParams()
  }, [resolveParams])

  const fetchSubscription = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/subscriptions/${id}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load subscription')
      }
      const data = await res.json()
      setSubscription(data.subscription)
      setStripeData(data.stripeSubscription)
      setProductId(data.productId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchPrices = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/portal/subscriptions/${id}/prices`)
      if (!res.ok) return
      const data = await res.json()
      setPrices(data.prices || [])
      setCurrentPriceId(data.currentPriceId || null)
      setSelectedPriceId(data.prices?.[0]?.id || null)
    } catch {
      setPrices([])
    }
  }, [id])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  useEffect(() => {
    if (subscription && changePlanDialogOpen) {
      fetchPrices()
    }
  }, [subscription, changePlanDialogOpen, fetchPrices])

  const handleCancel = async () => {
    if (!id) return
    setCancelLoading(true)
    try {
      const res = await fetch(`/api/portal/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel')
      setCancelDialogOpen(false)
      fetchSubscription()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleUpdatePrice = async () => {
    if (!id || !selectedPriceId) return
    setUpdateLoading(true)
    try {
      const res = await fetch(`/api/portal/subscriptions/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPriceId: selectedPriceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update plan')
      setChangePlanDialogOpen(false)
      fetchSubscription()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
    } finally {
      setUpdateLoading(false)
    }
  }

  const formatCurrency = (cents: number, currency: string = 'usd') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const intervalLabel = (interval: string, count: number) =>
    count === 1 ? (interval === 'year' ? 'Yearly' : 'Monthly') : `Every ${count} ${interval}s`

  if (typeof id === 'undefined' || (id && loading && !subscription)) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !subscription) {
    return (
      <div>
        <Link
          href="/portal/subscriptions"
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!subscription) return null

  const isActive = ['active', 'trialing'].includes(subscription.status)
  const canceling = stripeData?.cancel_at_period_end ?? subscription.cancel_at_period_end

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/portal/subscriptions"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </Link>
        <Button onClick={fetchSubscription} variant="outline" size="sm">
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

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>
                {subscription.metadata?.service_name || 'Retainer'}
              </CardTitle>
              <CardDescription>
                {intervalLabel(subscription.interval, subscription.interval_count)} ·{' '}
                {formatCurrency(subscription.amount_cents, subscription.currency)}/
                {subscription.interval === 'year' ? 'yr' : 'mo'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {canceling && (
                <Badge variant="secondary">Canceling at period end</Badge>
              )}
              {isActive && (
                <Badge className="bg-green-600">Active</Badge>
              )}
              {!isActive && !canceling && (
                <Badge variant="outline">{subscription.status}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {stripeData && (
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Current period ends:{' '}
                {formatDate(stripeData.current_period_end)}
              </span>
            </div>
          )}

          {isActive && (
            <div className="flex flex-wrap gap-3">
              {prices.length > 0 && (
                <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Change plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change plan</DialogTitle>
                      <DialogDescription>
                        Choose a new plan. Prorations may apply.
                      </DialogDescription>
                    </DialogHeader>
                    <Select
                      value={selectedPriceId || ''}
                      onValueChange={setSelectedPriceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {prices.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.recurring
                              ? intervalLabel(
                                  p.recurring.interval,
                                  p.recurring.interval_count
                                )
                              : 'Recurring'}{' '}
                            — {formatCurrency(p.unit_amount, p.currency)}/
                            {p.recurring?.interval === 'year' ? 'yr' : 'mo'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setChangePlanDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdatePrice}
                        disabled={updateLoading || !selectedPriceId}
                      >
                        {updateLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Update plan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {!canceling ? (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel subscription</DialogTitle>
                      <DialogDescription>
                        You can cancel at the end of your billing period (keep access until then)
                        or cancel immediately.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-2">
                      <Button
                        variant={cancelAtPeriodEnd ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setCancelAtPeriodEnd(true)}
                      >
                        Cancel at end of period (
                        {stripeData
                          ? formatDate(stripeData.current_period_end)
                          : '—'}
                        ) — keep access until then
                      </Button>
                      <Button
                        variant={!cancelAtPeriodEnd ? 'destructive' : 'outline'}
                        className="justify-start"
                        onClick={() => setCancelAtPeriodEnd(false)}
                      >
                        Cancel immediately — lose access now
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCancelDialogOpen(false)}
                      >
                        Keep subscription
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Confirm cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Subscription will end on{' '}
                  {stripeData
                    ? formatDate(stripeData.current_period_end)
                    : '—'}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
