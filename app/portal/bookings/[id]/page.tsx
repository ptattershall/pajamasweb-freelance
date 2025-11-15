/**
 * Client Portal Booking Details Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Video, Clock, ArrowLeft, Download, X, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface Booking {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  location: string | null
  meeting_link: string | null
  status: string
  attendee_name: string | null
  attendee_email: string | null
  external_id: string | null
  created_at: string
  notes: string | null
  agenda: string | null
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/portal/bookings/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data)
        } else {
          console.error('Failed to fetch booking')
        }
      } catch (error) {
        console.error('Error fetching booking:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBooking()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    return `${minutes} minutes`
  }

  const handleDownloadICS = async () => {
    if (!booking) return
    
    try {
      const response = await fetch(`/api/portal/bookings/${booking.id}/ics`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `booking-${booking.id}.ics`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading ICS:', error)
    }
  }

  const handleCancel = async () => {
    if (!booking || !confirm('Are you sure you want to cancel this booking?')) return
    
    setCancelling(true)
    try {
      const response = await fetch(`/api/portal/bookings/${booking.id}/cancel`, {
        method: 'POST',
      })
      
      if (response.ok) {
        alert('Booking cancelled successfully')
        router.push('/portal/bookings')
      } else {
        alert('Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Error cancelling booking')
    } finally {
      setCancelling(false)
    }
  }

  const handleReschedule = () => {
    if (!booking) return
    // Redirect to Cal.com reschedule page
    window.open(`https://cal.com/reschedule/${booking.external_id}`, '_blank')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-muted-foreground">Loading booking details...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-muted-foreground">Booking not found</div>
      </div>
    )
  }

  const isPastBooking = new Date(booking.starts_at) < new Date()
  const isCancelled = booking.status === 'cancelled'

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <Link href="/portal/bookings">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>
      </Link>

      {/* Booking Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{booking.title}</CardTitle>
              <CardDescription className="mt-2">
                {booking.description || 'No description provided'}
              </CardDescription>
            </div>
            <Badge variant={isCancelled ? 'destructive' : isPastBooking ? 'secondary' : 'default'}>
              {isCancelled ? 'Cancelled' : isPastBooking ? 'Completed' : 'Upcoming'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(booking.starts_at)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                  <span className="ml-2 text-xs">({getDuration(booking.starts_at, booking.ends_at)})</span>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location and Meeting Link */}
          <div className="space-y-4">
            {booking.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{booking.location}</p>
                </div>
              </div>
            )}
            {booking.meeting_link && (
              <div className="flex items-start space-x-3">
                <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Meeting Link</p>
                  <a
                    href={booking.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Attendee Information */}
          {booking.attendee_name && (
            <div>
              <p className="text-sm font-medium mb-2">Attendee</p>
              <p className="text-sm text-muted-foreground">{booking.attendee_name}</p>
              {booking.attendee_email && (
                <p className="text-sm text-muted-foreground">{booking.attendee_email}</p>
              )}
            </div>
          )}

          {/* Meeting Agenda */}
          {booking.agenda && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Agenda</p>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.agenda}
                </div>
              </div>
            </>
          )}

          {/* Meeting Notes */}
          {booking.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Notes</p>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.notes}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownloadICS} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download ICS
            </Button>

            {!isPastBooking && !isCancelled && (
              <>
                <Button onClick={handleReschedule} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  disabled={cancelling}
                >
                  <X className="mr-2 h-4 w-4" />
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              </>
            )}
          </div>

          {/* Booking Info */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Booking ID: {booking.id}
            </p>
            <p className="text-xs text-muted-foreground">
              Created: {formatDate(booking.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

