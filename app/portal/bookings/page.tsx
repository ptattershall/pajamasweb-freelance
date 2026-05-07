/**
 * Client Portal Bookings Page
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Video, Clock, List, CalendarDays } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarView } from '@/components/calendar-view'
import { TimezoneSelector } from '@/components/TimezoneSelector'
import { GOOGLE_CALENDAR_BOOKING_URL } from '@/lib/calendar-links'
import {
  getStoredTimezone,
  formatDateInTimezone,
  formatTimeInTimezone,
} from '@/lib/timezone-utils'

interface Booking {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  location: string | null
  meeting_link: string | null
  status: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [timeZone, setTimeZone] = useState<string>(() =>
    typeof window !== 'undefined' ? getStoredTimezone() : 'UTC'
  )

  useEffect(() => {
    if (typeof window !== 'undefined') setTimeZone(getStoredTimezone())
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/portal/bookings?tab=${tab}`)
        if (response.ok) {
          const data = await response.json()
          setBookings(data)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [tab])

  const formatDate = (dateString: string) =>
    formatDateInTimezone(dateString, timeZone)

  const formatTime = (dateString: string) =>
    formatTimeInTimezone(dateString, timeZone)

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    return `${minutes} min`
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-4xl font-bold">Bookings</h1>
          <TimezoneSelector
            showLabel
            onTimezoneChange={setTimeZone}
            className="shrink-0"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 mr-4">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="mr-2 h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          </div>
          <a href={GOOGLE_CALENDAR_BOOKING_URL} target="_blank" rel="noopener noreferrer">
            <Button>Open Google Calendar</Button>
          </a>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView bookings={bookings} timeZone={timeZone} />
      ) : (
        <>
          {/* Tabs */}
          <Tabs value={tab} onValueChange={(value) => setTab(value as 'upcoming' | 'past')} className="mb-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            {/* Bookings List */}
            <TabsContent value={tab} className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {tab} bookings</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <Link key={booking.id} href={`/portal/bookings/${booking.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{booking.title}</h3>
                        {booking.description && (
                          <p className="text-muted-foreground text-sm mt-1">{booking.description}</p>
                        )}

                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatDate(booking.starts_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>
                            {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{getDuration(booking.starts_at, booking.ends_at)}</span>
                        </div>
                      </div>

                      {booking.location && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <MapPin size={16} />
                          <span>{booking.location}</span>
                        </div>
                      )}

                      {booking.meeting_link && (
                        <div className="flex items-center gap-2 mt-3">
                          <Video size={16} className="text-primary" />
                          <a
                            href={booking.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  )
}

