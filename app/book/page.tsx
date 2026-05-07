import { redirect } from 'next/navigation'
import { GOOGLE_CALENDAR_BOOKING_URL } from '@/lib/calendar-links'

export default function BookingPage() {
  redirect(GOOGLE_CALENDAR_BOOKING_URL)
}

