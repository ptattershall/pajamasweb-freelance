/**
 * Invoice Detail Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, ExternalLink, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PaymentHistoryItem {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  payment_method_details?: any
  receipt_url?: string
}

interface InvoiceDetail {
  id: string
  amount_cents: number
  currency: string
  status: string
  due_date: string | null
  paid_at: string | null
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  created_at: string
  payment_history?: PaymentHistoryItem[]
  stripe_details?: {
    number: string
    customer_email: string
    subtotal: number
    tax: number | null
    total: number
    lines: Array<{
      description: string
      amount: number
      quantity: number
      price: any
    }>
  }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/portal/invoices/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setInvoice(data)
        } else {
          console.error('Failed to fetch invoice')
        }
      } catch (error) {
        console.error('Error fetching invoice:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchInvoice()
    }
  }, [params.id])

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return 'default'
      case 'open':
      case 'pending':
        return 'secondary'
      case 'draft':
        return 'outline'
      case 'void':
      case 'uncollectible':
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading invoice details...
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Invoice not found
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">Invoice Details</h1>
          {invoice.stripe_details?.number && (
            <p className="text-muted-foreground mt-1">
              Invoice #{invoice.stripe_details.number}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {invoice.invoice_pdf && (
            <Button variant="outline" asChild>
              <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                <Download size={18} className="mr-2" />
                Download PDF
              </a>
            </Button>
          )}
          {invoice.hosted_invoice_url && invoice.status === 'open' && (
            <Button asChild>
              <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={18} className="mr-2" />
                Pay Invoice
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoice.amount_cents, invoice.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusVariant(invoice.status)} className="text-sm">
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {formatDate(invoice.due_date)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      {invoice.stripe_details?.lines && invoice.stripe_details.lines.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.stripe_details.lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>{line.description}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(line.amount, invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
                {invoice.stripe_details.tax !== null && invoice.stripe_details.tax > 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-right font-medium">Tax</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.stripe_details.tax, invoice.currency)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(invoice.stripe_details.total, invoice.currency)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {invoice.payment_history && invoice.payment_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payment_history.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatTimestamp(payment.created)}</TableCell>
                    <TableCell>
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.payment_method_details?.type === 'card' && (
                        <span>
                          {payment.payment_method_details.card.brand.toUpperCase()} ****
                          {payment.payment_method_details.card.last4}
                        </span>
                      )}
                      {payment.payment_method_details?.type !== 'card' && (
                        <span>{payment.payment_method_details?.type || 'N/A'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.receipt_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                            View Receipt
                          </a>
                        </Button>
                      )}
                    </TableCell>
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


