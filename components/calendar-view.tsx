/**
 * Calendar View Component for Bookings
 */

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Booking {
  id: string
  title: string
  starts_at: string
  ends_at: string
  status: string
}

interface CalendarViewProps {
  bookings: Booking[]
}

export function CalendarView({ bookings }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.starts_at).toISOString().split('T')[0]
      return bookingDate === dateStr
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days = []
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startingDayOfWeek + 1
    const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth
    const date = isValidDay ? new Date(year, month, dayNumber) : null
    const dayBookings = date ? getBookingsForDate(date) : []
    const isToday = date && date.toDateString() === new Date().toDateString()

    days.push({
      dayNumber: isValidDay ? dayNumber : null,
      date,
      bookings: dayBookings,
      isToday,
    })
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{monthName}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => (
          <Card
            key={index}
            className={`min-h-[100px] p-2 ${
              day.dayNumber === null ? 'bg-muted/30' : ''
            } ${day.isToday ? 'border-primary border-2' : ''}`}
          >
            {day.dayNumber !== null && (
              <>
                <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-primary' : ''}`}>
                  {day.dayNumber}
                </div>
                <div className="space-y-1">
                  {day.bookings.map((booking) => (
                    <Link key={booking.id} href={`/portal/bookings/${booking.id}`}>
                      <div
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                          booking.status === 'cancelled'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        <div className="font-medium truncate">{booking.title}</div>
                        <div className="text-[10px]">
                          {new Date(booking.starts_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

