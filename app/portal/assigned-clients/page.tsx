/**
 * Contractor portal: list of clients assigned to the current user (SALES or DEV).
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AssignedClient {
  assignmentId: string
  clientId: string
  startedAt: string
  display_name: string | null
  company: string | null
  created_at: string | null
}

export default function AssignedClientsPage() {
  const [clients, setClients] = useState<AssignedClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/portal/assigned-clients')
        if (response.status === 403) {
          setError('You do not have access to this page.')
          setClients([])
          return
        }
        if (!response.ok) {
          setError('Failed to load assigned clients.')
          return
        }
        const data = await response.json()
        setClients(data.clients ?? [])
      } catch {
        setError('Failed to load assigned clients.')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (error) {
    return (
      <div>
        <h1 className="text-4xl font-bold mb-4">Assigned Clients</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold">Assigned Clients</h1>
        <Link href="/portal/bookings">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            View My Bookings
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <Users size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-center text-muted-foreground">No clients assigned to you yet.</p>
            <p className="text-center text-muted-foreground text-sm mt-2">
              New leads are assigned by the admin via rotation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.assignmentId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={20} />
                  {client.display_name || 'Unnamed client'}
                </CardTitle>
                {client.company && (
                  <p className="text-sm text-muted-foreground">{client.company}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Assigned since {new Date(client.startedAt).toLocaleDateString()}
                </p>
                <Link href="/portal/bookings">
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <Calendar size={14} className="mr-2" />
                    View my bookings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
