'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, RotateCcw, Trash2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  company: string
  status: 'active' | 'pending'
  createdAt: string
  acceptedAt: string | null
}

interface Invitation {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'expired'
  createdAt: string
  expiresAt: string
  acceptedAt: string | null
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchClientDetails()
  }, [clientId])

  async function fetchClientDetails() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/clients/${clientId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch client details')
      }

      const data = await response.json()
      setClient(data.client)
      setInvitations(data.invitations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendInvitation(invitationId: string) {
    try {
      setActionLoading(invitationId)

      const response = await fetch(`/api/admin/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 7 }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend invitation')
      }

      // Refresh client details
      await fetchClientDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRevokeInvitation(invitationId: string) {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return
    }

    try {
      setActionLoading(invitationId)

      const response = await fetch(`/api/admin/invitations/${invitationId}/revoke`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to revoke invitation')
      }

      // Refresh client details
      await fetchClientDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(null)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Link href="/admin/clients">
          <Button variant="outline">Back to Clients</Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Client not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground mt-2">{client.email}</p>
        </div>
        <Link href="/admin/clients">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{client.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{client.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Company</p>
            <p className="font-medium">{client.company || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="mt-1">
              {client.status === 'active' ? 'Active' : 'Pending'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Joined</p>
            <p className="font-medium">{formatDate(client.createdAt)}</p>
          </div>
          {client.acceptedAt && (
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="font-medium">{formatDate(client.acceptedAt)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            Invitation history for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-muted-foreground">No invitations found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Accepted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Badge variant={inv.status === 'accepted' ? 'default' : inv.status === 'expired' ? 'destructive' : 'secondary'}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(inv.createdAt)}</TableCell>
                    <TableCell className="text-sm">{formatDate(inv.expiresAt)}</TableCell>
                    <TableCell className="text-sm">{inv.acceptedAt ? formatDate(inv.acceptedAt) : '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {inv.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(inv.id)}
                            disabled={actionLoading === inv.id}
                          >
                            {actionLoading === inv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-1" />
                                Resend
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeInvitation(inv.id)}
                            disabled={actionLoading === inv.id}
                          >
                            {actionLoading === inv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Revoke
                              </>
                            )}
                          </Button>
                        </>
                      )}
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

