/**
 * Client Portal Payment Detail Page
 * 
 * Displays detailed information about a specific payment
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Receipt,
  Calendar,
  DollarSign,
  Mail,
  FileText,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Payment {
  id: string
  client_id: string
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
    error_code?: string
    payment_method?: string
  } | null
  created_at: string
  updated_at: string
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/portal/payments/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Payment not found')
          } else if (response.status === 403) {
            setError('You do not have permission to view this payment')
          } else {
            setError('Failed to load payment details')
          }
          return
        }

        const data = await response.json()
        setPayment(data)
      } catch (err) {
        console.error('Error fetching payment:', err)
        setError('An error occurred while loading payment details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPayment()
    }
  }, [params.id])

  const formatCurrency = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'processing':
      case 'pending':
        return <Clock className="h-6 w-6 text-blue-500" />
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="h-6 w-6 text-amber-500" />
      default:
        return <Clock className="h-6 w-6 text-slate-500" />
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return 'This payment has been successfully processed.'
      case 'processing':
        return 'This payment is currently being processed. Please check back later.'
      case 'pending':
        return 'This payment is pending and awaiting processing.'
      case 'failed':
        return 'This payment failed to process. Please try again or use a different payment method.'
      case 'cancelled':
        return 'This payment was cancelled and no charges were made.'
      default:
        return 'Payment status is being determined.'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit Payment'
      case 'retainer':
        return 'Retainer Payment'
      case 'invoice':
        return 'Invoice Payment'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Link href="/portal/payments">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </Link>

        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payment) {
    return null
  }

  const isSuccessful = ['completed', 'succeeded', 'paid'].includes(payment.status)

  return (
    <div>
      <Link href="/portal/payments">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payments
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Payment Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    isSuccessful ? 'bg-green-100' : 'bg-muted'
                  }`}>
                    {isSuccessful ? (
                      <CheckCircle className="h-7 w-7 text-green-600" />
                    ) : (
                      <CreditCard className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {formatCurrency(payment.amount_cents, payment.currency)}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {getTypeLabel(payment.type)}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getStatusVariant(payment.status)} className="text-sm py-1 px-3">
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                {getStatusIcon(payment.status)}
                <p className="text-sm text-muted-foreground">
                  {getStatusDescription(payment.status)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Payment ID
                  </p>
                  <p className="font-mono text-sm">{payment.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Stripe Reference
                  </p>
                  <p className="font-mono text-sm">{payment.intent_id || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(payment.amount_cents, payment.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </p>
                  <p className="font-medium">{formatDate(payment.created_at)}</p>
                </div>
              </div>

              {payment.metadata?.customer_email && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Receipt Email
                    </p>
                    <p className="font-medium">{payment.metadata.customer_email}</p>
                  </div>
                </>
              )}

              {payment.metadata?.description && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{payment.metadata.description}</p>
                  </div>
                </>
              )}

              {payment.metadata?.error_message && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-destructive font-medium">Error Details</p>
                    <p className="text-sm text-destructive/80">
                      {payment.metadata.error_message}
                    </p>
                    {payment.metadata.error_code && (
                      <p className="text-xs text-muted-foreground font-mono">
                        Code: {payment.metadata.error_code}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Information */}
          {payment.metadata?.service_name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="font-medium">{payment.metadata.service_name}</p>
                  {payment.related_service && (
                    <Link href={`/services/${payment.related_service}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Service
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payment.status === 'failed' && (
                <Link href="/services" className="block">
                  <Button className="w-full">
                    Try Again
                  </Button>
                </Link>
              )}
              <Link href="/portal/invoices">
                <Button variant="outline" className="w-full">
                  View Invoices
                </Button>
              </Link>
              <Link href="/portal/payments">
                <Button variant="ghost" className="w-full">
                  All Payments
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="w-px h-full bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Payment Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                </div>

                {payment.updated_at !== payment.created_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-2 w-2 rounded-full ${
                        isSuccessful ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {isSuccessful ? 'Payment Completed' : 'Status Updated'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
