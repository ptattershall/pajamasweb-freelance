'use client'

/**
 * Admin Payment Dashboard
 *
 * Revenue metrics, subscription status, payment history, and CSV export.
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  DollarSign,
  Users,
  RefreshCw,
  Download,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Payment {
  id: string
  client_id?: string
  intent_id?: string
  type: 'deposit' | 'retainer' | 'invoice'
  amount_cents: number
  currency?: string
  status: string
  related_service?: string | null
  metadata?: { service_name?: string; customer_email?: string } | null
  created_at?: string
}

interface Subscription {
  id?: string
  client_id: string | null
  stripe_subscription_id: string
  status: string
  amount_cents: number
  currency: string
  interval: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  created_at?: string
}

interface Metrics {
  totalRevenueCents: number
  completedCount: number
}

type StatusFilter = 'all' | 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled' | 'succeeded' | 'paid'
type TypeFilter = 'all' | 'deposit' | 'retainer' | 'invoice'

const COMPLETED_STATUSES = ['completed', 'succeeded', 'paid']

export default function AdminPaymentsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [metricsPeriod, setMetricsPeriod] = useState<'all' | 'month'>('all')
  const [payments, setPayments] = useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subsTotal, setSubsTotal] = useState(0)
  const [paymentsTotal, setPaymentsTotal] = useState(0)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [loadingSubs, setLoadingSubs] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [paymentsOffset, setPaymentsOffset] = useState(0)
  const [paymentsHasMore, setPaymentsHasMore] = useState(false)
  const limit = 20

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true)
    try {
      const params = new URLSearchParams()
      if (metricsPeriod === 'month') {
        const start = new Date()
        start.setMonth(start.getMonth() - 1)
        params.set('dateFrom', start.toISOString())
        params.set('dateTo', new Date().toISOString())
      }
      const res = await fetch(`/api/admin/payments/metrics?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics({ totalRevenueCents: data.totalRevenueCents, completedCount: data.completedCount })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMetrics(false)
    }
  }, [metricsPeriod])

  const fetchPayments = useCallback(
    async (offsetOverride?: number) => {
      setLoadingPayments(true)
      try {
        const offset = offsetOverride !== undefined ? offsetOverride : paymentsOffset
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (typeFilter !== 'all') params.set('type', typeFilter)
        params.set('limit', String(limit))
        params.set('offset', String(offset))
        const res = await fetch(`/api/admin/payments?${params}`)
        if (res.ok) {
          const data = await res.json()
          setPayments(data.payments)
          setPaymentsTotal(data.total)
          setPaymentsHasMore(data.hasMore ?? false)
          setPaymentsOffset(offset)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingPayments(false)
      }
    },
    [statusFilter, typeFilter, paymentsOffset]
  )

  const fetchSubscriptions = useCallback(async () => {
    setLoadingSubs(true)
    try {
      const res = await fetch('/api/admin/subscriptions?limit=50&offset=0')
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data.subscriptions ?? [])
        setSubsTotal(data.total ?? 0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSubs(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    fetchPayments(0)
  }, [statusFilter, typeFilter])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleExport = useCallback(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    window.open(`/api/admin/payments/export?${params}`, '_blank', 'noopener,noreferrer')
  }, [statusFilter, typeFilter])

  const formatCurrency = (cents: number, currency: string = 'usd') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(
      cents / 100
    )

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getStatusIcon = (status: string) => {
    if (COMPLETED_STATUSES.includes(status)) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (['processing', 'pending'].includes(status)) return <Clock className="h-4 w-4 text-blue-500" />
    if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />
    if (status === 'cancelled') return <AlertCircle className="h-4 w-4 text-amber-500" />
    return <Clock className="h-4 w-4 text-slate-500" />
  }

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (COMPLETED_STATUSES.includes(status)) return 'default'
    if (['processing', 'pending'].includes(status)) return 'secondary'
    if (status === 'failed') return 'destructive'
    return 'outline'
  }

  const getTypeLabel = (type: string) =>
    type === 'deposit' ? 'Deposit' : type === 'retainer' ? 'Retainer' : type === 'invoice' ? 'Invoice' : type

  const activeSubs = subscriptions.filter((s) => ['active', 'trialing'].includes(s.status))
  const canceledSubs = subscriptions.filter((s) => s.status === 'canceled' || s.cancel_at_period_end)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Revenue metrics, subscriptions, and payment history
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchMetrics(); fetchPayments(0); fetchSubscriptions(); }} aria-label="Refresh data">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExport} aria-label="Export payment history as CSV">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Revenue metrics */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue metrics
            </CardTitle>
            <Select
              value={metricsPeriod}
              onValueChange={(v: 'all' | 'month') => setMetricsPeriod(v)}
              aria-label="Metrics period"
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            {metricsPeriod === 'month' ? 'Completed payments in the last 30 days' : 'All-time completed payments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenueCents)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed payments</p>
                <p className="text-2xl font-bold">{metrics.completedCount}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load metrics.</p>
          )}
        </CardContent>
      </Card>

      {/* Subscription status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscription status
          </CardTitle>
          <CardDescription>
            All subscriptions across clients ({subsTotal} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSubs ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Active / Trialing</p>
                  <p className="text-xl font-semibold">{activeSubs.length}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Canceled / Ending</p>
                  <p className="text-xl font-semibold">{canceledSubs.length}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Past due / Unpaid</p>
                  <p className="text-xl font-semibold">
                    {subscriptions.filter((s) => ['past_due', 'unpaid'].includes(s.status)).length}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{subsTotal}</p>
                </div>
              </div>
              {subscriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Period end</TableHead>
                      <TableHead>Cancel at period end</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.slice(0, 15).map((sub) => (
                      <TableRow key={sub.stripe_subscription_id}>
                        <TableCell>
                          <Badge variant={sub.status === 'active' || sub.status === 'trialing' ? 'default' : 'secondary'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(sub.amount_cents, sub.currency)}</TableCell>
                        <TableCell>{sub.interval}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {sub.current_period_end ? formatDate(sub.current_period_end) : '—'}
                        </TableCell>
                        <TableCell>{sub.cancel_at_period_end ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No subscriptions found.</p>
              )}
              {subsTotal > 15 && (
                <p className="text-sm text-muted-foreground mt-2">Showing first 15 of {subsTotal}.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment history
          </CardTitle>
          <CardDescription>
            All payments with filters and pagination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(v: StatusFilter) => setStatusFilter(v)}
                aria-label="Filter by status"
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type</span>
              <Select
                value={typeFilter}
                onValueChange={(v: TypeFilter) => setTypeFilter(v)}
                aria-label="Filter by type"
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loadingPayments ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading payments…
            </div>
          ) : payments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments match the current filters.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.metadata?.service_name || 'Payment'}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {p.intent_id?.slice(0, 20)}…
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getTypeLabel(p.type)}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(p.amount_cents, p.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(p.status)}
                          <Badge variant={getStatusVariant(p.status)}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.created_at ? formatDate(p.created_at) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {paymentsOffset + 1}–{paymentsOffset + payments.length} of {paymentsTotal}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPayments(Math.max(0, paymentsOffset - limit))}
                    disabled={paymentsOffset === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPayments(paymentsOffset + limit)}
                    disabled={!paymentsHasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
