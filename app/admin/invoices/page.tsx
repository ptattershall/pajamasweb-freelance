'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileText, ArrowLeft } from 'lucide-react'

interface ClientOption {
  id: string
  name: string | null
  email: string | null
  company: string | null
}

export default function AdminInvoicesPage() {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientId, setClientId] = useState<string>('')
  const [amountDollars, setAmountDollars] = useState('')
  const [description, setDescription] = useState('')
  const [daysUntilDue, setDaysUntilDue] = useState('30')
  const [sendEmail, setSendEmail] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ hostedUrl: string | null; invoiceId: string } | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/admin/clients?status=active&limit=100')
        if (!res.ok) return
        const data = await res.json()
        if (data.clients) {
          setClients(
            data.clients.map((c: { id: string; name: string | null; email?: string | null; company?: string | null }) => ({
              id: c.id,
              name: c.name ?? c.email ?? 'Unknown',
              email: c.email ?? null,
              company: c.company ?? null,
            }))
          )
        }
      } catch {
        setClients([])
      } finally {
        setClientsLoading(false)
      }
    }
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const amount = Math.round(parseFloat(amountDollars) * 100)
    if (!clientId || !Number.isFinite(amount) || amount < 50) {
      setError('Please select a client and enter a valid amount (at least $0.50).')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          amountCents: amount,
          description: description || undefined,
          daysUntilDue: parseInt(daysUntilDue, 10) || 30,
          currency: 'usd',
          sendEmail,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }
      setSuccess({
        hostedUrl: data.hostedInvoiceUrl ?? null,
        invoiceId: data.invoice?.id ?? '',
      })
      setAmountDollars('')
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Create and send a Stripe invoice to a client
          </p>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
          <FileText className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Invoice created successfully.
            {success.hostedUrl && (
              <span className="block mt-2">
                <a
                  href={success.hostedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  View invoice in Stripe
                </a>
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Invoice</CardTitle>
          <CardDescription>
            Select a client, enter amount and optional description. The client will receive an email with a link to pay (if &quot;Send email&quot; is checked).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={clientId}
                onValueChange={setClientId}
                disabled={clientsLoading}
                required
              >
                <SelectTrigger id="client" aria-label="Select client">
                  <SelectValue placeholder={clientsLoading ? 'Loading…' : 'Select a client'} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.email ? ` (${c.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.5"
                placeholder="0.00"
                value={amountDollars}
                onChange={(e) => setAmountDollars(e.target.value)}
                required
                aria-label="Invoice amount in dollars"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="e.g. Website redesign – Phase 1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                aria-label="Invoice description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Days until due</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={365}
                value={daysUntilDue}
                onChange={(e) => setDaysUntilDue(e.target.value)}
                aria-label="Days until payment due"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="sendEmail"
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-input"
                aria-label="Send invoice email to client"
              />
              <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
                Send invoice email to client
              </Label>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create & Send Invoice'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
