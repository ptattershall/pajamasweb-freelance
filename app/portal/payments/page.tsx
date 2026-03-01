/**
 * Client Portal Payments History Page
 * 
 * Displays a comprehensive list of all payments made by the client
 * with filtering by status and type
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { CreditCard, CheckCircle, Clock, XCircle, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Payment {
  id: string
  intent_id: string
  type: 'deposit' | 'retainer' | 'invoice'
  amount_cents: number
  currency: string
  status: string
  related_service: string | null
  metadata: {
    service_name?: string
    customer_email?: string
    description?: string
    error_message?: string
  } | null
  created_at: string
  updated_at: string
}

interface PaymentsResponse {
  payments: Payment[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

type StatusFilter = 'all' | 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled'
type TypeFilter = 'all' | 'deposit' | 'retainer' | 'invoice'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 20

  const fetchPayments = useCallback(async (resetOffset = false) => {
    setLoading(true)
    try {
      const currentOffset = resetOffset ? 0 : offset
      const params = new URLSearchParams()
      
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      params.set('limit', limit.toString())
      params.set('offset', currentOffset.toString())

      const response = await fetch(`/api/portal/payments?${params.toString()}`)
      
      if (response.ok) {
        const data: PaymentsResponse = await response.json()
        setPayments(data.payments)
        setTotal(data.total)
        setHasMore(data.hasMore)
        if (resetOffset) setOffset(0)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter, offset])

  useEffect(() => {
    fetchPayments(true)
  }, [statusFilter, typeFilter])

  const formatCurrency = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-slate-500" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return 'default'
      case 'processing':
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit'
      case 'retainer':
        return 'Retainer'
      case 'invoice':
        return 'Invoice'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'deposit':
        return 'default'
      case 'retainer':
        return 'secondary'
      case 'invoice':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const completedPayments = payments.filter(p => 
    ['completed', 'succeeded', 'paid'].includes(p.status)
  )
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount_cents, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Payment History</h1>
          <p className="text-muted-foreground mt-1">
            View all your payments and transactions
          </p>
        </div>
        <Button onClick={() => fetchPayments(true)} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payments</CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Payments</CardDescription>
            <CardTitle className="text-2xl text-green-600">{completedPayments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Amount Paid</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalPaid)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Type:</span>
          <Select value={typeFilter} onValueChange={(value: TypeFilter) => setTypeFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="retainer">Retainer</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No payments found</p>
              <p className="text-sm">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "You haven't made any payments yet"}
              </p>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {payment.metadata?.service_name || 'Payment'}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {payment.intent_id?.slice(0, 16)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(payment.type)}>
                          {getTypeLabel(payment.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount_cents, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <Badge variant={getStatusVariant(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/portal/payments/${payment.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {(hasMore || offset > 0) && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {offset + 1} - {Math.min(offset + payments.length, total)} of {total} payments
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOffset(Math.max(0, offset - limit))
                        fetchPayments()
                      }}
                      disabled={offset === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOffset(offset + limit)
                        fetchPayments()
                      }}
                      disabled={!hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
