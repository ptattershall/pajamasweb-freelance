/**
 * Client Portal Invoices Page
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

interface Invoice {
  id: string
  amount_cents: number
  currency: string
  status: string
  due_date: string | null
  paid_at: string | null
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  created_at: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/portal/invoices?status=${filter}`)
        if (response.ok) {
          const data = await response.json()
          setInvoices(data)
        }
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [filter])

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'open':
        return 'secondary'
      case 'draft':
        return 'outline'
      case 'void':
      case 'uncollectible':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Invoices</h1>
        <Link href="/book">
          <Button>Schedule Meeting</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'paid', 'draft'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-muted-foreground" />
                        <span>Invoice {invoice.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.amount_cents, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.due_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download PDF"
                            >
                              <Download size={18} />
                            </a>
                          </Button>
                        )}
                        {invoice.hosted_invoice_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Invoice"
                            >
                              <ExternalLink size={18} />
                            </a>
                          </Button>
                        )}
                        <Link href={`/portal/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

