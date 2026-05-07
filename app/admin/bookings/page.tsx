'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Calendar, ExternalLink } from 'lucide-react'

interface AdminBooking {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  attendee_email: string
  attendee_name: string | null
  location: string | null
  meeting_link: string | null
  status: 'confirmed' | 'cancelled' | 'rescheduled'
  provider: 'calcom' | 'gcal' | 'manual'
  created_by: string | null
  client_id: string | null
  created_at: string
}

type Tab = 'upcoming' | 'past' | 'all'

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

const formatDuration = (start: string, end: string): string => {
  const minutes = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  )
  return `${minutes} min`
}

const statusVariant = (
  status: AdminBooking['status']
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (status === 'cancelled') return 'destructive'
  if (status === 'rescheduled') return 'outline'
  return 'default'
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [tab, setTab] = useState<Tab>('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchBookings = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/bookings?tab=${tab}`)
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed to fetch meetings')
        }
        const data: AdminBooking[] = await response.json()
        if (!cancelled) setBookings(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load meetings')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBookings()
    return () => {
      cancelled = true
    }
  }, [tab])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground mt-2">
            Schedule meetings and review the calendar invites you&apos;ve sent.
          </p>
        </div>
        <Link href="/admin/bookings/new">
          <Button>Schedule Meeting</Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{tab === 'upcoming' ? 'Upcoming meetings' : tab === 'past' ? 'Past meetings' : 'All meetings'}</CardTitle>
          <CardDescription>
            Showing {bookings.length} meeting{bookings.length === 1 ? '' : 's'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" aria-hidden="true" />
              <p>No {tab === 'all' ? '' : tab} meetings yet.</p>
              <p className="text-sm mt-2">
                Click <span className="font-medium">Schedule Meeting</span> to send a calendar invite.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.title}</TableCell>
                    <TableCell>
                      <div>{booking.attendee_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.attendee_email}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(booking.starts_at)}</TableCell>
                    <TableCell>{formatDuration(booking.starts_at, booking.ends_at)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{booking.provider}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.meeting_link ? (
                        <a
                          href={booking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          aria-label={`Open meeting link for ${booking.title}`}
                        >
                          Join
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
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
