/**
 * Booking Status Tool for Vercel AI SDK
 * 
 * Provides clients with access to their meeting and booking information.
 * Only accessible to authenticated clients.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { getBookingSummary, getUpcomingBookings, formatBooking } from '@/lib/client-service';

export const bookingStatusInputSchema = z.object({
  userId: z.string().describe('The authenticated user ID'),
});

export type BookingStatusInput = z.infer<typeof bookingStatusInputSchema>;

/**
 * Booking status tool for Vercel AI SDK
 * 
 * Usage in chat:
 * - "When is my next meeting?"
 * - "Show me my upcoming bookings"
 * - "Do I have any calls scheduled?"
 * - "What meetings do I have this week?"
 */
export const bookingStatusTool = tool({
  description:
    'Get booking and meeting information for the authenticated client. Shows upcoming meetings, past bookings, and next scheduled call.',
  inputSchema: bookingStatusInputSchema,
  execute: async (params: BookingStatusInput) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required. Please log in to view your bookings.',
        };
      }

      const summary = await getBookingSummary(params.userId);
      const upcoming = await getUpcomingBookings(params.userId);

      // Format upcoming bookings
      const upcomingText = upcoming
        .map((booking) => {
          const start = new Date(booking.starts_at);
          const timeStr = start.toLocaleString();
          return `- ${booking.title} on ${timeStr}`;
        })
        .join('\n');

      // Format next booking
      let nextBookingText = 'No upcoming bookings scheduled.';
      if (summary.nextBooking) {
        const nextStart = new Date(summary.nextBooking.starts_at);
        const now = new Date();
        const daysUntil = Math.ceil(
          (nextStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        nextBookingText = `${summary.nextBooking.title} in ${daysUntil} days (${nextStart.toLocaleString()})`;
      }

      return {
        success: true,
        summary: {
          totalBookings: summary.total,
          upcomingCount: summary.upcoming,
          pastCount: summary.past,
        },
        nextBooking: nextBookingText,
        upcomingBookings: upcomingText || 'No upcoming bookings.',
        message: `You have ${summary.upcoming} upcoming meetings and ${summary.past} past bookings.`,
        cta:
          summary.upcoming === 0
            ? 'Would you like to schedule a meeting? I can help you book a time.'
            : `Your next meeting is ${nextBookingText}`,
      };
    } catch (error) {
      console.error('Error fetching booking status:', error);
      return {
        success: false,
        error: 'Failed to retrieve booking information. Please try again or contact support.',
      };
    }
  },
});

/**
 * Tool to get detailed booking information
 */
export const bookingDetailsTool = tool({
  description: 'Get detailed information about a specific booking or meeting',
  inputSchema: z.object({
    userId: z.string().describe('The authenticated user ID'),
    bookingId: z.string().optional().describe('Specific booking ID to look up'),
  }),
  execute: async (params) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required.',
        };
      }

      const bookings = await getUpcomingBookings(params.userId);

      if (params.bookingId) {
        const booking = bookings.find((b) => b.id === params.bookingId);
        if (!booking) {
          return {
            success: false,
            error: `Booking ${params.bookingId} not found.`,
          };
        }

        const start = new Date(booking.starts_at);
        const end = new Date(booking.ends_at);
        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

        return {
          success: true,
          booking: {
            id: booking.id,
            title: booking.title,
            description: booking.description,
            startsAt: start.toLocaleString(),
            endsAt: end.toLocaleString(),
            duration: `${duration} minutes`,
            attendeeEmail: booking.attendee_email,
            attendeeName: booking.attendee_name,
            status: booking.status,
            provider: booking.provider,
          },
        };
      }

      // Return all upcoming bookings if no specific ID provided
      return {
        success: true,
        bookings: bookings.map((booking) => ({
          id: booking.id,
          title: booking.title,
          startsAt: new Date(booking.starts_at).toLocaleString(),
          status: booking.status,
        })),
      };
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return {
        success: false,
        error: 'Failed to retrieve booking details.',
      };
    }
  },
});

